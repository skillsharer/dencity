// Base Map settings
const canvasWidth = 600;
const canvasHeight = canvasWidth*1.5;
const gridSize = 5;
const intersectBorder = gridSize*20;
const mapBorder = gridSize*2;
const roadBorder = gridSize;
const intersectionDensity = 0.5;
const minBuildingSize = gridSize*5;
const maxBuildingSize = minBuildingSize*5;
const minBuildingHeight = gridSize*20;
const maxBuildingHeight = minBuildingHeight*2;
const debug = false;
const maxDisplacement = 0.0;
const buildingFrameHeight = 7;
const buildingFrameInset = 2;

function setup() {
  pixelDensity(1); // ensures one unit in the canvas corresponds to one pixel
  createCanvas(canvasWidth, canvasHeight, WEBGL);
  //camera(0, 1000, -height / tan(-PI*60.0 / 180.0), 0, 0, 0, 0, 1, -1);
  noLoop();
}

function draw() {
  background(100,100,100);
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
  if (debug) debugCellType(grid);
}