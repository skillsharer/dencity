// Base Map settings
let canvasWidth = 600;
let canvasHeight = canvasWidth*1.5;
let gridSize = 10;
let intersectBorder = gridSize*10;
let mapBorder = gridSize*6
let intersectionDensity = 0.3;
let debug = true;


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
    pixelDensity(1); // ensures one unit in the canvas corresponds to one pixel
    createCanvas(canvasWidth, canvasHeight);
    background(200, 200, 200);
    if (debug){
      //blendMode(DIFFERENCE);
      stroke(188,188,188)
      strokeWeight(1);
      for (let i = 0; i <= canvasWidth; i+=gridSize)
        line(i,0,i,canvasHeight);
        for (let j = 0; j <= canvasHeight; j+=gridSize)
          line(0,j,canvasWidth,j);    
    }
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
      } else if (grid[i][j] === 'intersection'){
        console.log(grid[i][j]);
        strokeWeight(1);
        stroke(0,255,0);
        point(i,j); 
      }
    }
  }
}

function populateIntersections(grid, intersections){
  for (let i = mapBorder; i < canvasWidth; i+=intersectBorder){
    for (let j = mapBorder; j < canvasHeight; j+=intersectBorder){
      if (j % gridSize === 0 && i % gridSize === 0){
        if (Math.random() < intersectionDensity) {
          grid[i][j].type = 'intersection';
          intersections.push(grid[i][j]);
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
                      //grid[roadX][y].type = 'road';
                      stroke(118, 188, 196); // Road color
                      strokeWeight(1);
                      point(roadX, y);
                    }
                  }
                  roadPixels = getPixels(x+1,y,i-1,y, 2*gridSize);
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
                    if (grid[x][roadY].type !== null) {
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
  let maxDisplacement = 1;
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
    drawDashedLines(startX, startY, endX, endY);  
  
  
    let maxDisplacement = 2; // Maximum displacement from the border line
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
        let maxDisplacement = 1; // in px
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

function draw() {
  // Initialize grid
  let grid = new Array(canvasWidth);
  let intersections = [];
  grid = initMap(grid);
  [grid, intersections] = populateIntersections(grid, intersections);
  defineRoads(grid, intersections);
  finalizeMap(grid, intersections);
  //debugCellType(grid);
  noLoop();
}