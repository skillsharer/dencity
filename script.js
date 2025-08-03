const sp = new URLSearchParams(window.location.search)
const isMob = /Android|webOS|iPhone|iPad|IEMobile|Opera Mini/i.test(navigator.userAgent);

$fx.params([
  {
    id: "displacement",
    name: "Line displacement",
    type: "number",
    default: 0.0,
    options: {
        min: 0.0,
        max: 1.0,
        step: 0.1
    }
  },
  {
    id: "camera_height",
    name: "Camera height",
    type: "number",
    default: 0.0,
    options: {
        min: 0.0,
        max: 1.0,
        step: 0.1
    }
  },
  {
    id: "intersection_density",
    name: "Intersection Density",
    type: "number",
    default: 0.5,
    options: {
      min: 0.3,
      max: 0.7,
      step: 0.1
    }
  },
  {
    id: "palette",
    name: "Color Palette",
    type: "select",
    default: "pear",
    options: {
      options: Array.from({length: 76}, (_, i) => (i + 1).toString()),
    },
  }
]);

// Base Map settings
const canvasWidth = 600;
const canvasHeight = canvasWidth*1.5;
const gridSize = 5;
const intersectBorder = gridSize*20;
const mapBorder = gridSize*2;
const roadBorder = gridSize;
const intersectionDensity = $fx.getRawParam("intersection_density")
const palette = $fx.getRawParam("palette")
const minBuildingSize = gridSize*5;
const maxBuildingSize = minBuildingSize*2;
const minBuildingHeight = gridSize*30;
const maxBuildingHeight = minBuildingHeight*2.0;
const debug = false;
const buildingFrameHeight = 7;
const buildingFrameInset = 2;
let maxDisplacement;
let intersections = [];
let buildings = [];
let cameraHeight;
let globalSeed;
let grid = new Array(canvasWidth);

function preload() {
  globalSeed = Math.round($fx.rand() * 2e9) * Math.round($fx.randminter() * 2e9);
  console.log("Global seed:", globalSeed);
}

function setup() {
  console.log("Setup called");
  randomSeed(globalSeed);
  noiseSeed(globalSeed);
  maxDisplacement = $fx.getRawParam("displacement");
  cameraHeight = 1.7 + $fx.getRawParam("camera_height");
  (isMob) ? pixelDensity(1): pixelDensity(min(window.devicePixelRatio));
  createCanvas(canvasWidth, canvasHeight, WEBGL);
  camera(0, 0, -cameraHeight*height / tan(-PI*60.0 / 180.0), 0, 0, 0, 0, 1, -1);
  noLoop();
}

function draw() {
  $fx.rand.reset();
  console.log("Drawing with seed:", globalSeed);
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
  grid = initMap(grid, canvasWidth, canvasHeight);
  [grid, intersections] = populateIntersections(grid, intersections, canvasWidth, canvasHeight, gridSize, intersectionDensity, mapBorder, intersectBorder, debug);
  defineRoads(grid, intersections, canvasWidth, canvasHeight, gridSize, debug);
  defineBorders(grid, canvasWidth, canvasHeight, roadBorder);
  drawDashedLinesBetweenIntersections(intersections);
  buildings = defineBuildings(grid, minBuildingSize, maxBuildingSize, gridSize, palette, maxDisplacement);
  for (building of buildings) {
    building.draw_building();
  }
  finalizeMap(grid, intersections, canvasWidth, canvasHeight, gridSize, maxDisplacement);
  if (debug) debugCellType(grid);
  1 === frameCount && $fx.preview();
}