// Base Map settings
let canvasWidth = 600;
let canvasHeight = canvasWidth*1.5;
let gridSize = 4;
let intersectBorder = gridSize*20;
let mapBorder = gridSize*2;
let roadBorder = gridSize;
let intersectionDensity = 0.4;
let minBuildingSize = 30;
let maxBuildingSize = minBuildingSize*3;
let debug = false;
let colors = [];
let maxDisplacement = 0.5;

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

function getPixels(x0, y0, x1, y1, strokeWidth) {
  var pixels = [];
  var halfStrokeWidth = Math.floor(strokeWidth / 2);

  // If the line is vertical
  if (x0 === x1) {
    let startY = Math.min(y0, y1);
    let endY = Math.max(y0, y1);
    
    for (let y = startY; y <= endY; y++) {
      for (let w = -halfStrokeWidth; w <= halfStrokeWidth; w++) {
        pixels.push([x0 + w, y]);
      }
    }
  }

  // If the line is horizontal
  else if (y0 === y1) {
    let startX = Math.min(x0, x1);
    let endX = Math.max(x0, x1);
    
    for (let x = startX; x <= endX; x++) {
      for (let w = -halfStrokeWidth; w <= halfStrokeWidth; w++) {
        pixels.push([x, y0 + w]);
      }
    }
  }
  return pixels;
}


