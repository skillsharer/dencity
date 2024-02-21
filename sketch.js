const maxDisplacement = 1;
let angleX = 0;
let angleY = 0;

function setup() {
  pixelDensity(1); // ensures one unit in the canvas corresponds to one pixel
  createCanvas(600, 900, WEBGL);
  noLoop();
}

function draw() {
  background(100, 100, 100);
  rotateX(angleX);
  rotateY(angleY);
  translate(-width / 2, -height / 2, 0);
  let box_building = new CrossBuilding(width / 2, height / 2, 0, 130, 190, 500, color(177, 127, 87), maxDisplacement);
  box_building.draw_building();
}

function mouseDragged() {
  angleX += (mouseY - pmouseY) * 0.0001;
  angleY += (mouseX - pmouseX) * 0.0001;
  redraw();
}

