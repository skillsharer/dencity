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

function initMap(grid){
  for (let i = 0; i < canvasWidth; i++) {
    grid[i] = new Array(canvasHeight);
    for (let j = 0; j < canvasHeight; j++) {
      grid[i][j] = new Cell(i, j);
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

function defineBuildings(grid, minBuildingSize, maxBuildingSize, gridSize) {
  let buildings = [];

  function canPlaceBuilding(x, y, width, depth) {
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

  function placeBuilding(x, y, width, depth, baseType) {
    let buildingShapes;
    if (baseType === 'rectangle') {
      buildingShapes = ['BoxBuilding', 'CrossBuilding', 'SetBackBuilding'];
    } else {
      buildingShapes = ['BoxBuilding', 'CrossBuilding', 'SetBackBuilding', 'CylinderBuilding'];
    }

    const shape = buildingShapes[Math.floor(random() * buildingShapes.length)];
    
    // init the building
    let building;
    let height = random(minBuildingHeight, maxBuildingHeight);
    let top_frame = random(1) < 0.5;
    if (shape === 'BoxBuilding') {
      building = new BoxBuilding((x + width / 2), (y + depth / 2), height/2, width, depth, height, randomColor(), maxDisplacement, top_frame, width*0.03);
    }
    else if (shape === 'CrossBuilding') {
      building = new CrossBuilding((x + width / 2), (y + depth / 2), height/2, width, depth, height, randomColor(), maxDisplacement, top_frame, width*0.03);
    }
    else if (shape === 'SetBackBuilding') {
      let segment_ratios = random() > 0.5 ? [1, 0.7] : [1, 0.7, 0.5];
      building = new SetBackBuilding((x + width / 2), (y + depth / 2), 0, width, depth, height, randomColor(), maxDisplacement, top_frame, width*0.03, segment_ratios);
    }
    else if (shape === 'CylinderBuilding') {
      building = new CylinderBuilding((x + width / 2), (y + depth / 2), height/2, width, depth, height, randomColor(), maxDisplacement, 20);
    }
    if (building)
      buildings.push(building);

    for (let i = x - gridSize; i < x + width + gridSize; i++) {
        for (let j = y - gridSize; j < y + depth + gridSize; j++) {
            if(i < x || i >= x + width || j < y || j >= y + depth) {
                grid[i][j].setType('border');
            } else {
                grid[i][j].setType('building');
            }
        }
    }
  }

  let points = [];
  for (let i = gridSize; i < grid.length - 1 - gridSize; i += gridSize) {
      for (let j = gridSize; j < grid[0].length - 1 - gridSize; j += gridSize) {
          if (i % gridSize === 0 && j % gridSize === 0) {
              points.push({x: i, y: j});
          }
      }
  }

  points.sort(() => random() - 0.5);

  for (let point of points) {
      let baseType = random() > 0.5 ? 'rectangle' : 'square';
      let width, depth;

      if (baseType === 'rectangle') {
          width = Math.floor((random() * (maxBuildingSize - minBuildingSize + 1) + minBuildingSize) / gridSize) * gridSize;
          depth = Math.floor((random() * (maxBuildingSize - minBuildingSize + 1) + minBuildingSize) / gridSize) * gridSize;
      } else {
          width = depth = Math.floor((random() * (maxBuildingSize - minBuildingSize + 1) + minBuildingSize) / gridSize) * gridSize;
      }

      if (canPlaceBuilding(point.x, point.y, width, depth)) {
          placeBuilding(point.x, point.y, width, depth, baseType);
      }
  }

  return buildings;
}