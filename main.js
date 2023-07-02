let canvasWidth = 600;
let canvasHeight = 600;
let gridSize = 5;
let cellWidth = canvasWidth / gridSize;
let cellHeight = canvasHeight / gridSize;
let dashLength = 5;
let gapLength = 15;
let lineWidth = 2;
let roadWidth = 20;
let debug = true;
let roadDensity = 0.5;

class Cell {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.type = null;
    }
}

function setup() {
    pixelDensity(1); // ensures one unit in the canvas corresponds to one pixel
    createCanvas(canvasWidth, canvasHeight);
    background(216, 215, 211);
}

function initMap(grid, intersections){
  for (let i = 0; i < canvasWidth; i++) {
    grid[i] = new Array(canvasHeight);
    for (let j = 0; j < canvasHeight; j++) {
      grid[i][j] = new Cell(i, j);
      if (j % cellHeight === 0 && i % cellWidth === 0){
        if (Math.random() < roadDensity) {
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
  return [grid, intersections];
}

function drawRoads(grid, intersections) {
    // First pass: Draw horizontal roads
    for (let intersection of intersections) {
        let x = intersection.x;
        let y = intersection.y;
        let validHorizontalRoad = true;

        // Search horizontally to the right
        for (let i = x + cellWidth; i < canvasWidth; i += cellWidth) {
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
                    for (let roadX = x + 1; roadX < i; roadX++) {
                        grid[roadX][y].type = 'road';
                        if (debug) {
                            stroke(118, 188, 196); // Road color
                            strokeWeight(1);
                            point(roadX, y);
                        }
                    }
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
        for (let j = y + cellHeight; j < canvasHeight; j += cellHeight) {
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
                    for (let roadY = y + 1; roadY < j; roadY++) {
                        grid[x][roadY].type = 'road';
                        if (debug) {
                            stroke(118, 188, 196); // Road color
                            strokeWeight(1);
                            point(x, roadY);
                        }
                    }
                }
            }
        }
    }
}



function draw() {
  // Initialize grid
  let grid = new Array(canvasWidth);
  let intersections = [];
  [grid, intersections] = initMap(grid, intersections);
  noLoop();
  drawRoads(grid, intersections);
}