function setup() {
  const colorValues = [
    [90, 105, 136],
    [217, 225, 233],
    [134, 149, 165],
    [181, 190, 198],
    [65, 78, 91],
    [255, 219, 153],
    [198, 168, 125],
    [255, 214, 90],
    [255, 158, 73],
    [242, 85, 96],
    [45, 156, 219],
    [135, 196, 64],
    [183, 149, 11],
    [230, 126, 34],
    [105, 78, 53],
    [204, 142, 105],
    [248, 227, 196],
    [122, 110, 84],
    [143, 172, 193],
    [177, 144, 113],
    [237, 201, 161]
  ];

  colorValues.forEach(colorValue => {
    colors.push(color(...colorValue));
  });
  pixelDensity(1); // ensures one unit in the canvas corresponds to one pixel
  createCanvas(canvasWidth, canvasHeight, WEBGL);
  noLoop();
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


function populateIntersections(grid, intersections){
  for (let i = mapBorder; i < canvasWidth; i+=intersectBorder){
    for (let j = mapBorder; j < canvasHeight; j+=intersectBorder){
      if (j % gridSize === 0 && i % gridSize === 0){
        if (Math.random() < intersectionDensity) {
          let intersection = new Intersection(i, j);
          intersections.push(intersection);
          grid[i][j] = intersection; 
          if (debug){
             // Draw a point at this position
            stroke(0, 0, 0); // Color of the border (black)
            strokeWeight(7); // Width of the border
            point(i, j);
            stroke(255, 255, 255); // Color of the road (white)
            strokeWeight(5);   // Width of the road
            point(i, j);
          }
        }
      }
    }
  }
  return [grid, intersections]
}

function defineRoads(grid, intersections) {
    // First pass: Draw horizontal roads
    for (let intersection of intersections) {
        let x = intersection.x;
        let y = intersection.y;
        let validHorizontalRoad = true;

        // Search horizontally to the right
        for (let i = x + gridSize; i < canvasWidth; i += gridSize) {
            if (grid[i][y].type === 'intersection' && validHorizontalRoad) {
                // Check if horizontal road can be drawn
                for (let roadX = x + 1; roadX < i; roadX++) {
                    if (grid[roadX][y].type !== null) {
                        validHorizontalRoad = false;
                        break;
                    }
                }
                // Draw horizontal road
                if (validHorizontalRoad) {
                  if (debug) {
                    for (let roadX = x + 1; roadX < i; roadX++) {
                      stroke(118, 188, 196); // Road color
                      strokeWeight(1);
                      point(roadX, y);
                    }
                  }
                  roadPixels = getPixels(x+1,y,i-1,y, 2*gridSize);
                  intersection.addConnection(grid[i][y]);
                  grid[i][y].addConnection(intersection);
                  setCellTypes(grid, roadPixels, 'road');
                  drawRoad(x,y,i,y);
                }
            }
        }
    }
    
    // Second pass: Draw vertical roads
    for (let intersection of intersections) {
        let x = intersection.x;
        let y = intersection.y;
        let validVerticalRoad = true;

        // Search vertically downwards
        for (let j = y + gridSize; j < canvasHeight; j += gridSize) {
            if (grid[x][j].type === 'intersection' && validVerticalRoad) {
                // Check if vertical road can be drawn
                for (let roadY = y + 1; roadY < j; roadY++) {
                    if (grid[x][roadY].type === 'road') {
                        validVerticalRoad = false;
                        break;
                    }
                }
                // Draw vertical road
                if (validVerticalRoad) {
                  if (debug) {
                    for (let roadY = y + 1; roadY < j; roadY++) {
                        stroke(118, 188, 196); // Road color
                        strokeWeight(1);
                        point(x, roadY);
                      }
                    }
                  roadPixels = getPixels(x,y+1,x,j-1, 2*gridSize);
                  intersection.addConnection(grid[x][j]);
                  grid[x][j].addConnection(intersection);
                  setCellTypes(grid, roadPixels, 'road');
                  drawRoad(x,y,x,j);
                }
            }
        }
    }
}

function drawDashedLines(startX, startY, endX, endY){
  let dx = endX - startX;
  let dy = endY - startY;
  let roadLength = Math.sqrt(dx * dx + dy * dy);
  let roadDirX = dx / roadLength;
  let roadDirY = dy / roadLength;
  let numOfSegments = Math.floor(roadLength / gridSize);
  let gapFactor = 0.5;  // Adjust this to change gap length, value should be between 0 and 1
  let dashLength = (1 - gapFactor) * gridSize;
  let gapLength = gapFactor * gridSize / 2;  // Half of the gap on each side
  stroke(255,255,255);
  strokeWeight(1);
  for (let i = 0; i < numOfSegments; i++){
    let currXStart = startX + (i * gridSize + gapLength) * roadDirX;
    let currYStart = startY + (i * gridSize + gapLength) * roadDirY;
    let currXEnd = currXStart + dashLength * roadDirX;
    let currYEnd = currYStart + dashLength * roadDirY;
    
    dispX = random(-maxDisplacement, maxDisplacement);
    dispY = random(-maxDisplacement, maxDisplacement);
    currXEnd += dispX;
    currYEnd += dispY;
    
    line(currXStart, currYStart, currXEnd, currYEnd);
  }
}

function drawRoad(startX, startY, endX, endY, borderOffset = gridSize) {
    // Base road
    stroke(150,150,150);
    strokeWeight(2*gridSize);
    line(startX, startY, endX, endY);  
    let borderDistance = gridSize; // Distance of the border from the road
    // Calculate the direction of the road
    let dx = endX - startX;
    let dy = endY - startY;
    let roadLength = Math.sqrt(dx * dx + dy * dy);
    let roadDirX = dx / roadLength;
    let roadDirY = dy / roadLength;
    let desiredSegmentLength = Math.floor(roadLength / 2); // Desired length of each border segment
    // Calculate a vector perpendicular to the road
    let perpDirX = roadDirY;
    let perpDirY = -roadDirX;

    // Calculate the number of steps based on the desired segment length
    let borderLength = roadLength - 2 * borderOffset;
    let numSteps = Math.ceil(borderLength / desiredSegmentLength);

    stroke(0, 0, 0); // Border color
    strokeWeight(1); // Border width

    // Draw border on both sides of the road
    for (let side = -1; side <= 1; side += 2) {
        // Determine the start and end of the border
        let borderStartX = startX + borderOffset * roadDirX + side * borderDistance * perpDirX;
        let borderStartY = startY + borderOffset * roadDirY + side * borderDistance * perpDirY;
        let borderEndX = endX - borderOffset * roadDirX + side * borderDistance * perpDirX;
        let borderEndY = endY - borderOffset * roadDirY + side * borderDistance * perpDirY;

        let prevX = borderStartX;
        let prevY = borderStartY;

        // Draw the border in numSteps segments
        for (let i = 1; i <= numSteps; i++) {
            // Calculate the nominal end point of this segment
            let t = i / numSteps;
            let endX = borderStartX + t * (borderEndX - borderStartX);
            let endY = borderStartY + t * (borderEndY - borderStartY);

            // Add a small random displacement to the end point
            let dispX = 0;
            let dispY = 0;
            if (i !== numSteps){
              dispX = random(-maxDisplacement, maxDisplacement);
              dispY = random(-maxDisplacement, maxDisplacement); 
            }
            
            endX += dispX;
            endY += dispY;

            // Draw this segment
            line(prevX, prevY, endX, endY);

            // Prepare for the next segment
            prevX = endX;
            prevY = endY;
        }
    }
}

function countNumRoads(grid, intersection){
  let directions = [[0, -1, 'north'], [0, 1, 'south'], [-1, 0, 'west'], [1, 0, 'east']]; // up, down, left, right
  let numRoads = 0;
  let roads = [];
  let x = intersection.x;
  let y = intersection.y;
  for (let dir of directions){
      let dx = dir[0];
      let dy = dir[1];
      let dirName = dir[2];
      let nx = x + dx * gridSize; // neighbor's x-coordinate
      let ny = y + dy * gridSize; // neighbor's y-coordinate

      // Check if the neighbor is within the grid and is a road
      if (nx >= 0 && nx < canvasWidth && ny >= 0 && ny < canvasHeight &&
          grid[nx][ny].type === 'road') {
        numRoads++;
        roads.push(dirName);  // Store the direction of the road
      }
  }
  return {numRoads, roads};
}


function finalizeMap(grid, intersections){
  fill(150,150,150);
  noStroke();

  intersections = intersections.filter(intersection => {
    let x = intersection.x - gridSize;
    let y = intersection.y - gridSize;
    let roadsInfo = countNumRoads(grid, intersection);
    let numRoads = roadsInfo.numRoads;
    let directions = roadsInfo.roads;
    if (numRoads > 0){
      rect(x,y,2*gridSize,2*gridSize);
      stroke(0,0,0);  // Set stroke color for borders
      if(!directions.includes('north')) {
        line(x, y, x + 2*gridSize, y);  // Draw border at the north
      }
      if(!directions.includes('south')) {
        line(x, y + 2*gridSize, x + 2*gridSize, y + 2*gridSize);  // Draw border at the south
      }
      if(!directions.includes('west')) {
        line(x, y, x, y + 2*gridSize);  // Draw border at the west
      }
      if(!directions.includes('east')) {
        line(x + 2*gridSize, y, x + 2*gridSize, y + 2*gridSize);  // Draw border at the east
      }
      noStroke();  // Reset stroke
      
      // Draw crosswalks
      if (numRoads > 2){
        let numOfCrossWalkLines = 4; // For each half of the road
        let crossWalkLength = 2 * gridSize;
        let gapLength = Math.floor(2 * gridSize / (numOfCrossWalkLines + 1));
        let ix = intersection.x;
        let iy = intersection.y;
        for (let dir of directions){
          switch(dir) {
            case 'north':
              fill(150,150,150);
              noStroke();
              rect(x + Math.floor(gridSize/2),y-2*gridSize, gridSize, 2*gridSize);

              stroke(255,255,255);
              strokeWeight(1);
              for (let i = 0; i < numOfCrossWalkLines; ++i){
                  let randLength = random(1.7*gridSize-0.2,1.7*gridSize);
                  let dispX = random(-maxDisplacement, maxDisplacement);
                  let dispY = random(-maxDisplacement, maxDisplacement);
                  let cwStartX = x + gapLength + i * gapLength;
                  let cwStartY = y;
                  let cwEndX = cwStartX + dispX;
                  let cwEndY = cwStartY - randLength + dispY;
                  line(cwStartX, cwStartY, cwEndX, cwEndY);
              }
              break;
            case 'south':
              fill(150,150,150);
              noStroke();
              rect(x + Math.floor(gridSize/2), y + 2*gridSize, gridSize, 2*gridSize);

              stroke(255,255,255);
              strokeWeight(1);
              for (let i = 0; i < numOfCrossWalkLines; ++i){
                  let randLength = random(1.7*gridSize-0.2,1.7*gridSize);
                  let dispX = random(-maxDisplacement, maxDisplacement);
                  let dispY = random(-maxDisplacement, maxDisplacement);
                  let cwStartX = x + gapLength + i * gapLength;
                  let cwStartY = y + 2*gridSize;
                  let cwEndX = cwStartX + dispX;
                  let cwEndY = cwStartY + randLength + dispY;
                  line(cwStartX, cwStartY, cwEndX, cwEndY);
              }
              break;
            case 'west':
              fill(150,150,150);
              noStroke();
              rect(x - 2*gridSize, y + Math.floor(gridSize/2), 2*gridSize, gridSize);

              stroke(255,255,255);
              strokeWeight(1);
              for (let i = 0; i < numOfCrossWalkLines; ++i){
                  let randLength = random(1.7*gridSize-0.2,1.7*gridSize);
                  let dispX = random(-maxDisplacement, maxDisplacement);
                  let dispY = random(-maxDisplacement, maxDisplacement);
                  let cwStartX = x;
                  let cwStartY = y + gapLength + i * gapLength;
                  let cwEndX = cwStartX - randLength + dispX;
                  let cwEndY = cwStartY + dispY;
                  line(cwStartX, cwStartY, cwEndX, cwEndY);
              }
              break;
            case 'east':
              fill(150,150,150);
              noStroke();
              rect(x + 2*gridSize, y + Math.floor(gridSize/2), 2*gridSize, gridSize);

              stroke(255,255,255);
              strokeWeight(1);
              for (let i = 0; i < numOfCrossWalkLines; ++i){
                  let randLength = random(1.7*gridSize-0.2,1.7*gridSize);
                  let dispX = random(-maxDisplacement, maxDisplacement);
                  let dispY = random(-maxDisplacement, maxDisplacement);
                  let cwStartX = x + 2*gridSize;
                  let cwStartY = y + gapLength + i * gapLength;
                  let cwEndX = cwStartX + randLength + dispX;
                  let cwEndY = cwStartY + dispY;
                  line(cwStartX, cwStartY, cwEndX, cwEndY);
              }
              break;
          }
        }
        noStroke(); // Reset stroke
      }
      return true;  // keep this intersection
    } else {
      console.log("Removed intersection");
      grid[intersection.x][intersection.y].type = null;
      return false;  // exclude this intersection
    }
  });
}

function defineBorders(grid, borderWidth) {
    // Iterate over all cells in the grid
    for (let i = 0; i < canvasWidth; i++) {
        for (let j = 0; j < canvasHeight; j++) {
            // If the current cell is a road
            if (grid[i][j].type === 'road') {
                // Check all neighboring cells within the border width
                for (let dx = -borderWidth; dx <= borderWidth; dx++) {
                    for (let dy = -borderWidth; dy <= borderWidth; dy++) {
                        // Ensure the neighbor cell is within the grid boundaries
                        if (i + dx >= 0 && i + dx < canvasWidth && j + dy >= 0 && j + dy < canvasHeight) {
                            // If the neighboring cell isn't a road or an intersection, make it a border
                            if (grid[i + dx][j + dy].type !== 'road' && grid[i + dx][j + dy].type !== 'intersection') {
                                grid[i + dx][j + dy].setType('border');
                            }
                        }
                    }
                }
            }
        }
    }
}

function calculateOffset(start, end, adjustment) {
    if (start < end) {
        return start + adjustment;
    } else {
        return start - adjustment;
    }
}

function drawDashedLinesBetweenIntersections(intersections) {
    const adjustment = 3 * gridSize;
    for (let intersection of intersections) {
        for (let connection of intersection.connectedIntersections) {
            // Calculate start and end coordinates
            let startX = intersection.x;
            let startY = intersection.y;
            let endX = connection.x;
            let endY = connection.y;

            // Check if the intersections are vertically aligned
            if (startX === endX) {
                if (intersection.connectedIntersections.length > 2) {
                    startY = calculateOffset(startY, endY, adjustment);
                }
                if (connection.connectedIntersections.length > 2) {
                    endY = calculateOffset(endY, startY, adjustment);
                }
            } 
            // Check if the intersections are horizontally aligned
            else {
                if (intersection.connectedIntersections.length > 2) {
                    startX = calculateOffset(startX, endX, adjustment);
                }
                if (connection.connectedIntersections.length > 2) {
                    endX = calculateOffset(endX, startX, adjustment);
                }
            }

            // Draw dashed line from intersection to connection
            drawDashedLines(startX, startY, endX, endY);
        }
    }
}

function drawDashedLines(startX, startY, endX, endY){
  let dx = endX - startX;
  let dy = endY - startY;
  let roadLength = Math.sqrt(dx * dx + dy * dy);
  let roadDirX = dx / roadLength;
  let roadDirY = dy / roadLength;
  let numOfSegments = Math.floor(roadLength / gridSize);
  let gapFactor = 0.5;  // Adjust this to change gap length, value should be between 0 and 1
  let dashLength = (1 - gapFactor) * gridSize;
  let gapLength = gapFactor * gridSize / 2;  // Half of the gap on each side
  stroke(255,255,255);
  strokeWeight(1);
  for (let i = 0; i < numOfSegments; i++){
    let currXStart = startX + (i * gridSize + gapLength) * roadDirX;
    let currYStart = startY + (i * gridSize + gapLength) * roadDirY;
    let currXEnd = currXStart + dashLength * roadDirX;
    let currYEnd = currYStart + dashLength * roadDirY;
    
    dispX = random(-maxDisplacement, maxDisplacement);
    dispY = random(-maxDisplacement, maxDisplacement);
    currXEnd += dispX;
    currYEnd += dispY;
    
    line(currXStart, currYStart, currXEnd, currYEnd);
  }
}

// BUILDINGS DEFINITIONS

function drawBuilding(building) {
  rotateX(HALF_PI);
  
  // Draw the building
  let buildingColor = colors[Math.floor(Math.random() * colors.length)];
  fill(buildingColor);

  if (building.shape === 'rectangle'){
    box(building.width, building.height, building.depth);
    drawHandDrawnBox(building, maxDisplacement);
    drawWindows(building);
  } else {
    if (random(0,1) < 0.1){
      cylinder(building.width/2, building.height);
      drawCylinderWindows(building);
    }else {
      box(building.width, building.height, building.depth);
      drawHandDrawnBox(building, maxDisplacement);
      drawWindows(building);
    }
  }
}

function drawCylinderWindows(building) {
    push();

    // Colors for window
    fill(100, 100, 250, 150);  // Semi-transparent blue for window
    stroke(0);  // Black border

    // Calculate the circumference
    const circumference = Math.PI * building.width;  // Using width as diameter

    // Calculate number of windows based on available space and window size
    let numWindowsAround = Math.floor(circumference / building.windowSizeX);
    let numWindowsVertical = Math.floor(building.height / building.windowSizeY);
    //console.log(numWindowsAround);

    // Calculate the angular distance between windows
    let angleBetweenWindows = TWO_PI / numWindowsAround;

    // Draw windows
    for (let i = 0; i < numWindowsAround; i++) {
        for (let j = 0; j < numWindowsVertical; j++) {
            let xCenter = (building.width / 2) * Math.cos(i * angleBetweenWindows);
            let yCenter = j * building.windowSizeY - building.height/2;
            let zCenter = (building.width / 2) * Math.sin(i * angleBetweenWindows);

            // Points for the window
            let topLeft = createVector(xCenter - (building.windowSizeX / 2) * Math.sin(i * angleBetweenWindows),
                                      yCenter,
                                      zCenter + (building.windowSizeX / 2) * Math.cos(i * angleBetweenWindows));

            let topRight = createVector(xCenter + (building.windowSizeX / 2) * Math.sin(i * angleBetweenWindows),
                                      yCenter,
                                      zCenter - (building.windowSizeX / 2) * Math.cos(i * angleBetweenWindows));

            let bottomLeft = createVector(xCenter - (building.windowSizeX / 2) * Math.sin(i * angleBetweenWindows),
                                      yCenter + building.windowSizeY,
                                      zCenter + (building.windowSizeX / 2) * Math.cos(i * angleBetweenWindows));

            let bottomRight = createVector(xCenter + (building.windowSizeX / 2) * Math.sin(i * angleBetweenWindows),
                                      yCenter + building.windowSizeY,
                                      zCenter - (building.windowSizeX / 2) * Math.cos(i * angleBetweenWindows));

            beginShape();
            vertex(topLeft.x, topLeft.y, topLeft.z);
            vertex(topRight.x, topRight.y, topRight.z);
            vertex(bottomRight.x, bottomRight.y, bottomRight.z);
            vertex(bottomLeft.x, bottomLeft.y, bottomLeft.z);
            endShape(CLOSE);
        }
    }

    pop();
}

function check_quarter(building) {
  /*
  0: Top-left
  1: Top-Right
  2: Bottom-left
  3: Bottom-right
  */
  let horizontal = (building.x <= canvasWidth / 2) ? 0 : 1;
  let vertical = (building.y <= canvasHeight / 2) ? 0 : 1;
  return 2 * vertical + horizontal;
}


function drawWindows(building) {
    const quarter = check_quarter(building);

    const actualWindowSizeX = building.windowSizeX - building.gapSizeX;
    const actualWindowSizeY = building.windowSizeY - building.gapSizeY;
    const actualWindowSizeZ = building.windowSizeZ - building.gapSizeZ;

    fill(100, 100, 250, 150);
    stroke(0);

    const numWindowsX = Math.floor(building.width / building.windowSizeX);
    const numWindowsY = Math.floor(building.height / building.windowSizeY);
    const numWindowsZ = Math.floor(building.depth / building.windowSizeZ);

    const halfWidth = -building.width / 2;
    const halfHeight = -building.height / 2;
    const halfDepth = -building.depth / 2;
  
    const halfGapSizeX = building.gapSizeX/2;
    const halfGapSizeY = building.gapSizeY/2;
    const halfGapSizeZ = building.gapSizeZ/2;

    const displacedVertex = (x, y, z = undefined, displacements) => { 
        if (z === undefined) {
            vertex(x + displacements[0], y + displacements[1]);
        } else {
            vertex(x + displacements[0], y + displacements[1], z);
        }
    };

    const calculateVertices = (i, j, face) => {
        const ix = halfWidth + i * building.windowSizeX + halfGapSizeX;
        const jy = j * building.windowSizeY + halfGapSizeY;
        const iz = halfDepth + i * building.windowSizeZ + halfGapSizeZ;

        const displacements = Array.from({ length: 4 }, () => [
            random(-maxDisplacement, maxDisplacement),
            random(-maxDisplacement, maxDisplacement)
        ]);

        switch (face) {
            case 'front':
                return displacements.map((d, idx) => {
                    const base = [
                        [ix, jy],
                        [ix + actualWindowSizeX, jy],
                        [ix + actualWindowSizeX, jy + actualWindowSizeY],
                        [ix, jy + actualWindowSizeY]
                    ];
                    return [base[idx][0] + d[0], base[idx][1] + d[1]];
                });
            case 'right':
                return displacements.map((d, idx) => {
                    const base = [
                        [building.width / 2, jy, iz],
                        [building.width / 2, jy + actualWindowSizeY, iz],
                        [building.width / 2, jy + actualWindowSizeY, iz + actualWindowSizeZ],
                        [building.width / 2, jy, iz + actualWindowSizeZ]
                    ];
                    return [base[idx][0] + d[0], base[idx][1] + d[1], base[idx][2]];
                });
            case 'left':
                return displacements.map((d, idx) => {
                    const base = [
                        [halfWidth, jy, iz],
                        [halfWidth, jy + actualWindowSizeY, iz],
                        [halfWidth, jy + actualWindowSizeY, iz + actualWindowSizeZ],
                        [halfWidth, jy, iz + actualWindowSizeZ]
                    ];
                    return [base[idx][0] + d[0], base[idx][1] + d[1], base[idx][2]];
                });
            case 'back':
                return displacements.map((d, idx) => {
                    const base = [
                        [ix, jy, building.depth/2],
                        [ix + actualWindowSizeX, jy, building.depth/2],
                        [ix + actualWindowSizeX, jy + actualWindowSizeY, building.depth/2],
                        [ix, jy + actualWindowSizeY, building.depth/2]
                    ];
                    return [base[idx][0] + d[0], base[idx][1] + d[1], base[idx][2]];
                });
        }
    };

    const drawFaceWindows = (face, numX, numY, translateX, translateY, translateZ) => {
        push();
        translate(translateX, translateY, translateZ);
        for (let i = 0; i < numX; i++) {
            for (let j = 0; j < numY; j++) {
                const vertices = calculateVertices(i, j, face);
                beginShape();
                vertices.forEach(v => vertex(...v)); // Directly use the displaced vertices
                endShape(CLOSE);
            }
        }
        pop();
    };

    if ([0, 1].includes(quarter)) drawFaceWindows('front', numWindowsX, numWindowsY, 0, halfHeight, halfDepth - 1);
    if ([0, 2].includes(quarter)) drawFaceWindows('right', numWindowsZ, numWindowsY, 1, halfHeight, 0);
    if ([1, 3].includes(quarter)) drawFaceWindows('left', numWindowsZ, numWindowsY, -1, halfHeight, 0);
    if ([2, 3].includes(quarter)) drawFaceWindows('back', numWindowsX, numWindowsY, 0, halfHeight, 1);
}

function drawHandDrawnCylinder(building, maxDisplacement) {
    // Draw the windows
    fill(0);
  
    // Calculate windows and spacings
    let radius = building.width / 2;
    let circumference = PI * building.width;  // using the full width since width = 2 * radius
    let windowsInCircumference = Math.floor(circumference / building.windowSizeX);
    let spacingAngle = TWO_PI / windowsInCircumference;
  
    for (let z = building.height / 2 - building.windowSizeY; z > -building.height / 2 + building.windowSizeY; z -= building.windowSizeY * 2) {
        for (let i = 0; i < windowsInCircumference; i++) {
            let angle = i * spacingAngle;
            
            // Convert polar coordinates (angle and distance from center) to cartesian coordinates
            let x = radius * cos(angle);
            let y = radius * sin(angle);
            
            push();
            translate(y, z, x);  // Adjust window position
            rotateY(angle);     // Rotate window to face outwards
            drawHandDrawnRect(0, 0, building.windowSizeX, building.windowSizeY, maxDisplacement);
            pop();
        }
    }
}

function drawHandDrawnBox(building, maxDisplacement) {
    stroke(0);
    strokeWeight(1);

    const disp = () => random(-maxDisplacement, maxDisplacement);

    const points = [
        [-building.width/2, -building.height/2, building.depth/2],
        [building.width/2, -building.height/2, building.depth/2],
        [building.width/2, building.height/2, building.depth/2],
        [-building.width/2, building.height/2, building.depth/2],
        [-building.width/2, -building.height/2, -building.depth/2],
        [building.width/2, -building.height/2, -building.depth/2],
        [building.width/2, building.height/2, -building.depth/2],
        [-building.width/2, building.height/2, -building.depth/2]
    ].map(pt => pt.map(val => val + disp()));

    const edgesToDraw = [
        [points[0], points[1]],
        [points[1], points[2]],
        [points[2], points[3]],
        [points[3], points[0]],
        [points[4], points[5]],
        [points[5], points[6]],
        [points[6], points[7]],
        [points[7], points[4]],
        [points[0], points[4]],
        [points[1], points[5]],
        [points[2], points[6]],
        [points[3], points[7]]
    ];

    for (const edge of edgesToDraw) {
        line(...edge[0], ...edge[1]);
    }
}

class Building {
    constructor(x, y, width, depth, shape) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.depth = depth;
        this.height = random(100,300);
        this.shape = shape;
    }
    
    setWindowSize(){
      this.windowSizeX = this.width / random(1,15);
      this.windowSizeY = this.height / random(1,15);
      this.windowSizeZ = this.depth / random(1,15);
      this.gapSizeX = this.windowSizeX / random(1,10);
      this.gapSizeY = this.windowSizeY / random(1,10);
      this.gapSizeZ = this.windowSizeZ /random(1,10);
    }
}

