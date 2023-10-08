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