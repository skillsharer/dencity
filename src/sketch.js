// Base Map settings
const canvasWidth = 600;
const canvasHeight = canvasWidth*1.5;
const gridSize = 7;
const intersectBorder = gridSize*20;
const mapBorder = gridSize*2;
const roadBorder = gridSize;
const intersectionDensity = 0.5;
const minBuildingSize = gridSize*5;
const maxBuildingSize = minBuildingSize*2;
const minBuildingHeight = gridSize*20;
const maxBuildingHeight = minBuildingHeight*2.5;
const debug = false;
const maxDisplacement = 0;
const buildingFrameHeight = 7;
const buildingFrameInset = 2;
let intersections = [];
let buildings = [];
let cameraHeight = 1.7;
let globalSeed;
const isMob = /Android|webOS|iPhone|iPad|IEMobile|Opera Mini/i.test(navigator.userAgent);

function preload() {
  globalSeed = Math.round($fx.rand() * 2e9) * Math.round($fx.randminter() * 2e9);
}

function setup() {
  randomSeed(globalSeed);
  noiseSeed(globalSeed);
  (isMob) ? pixelDensity(1): pixelDensity(min(window.devicePixelRatio));  createCanvas(canvasWidth, canvasHeight, WEBGL);
  //camera(0, 500, -cameraHeight*height / tan(-PI*60.0 / 180.0), 0, 0, 0, 0, 1, -1);
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
  grid = initMap(grid);
  [grid, intersections] = populateIntersections(grid, intersections);
  defineRoads(grid, intersections);
  defineBorders(grid, roadBorder);
  drawDashedLinesBetweenIntersections(intersections);
  finalizeMap(grid, intersections, maxDisplacement);
  buildings = defineBuildings(grid, minBuildingSize, maxBuildingSize, gridSize);
  for (building of buildings) {
    building.draw_building();
  }
  if (debug) debugCellType(grid);
}