function defineBuildings(grid) {
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

    function placeBuilding(x, y, width, depth, shape) {
        let building = new Building(x, y, width, depth, shape);
        building.setWindowSize();
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

    points.sort(() => Math.random() - 0.5);

    for (let point of points) {
        let shape = Math.random() < 0.5 ? 'square' : 'rectangle';
        let width, depth;

        if (shape === 'rectangle') {
            width = Math.floor((Math.random() * (maxBuildingSize - minBuildingSize + 1) + minBuildingSize) / gridSize) * gridSize;
            depth = Math.floor((Math.random() * (maxBuildingSize - minBuildingSize + 1) + minBuildingSize) / gridSize) * gridSize;
        } else {
            width = depth = Math.floor((Math.random() * (maxBuildingSize - minBuildingSize + 1) + minBuildingSize) / gridSize) * gridSize;
        }

        if (canPlaceBuilding(point.x, point.y, width, depth)) {
            placeBuilding(point.x, point.y, width, depth, shape);
        }
    }

    return buildings;
}

function drawBuildings(buildings){
  buildings.forEach((building) => {
    push(); // Start a new drawing state
    let xc = building.x + building.width / 2;
    let yc = building.y + building.depth / 2;
    translate(xc, yc, building.height / 2);
    drawBuilding(building);
    pop(); // Restore original state
  });
}

function draw() {
  background(243,237,229);
  translate(-canvasWidth / 2, -canvasHeight / 2, 0);  // move origin to top-left corner
  if (debug){
    blendMode(DIFFERENCE);
    stroke(188,188,188)
    strokeWeight(1);
    for (let i = 0; i <= canvasWidth; i+=gridSize)
      line(i,0,i,canvasHeight);
    for (let j = 0; j <= canvasHeight; j+=gridSize)
      line(0,j,canvasWidth,j);    
  }
  // Initialize grid
  let grid = new Array(canvasWidth);
  let intersections = [];
  let buildings = [];
  grid = initMap(grid);
  [grid, intersections] = populateIntersections(grid, intersections);
  defineRoads(grid, intersections);
  defineBorders(grid, roadBorder);
  drawDashedLinesBetweenIntersections(intersections);
  finalizeMap(grid, intersections);
  buildings = defineBuildings(grid);
  drawBuildings(buildings);
  if (debug) debugCellType(grid);
}