class Cell {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.type = null;
  }
  setType(newType) {
    this.type = newType;
  }
}

class Intersection extends Cell {
  constructor(x, y) {
    super(x, y);
    this.type = 'intersection';
    this.connectedIntersections = [];
  }

  addConnection(intersection) {
    this.connectedIntersections.push(intersection);
  }
}

function setCellTypes(grid, positions, newType) {
  positions.forEach((pos) => {
    const [x, y] = pos;
    if (x < grid.length && y < grid[x].length) {
      grid[x][y].setType(newType);
    }
  });
}

function initMap(grid, width, height){
  for (let i = 0; i < width; i++) {
    grid[i] = new Array(height);
    for (let j = 0; j < height; j++) {
      grid[i][j] = new Cell(i, j);
      grid[i][j].setType(null);
    }
  }
  return grid;
}

function debugCellType(grid){
  for (let i = 0; i < canvasWidth; i++) {
    for (let j = 0; j < canvasHeight; j++) {
      if (grid[i][j].type === 'road'){
        strokeWeight(1);
        stroke(255,0,0);
        point(i,j);
      } else if (grid[i][j].type === 'intersection'){
        strokeWeight(1);
        stroke(0,255,0);
        point(i,j); 
      }else if (grid[i][j].type === 'border'){
        strokeWeight(1);
        stroke(10,170,255);
        point(i,j);
      }else if (grid[i][j].type === 'building'){
        strokeWeight(1);
        stroke(128,255,0);
        point(i,j);
      }else{
        continue;
      }
    }
  }
}

function canPlaceBuilding(x, y, width, depth, grid, gridSize) {
  if (x + width + gridSize > grid.length || y + depth + gridSize > grid[0].length || x - gridSize < 0 || y - gridSize < 0) {
    return false;
  }

  for (let i = x - gridSize; i < x + width + gridSize; i++) {
    for (let j = y - gridSize; j < y + depth + gridSize; j++) {
      if (grid[i][j].type !== null) {
        return false;
      }
    }
  }

  return true;
}

function generateRandomValues(baseType) {
  let buildingShapeIndex;
  if (baseType === 'rectangle') {
    buildingShapeIndex = Math.floor($fx.rand() * 3);
  } else {
    buildingShapeIndex = Math.floor($fx.rand() * 4);
  }
  let height = $fx.rand() * (maxBuildingHeight - minBuildingHeight + 1) + minBuildingHeight;
  let top_frame = $fx.rand() > 0.5 ? true : false;
  let color = randomColor();
  let segment_ratios = $fx.rand() > 0.5 ? [1, 0.7] : [1, 0.7, 0.5];
  let segment_size = height * 0.01;
  return {buildingShapeIndex, height, top_frame, color, segment_ratios, segment_size};
}

function placeBuilding(x, y, width, depth, baseType, grid, gridSize, buildings_array, buildingShapeIndex, height, top_frame, color, segment_ratios, segment_size, maxDisplacement) {
  let buildingShapes;
  if (baseType === 'rectangle') {
    buildingShapes = ['BoxBuilding', 'CrossBuilding', 'SetBackBuilding'];
  } else {
    buildingShapes = ['BoxBuilding', 'CrossBuilding', 'SetBackBuilding', 'CylinderBuilding'];
  }

  const shape = buildingShapes[buildingShapeIndex % buildingShapes.length];
  
  // init the building
  let building;
  if (shape === 'BoxBuilding') {
    building = new BoxBuilding((x + width / 2), (y + depth / 2), height/2, width, depth, height, color, maxDisplacement, top_frame, segment_size);
  }
  else if (shape === 'CrossBuilding') {
    building = new CrossBuilding((x + width / 2), (y + depth / 2), height/2, width, depth, height, color, maxDisplacement, top_frame, segment_size);
  }
  else if (shape === 'SetBackBuilding') {
    building = new SetBackBuilding((x + width / 2), (y + depth / 2), 0, width, depth, height, color, maxDisplacement, top_frame, segment_size, segment_ratios);
  }
  else if (shape === 'CylinderBuilding') {
    building = new CylinderBuilding((x + width / 2), (y + depth / 2), height/2, width, depth, height, color, maxDisplacement, 20);
  }
  if (building)
    buildings_array.push(building);

  for (let i = x - gridSize; i < x + width + gridSize; i++) {
    for (let j = y - gridSize; j < y + depth + gridSize; j++) {
      if(i < x || i >= x + width || j < y || j >= y + depth) {
        grid[i][j].setType('border');
      } else {
        grid[i][j].setType('building');
      }
    }
  }
  return buildings_array;
}

function defineBuildings(grid, minBuildingSize, maxBuildingSize, gridSize, maxDisplacement) {
  let buildings_array = [];
  let points = [];

  for (let i = gridSize; i < grid.length - 1 - gridSize; i += gridSize) {
    for (let j = gridSize; j < grid[0].length - 1 - gridSize; j += gridSize) {
      if (i % gridSize === 0 && j % gridSize === 0) {
        points.push({x: i, y: j});
      }
    }
  }

  points.sort((a, b) => {
    if (a.y === b.y) {
      return a.x - b.x;
    }
    return a.y - b.y;
  });
  
  for (let point of points) {
    let baseType = $fx.rand() > 0.5 ? 'rectangle' : 'square';
    let width, depth;

    if (baseType === 'rectangle') {
      width = Math.floor(($fx.rand() * (maxBuildingSize - minBuildingSize + 1) + minBuildingSize) / gridSize) * gridSize;
      depth = Math.floor(($fx.rand() * (maxBuildingSize - minBuildingSize + 1) + minBuildingSize) / gridSize) * gridSize;
    } else {
      width = depth = Math.floor(($fx.rand() * (maxBuildingSize - minBuildingSize + 1) + minBuildingSize) / gridSize) * gridSize;
    }
    if (canPlaceBuilding(point.x, point.y, width, depth, grid, gridSize)) {
      let randomValues = generateRandomValues(baseType);
      placeBuilding(point.x, point.y, width, depth, baseType, grid, gridSize, buildings_array, randomValues.buildingShapeIndex, randomValues.height, randomValues.top_frame, randomValues.color, randomValues.segment_ratios, randomValues.segment_size, maxDisplacement);   
    }
  }

  return buildings_array;
}