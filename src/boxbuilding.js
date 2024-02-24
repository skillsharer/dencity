class BoxBuilding extends Building{
  constructor(cx, cy, cz, x, y, z, building_color, max_displacement, top_frame=true, frame_thickness=5){
    super(cx, cy, cz, building_color, max_displacement);
    this.x_length = x;
    this.y_length = y;
    this.z_length = z;
    this.quarter = this.check_quarter();
    this.windows = null;
    this.top_frame = top_frame;
    this.frame_thickness = frame_thickness;
  }
  
  // HELPER FUNCTIONS
calculate_windows() {
  let windows = [];

  // Calculate number of windows randomly for each axis
  const window_nums = {
    x: Math.floor(random(1,10)),
    y: Math.floor(random(1,10)),
    z: Math.floor(random(1,20))
  };

  // Calculate window segment sizes for each axis
  const window_segments = {
    x: this.x_length / window_nums.x,
    y: this.y_length / window_nums.y,
    z: this.z_length / window_nums.z
  };

  // Calculate window gaps for each axis
  const window_gaps = {
    x: window_segments.x * random(0.2,1),
    y: window_segments.y * random(0.2,1),
    z: window_segments.z * random(0.2,1)
  };

  // Calculate window lengths for each axis
  const window_lengths = {
    x: window_segments.x - window_gaps.x,
    y: window_segments.y - window_gaps.y,
    z: window_segments.z - window_gaps.z
  };

  // Define constants
  const d = 1;
  const bg_color = 'rgb(138,138,146)'; // Changed to a proper RGB string

  // Helper function to create windows for a given side
  const createWindowsForSide = (axis1, axis2, side, startCoords) => {
    for (let i = 0; i < window_nums[axis1]; i++) {
      for (let j = 0; j < window_nums[axis2]; j++) {
        const coords = {
          x: startCoords.x + (axis1 === 'x' ? window_gaps.x / 2 + (i * window_segments.x) : 0),
          y: startCoords.y - (axis1 === 'y' ? window_gaps.y / 2 + (i * window_segments.y) : 0),
          z: startCoords.z + (axis2 === 'z' ? window_gaps.z / 2 + (j * window_segments.z) : 0)
        };
        const window = new Window(
          coords.x,
          coords.y,
          coords.z,
          window_lengths[axis1],
          window_lengths[axis2],
          d,
          bg_color,
          side,
          this.max_displacement
        );
        windows.push(window);
      }
    }
  };

  // Calculate start positions for each side
  const startPositions = {
    front: { x: this.cx - this.x_length / 2, y: this.cy + this.y_length / 2 + 1, z: this.cz - this.z_length / 2 },
    right: { x: this.cx + this.x_length / 2 + 1, y: this.cy + this.y_length / 2, z: this.cz - this.z_length / 2 },
    left: { x: this.cx - this.x_length / 2 - 1, y: this.cy + this.y_length / 2, z: this.cz - this.z_length / 2 },
    back: { x: this.cx - this.x_length / 2, y: this.cy - this.y_length / 2 - 1, z: this.cz - this.z_length / 2 }
  };

  // Create windows for each side based on the quarter property
  if ([0, 1].includes(this.quarter)) {
    createWindowsForSide('x', 'z', 'front', startPositions.front);
  }
  if ([0, 2].includes(this.quarter)) {
    createWindowsForSide('y', 'z', 'right', startPositions.right);
  }
  if ([1, 3].includes(this.quarter)) {
    createWindowsForSide('y', 'z', 'left', startPositions.left);
  }
  if ([2, 3].includes(this.quarter)) {
    createWindowsForSide('x', 'z', 'back', startPositions.back);
  }

  return windows;
}

  
 draw_top_frame() {
    // Frame thickness
    const halfFrameThickness = this.frame_thickness/2;

    // Set the color of the frame
    fill(this.building_color);
    noStroke();
    push();
    translate(0,0,(this.z_length + this.frame_thickness)/2)
    this.draw_edges(this.x_length - 2.5*this.frame_thickness, this.y_length - 2.5*this.frame_thickness, this.frame_thickness);
    pop();
    // Draw frame on the front and back edges parallel to the X-axis
    for (let y = -1; y <= 1; y += 2) {
      push();
      translate(this.cx, this.cy + (y * this.y_length / 2) + (-y * halfFrameThickness), this.cz + this.z_length / 2 + halfFrameThickness);
      rotateX(HALF_PI);
      box(this.x_length, this.frame_thickness, this.frame_thickness);
      translate(0, halfFrameThickness + 1, 0);
      rotateY(HALF_PI);
      rotateX(HALF_PI);
      noStroke();
      fill(color(200,200,200));
      plane(this.frame_thickness, this.x_length);
      pop();
    }

    // Draw frame on the left and right edges parallel to the Y-axis
    for (let x = -1; x <= 1; x += 2) {
      push();
      translate(this.cx + (x * this.x_length / 2) + (-x * halfFrameThickness), this.cy, this.cz + this.z_length / 2 + halfFrameThickness);
      rotateZ(PI); // Rotate around Z-axis to align along the Y-axis
      box(this.frame_thickness, this.y_length, this.frame_thickness);
      translate(0, 0, halfFrameThickness + 1);
      noStroke();
      fill(color(200,200,200));
      plane(this.frame_thickness, this.y_length);
      pop();
    }
   
    this.z_length = this.z_length + this.frame_thickness;
    this.cz = this.cz + this.frame_thickness/2;
 }

  
  draw_building(){
    push();
    noStroke();
    translate(this.cx, this.cy, this.cz);
    fill(this.building_color);
    box(this.x_length, this.y_length, this.z_length);
    pop();
    if (this.top_frame) this.draw_top_frame();
    this.draw_edges();
    this.windows = this.calculate_windows();
    this.draw_windows();
  }
}