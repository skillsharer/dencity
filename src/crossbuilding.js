class CrossBuilding extends BoxBuilding{
  constructor(cx, cy, cz, x, y, z, building_color, max_displacement, top_frame=true, frame_thickness=5){
    super(cx, cy, cz, x, y, z, building_color, max_displacement, top_frame, frame_thickness);
    this.cross_ratio = x > y ? y / x : x / y;
    this.top_frame = true;
  }
  
  calculate_windows() {
    let windows = [];

    // Calculate number of windows randomly for each axis
    const window_nums = {
      x: Math.floor(random(1,5)),
      y: Math.floor(random(1,5)),
      z: Math.floor(random(1,20))
    };

    // Calculate window segment sizes for each axis
    const window_segments = {
      x: (this.x_length * this.cross_ratio) / window_nums.x,
      y: (this.y_length * this.cross_ratio) / window_nums.y,
      z: this.z_length / window_nums.z
    };

    // Calculate window gaps for each axis
    const window_gaps = {
      x: window_segments.x * random(0,0.3),
      y: window_segments.y * random(0,0.3),
      z: window_segments.z * random(0,0.3)
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
      front: { x: this.cx - (this.x_length / 2 * this.cross_ratio), y: this.cy + this.y_length / 2 + 1, z: this.cz - this.z_length / 2 },
      right: { x: this.cx + this.x_length / 2 + 1, y: this.cy + (this.y_length / 2 * this.cross_ratio), z: this.cz - this.z_length / 2 },
      left: { x: this.cx - this.x_length / 2 - 1, y: this.cy + (this.y_length / 2 * this.cross_ratio), z: this.cz - this.z_length / 2 },
      back: { x: this.cx - (this.x_length / 2 * this.cross_ratio), y: this.cy - this.y_length / 2 - 1, z: this.cz - this.z_length / 2 }
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

  check_frame_quarter(x,y) {
    /*
    0: Top-left
    1: Top-Right
    2: Bottom-left
    3: Bottom-right
    */
    let horizontal = (x <= this.cx) ? 0 : 1;
    let vertical = (y <= this.cy) ? 0 : 1;
    return 2 * vertical + horizontal;
  }
  
  // Helper function to draw a box with colored edges
  drawFrame(x, y, z, w, h, d, side) {
    push();
    translate(x, y, z);
    noStroke();
    fill(this.building_color);
    box(w, h, d);
    // Color the top to white
    push();
      translate(0, 0 , d / 2 * 1.01);
      fill(color(200,200,200));
      plane(w, h);
    pop();
    stroke(color(0,0,0));
    strokeWeight(1);
    
    const halfW = w / 2 + random(-this.max_displacement, this.max_displacement);
    const halfH = h / 2 + random(-this.max_displacement, this.max_displacement);
    const halfD = d / 2 + random(-this.max_displacement, this.max_displacement);
    const frameThickness = this.frame_thickness;
    
    switch (side) {
      case 'front':
        line(-halfW, -halfH + frameThickness, halfD, halfW, -halfH + frameThickness, halfD);
        line(-halfW + frameThickness, -halfH, halfD, halfW - frameThickness, -halfH , halfD);
        line(-halfW + frameThickness, -halfH, -halfD, halfW - frameThickness, -halfH , -halfD);
        break;
      case 'right':
        line(halfW, -halfH, halfD, halfW, halfH, halfD);
        line(-halfW, -halfH + frameThickness, halfD, -halfW, halfH - frameThickness, halfD);
        line(-halfW, -halfH + frameThickness, -halfD, -halfW, halfH - frameThickness, -halfD);
        break;
      case 'left':
        line(-halfW, -halfH, halfD, -halfW, halfH, halfD);
        line(-halfW + frameThickness, -halfH + frameThickness, -halfD, -halfW + frameThickness, halfH - frameThickness, -halfD);
        line(-halfW + frameThickness, -halfH + frameThickness, halfD, -halfW + frameThickness, halfH - frameThickness, halfD);
        break;
      case 'back':
        line(-halfW, -halfH, halfD, halfW, -halfH, halfD);
        line(-halfW + frameThickness, halfH, halfD, halfW - frameThickness, halfH, halfD);
        line(-halfW + frameThickness, halfH + 1, -halfD, halfW - frameThickness, halfH + 1, -halfD);
        break;
      case 'leftBackHorizontal':   
        line(-halfW, -halfH, halfD, halfW, -halfH, halfD);
        line(-halfW + frameThickness, halfH, halfD, halfW + frameThickness, halfH, halfD);
        line(-halfW + frameThickness, halfH, -halfD, halfW + frameThickness, halfH, -halfD);
        line(halfW + frameThickness, halfH, -halfD, halfW + frameThickness, halfH, halfD);
        line(-halfW + frameThickness, halfH, -halfD, -halfW + frameThickness, halfH, halfD);
        break;
      case 'rightBackHorizontal':
        line(-halfW, -halfH, halfD, halfW, -halfH, halfD);
        line(-halfW - frameThickness, halfH, halfD, halfW - frameThickness, halfH, halfD);
        line(-halfW - frameThickness, halfH, -halfD, halfW - frameThickness, halfH, -halfD);
        line(halfW - frameThickness, halfH, -halfD, halfW - frameThickness, halfH, halfD);
        line(-halfW - frameThickness, halfH, -halfD, -halfW - frameThickness, halfH, halfD);
        break;
      case 'leftFrontHorizontal':
        line(-halfW, halfH, halfD, halfW, halfH, halfD);
        line(-halfW + frameThickness, -halfH, halfD, halfW + frameThickness, -halfH, halfD);
        line(-halfW + frameThickness, -halfH, -halfD, halfW + frameThickness, -halfH, -halfD);
        line(halfW + frameThickness, -halfH, -halfD, halfW + frameThickness, -halfH, halfD);
        line(-halfW + frameThickness, -halfH, -halfD, -halfW + frameThickness, -halfH, halfD);
        break;
      case 'rightFrontHorizontal':
        line(-halfW, halfH, halfD, halfW, halfH, halfD);
        line(-halfW - frameThickness, -halfH, halfD, halfW - frameThickness, -halfH, halfD);
        line(-halfW - frameThickness, -halfH, -halfD, halfW - frameThickness, -halfH, -halfD);
        line(halfW - frameThickness, -halfH, -halfD, halfW - frameThickness, -halfH, halfD);
        line(-halfW - frameThickness, -halfH, -halfD, -halfW - frameThickness, -halfH, halfD);
        break;
      case 'leftBackVertical':
        line(-halfW, -halfH - frameThickness, halfD, -halfW, halfH - frameThickness, halfD);
        line(halfW, -halfH, halfD, halfW, halfH, halfD);
        line(halfW, -halfH, -halfD, halfW, halfH, -halfD);
        line(halfW, -halfH, -halfD, halfW, -halfH, halfD);
        break;
      case 'rightBackVertical':
        line(-halfW, -halfH, halfD, -halfW, halfH, halfD);
        line(halfW, -halfH - frameThickness, halfD, halfW, halfH - frameThickness, halfD);
        line(-halfW, -halfH, -halfD, -halfW, halfH, -halfD);
        line(-halfW, -halfH, -halfD, -halfW, -halfH, halfD);

        break;
      case 'leftFrontVertical':
        line(-halfW, -halfH + frameThickness, halfD, -halfW, halfH + frameThickness, halfD);
        line(halfW, -halfH, halfD, halfW, halfH, halfD);
        line(halfW, -halfH, -halfD, halfW, halfH, -halfD);
        line(halfW, -halfH, -halfD, halfW, -halfH, halfD);
        break;
      case 'rightFrontVertical':
        line(-halfW, -halfH, halfD, -halfW, halfH, halfD);
        line(halfW, -halfH + frameThickness, halfD, halfW, halfH + frameThickness, halfD);
        line(-halfW, -halfH, -halfD, -halfW, halfH, -halfD);
        line(-halfW, -halfH, -halfD, -halfW, -halfH, halfD);
        break;
      default:
        break;
    }
    pop();
  }

  draw_top_frame() {
    push();
    const halfXLength = this.x_length / 2;
    const halfYLength = this.y_length / 2;
    const halfZLength = this.z_length / 2;
    const halfFrameThickness = this.frame_thickness / 2;
    const crossXLength = this.x_length * this.cross_ratio;
    const crossYLength = this.y_length * this.cross_ratio;
    const quarterXLength = (this.x_length - crossXLength) / 2;
    const quarterYLength = (this.y_length - crossYLength) / 2;
    const halfquarterXLength = quarterXLength / 2;
    const halfquarterYLength = quarterYLength / 2;
    const halfCrossXLength = crossXLength / 2;
    const halfCrossYLength = crossYLength / 2;

    // Outer frames
    this.drawOuterFrames(halfXLength, halfYLength, halfZLength, halfFrameThickness, crossXLength, crossYLength);
    // Inner front and back frames
    this.drawInnerFrames(halfXLength, halfYLength, halfZLength, quarterXLength, quarterYLength, halfCrossXLength, halfCrossYLength, halfFrameThickness, halfquarterXLength, halfquarterYLength);
    this.z_length = this.z_length + this.frame_thickness;
    pop();
  }

  drawOuterFrames(halfXLength, halfYLength, halfZLength, halfFrameThickness, crossXLength, crossYLength) {
    // Left and Right Outer Frames
    this.drawFrame(this.cx - halfXLength + halfFrameThickness, this.cy, halfZLength + halfFrameThickness, this.frame_thickness, crossYLength, this.frame_thickness, 'left');
    this.drawFrame(this.cx + halfXLength - halfFrameThickness, this.cy, halfZLength + halfFrameThickness, this.frame_thickness, crossYLength, this.frame_thickness, 'right');
    // Front and Back Outer Frames
    this.drawFrame(this.cx, this.cy - halfYLength + halfFrameThickness, halfZLength + halfFrameThickness, crossXLength, this.frame_thickness, this.frame_thickness, 'back');
    this.drawFrame(this.cx, this.cy + halfYLength - halfFrameThickness, halfZLength + halfFrameThickness, crossXLength, this.frame_thickness, this.frame_thickness, 'front');
  }

  drawInnerFrames(halfXLength, halfYLength, halfZLength, quarterXLength, quarterYLength, halfCrossXLength, halfCrossYLength, halfFrameThickness, halfquarterXLength, halfquarterYLength) {
    // Horizontal Inner Frames
    this.drawFrame(this.cx - halfXLength + halfquarterXLength, this.cy - halfCrossYLength + halfFrameThickness, halfZLength + halfFrameThickness, quarterXLength, this.frame_thickness, this.frame_thickness, 'leftBackHorizontal');
    this.drawFrame(this.cx + halfXLength - halfquarterXLength, this.cy - halfCrossYLength + halfFrameThickness, halfZLength + halfFrameThickness, quarterXLength, this.frame_thickness, this.frame_thickness, 'rightBackHorizontal');
    this.drawFrame(this.cx - halfXLength + halfquarterXLength, this.cy + halfCrossYLength - halfFrameThickness, halfZLength + halfFrameThickness, quarterXLength, this.frame_thickness, this.frame_thickness, 'leftFrontHorizontal');
    this.drawFrame(this.cx + halfXLength - halfquarterXLength, this.cy + halfCrossYLength - halfFrameThickness, halfZLength + halfFrameThickness, quarterXLength, this.frame_thickness, this.frame_thickness, 'rightFrontHorizontal');
    
    // Vertical Inner Frames
    this.drawFrame(this.cx - halfCrossXLength + halfFrameThickness, this.cy - halfYLength + halfquarterYLength + this.frame_thickness, halfZLength + halfFrameThickness, this.frame_thickness, quarterYLength, this.frame_thickness, 'leftBackVertical');
    this.drawFrame(this.cx + halfCrossXLength - halfFrameThickness, this.cy - halfYLength + halfquarterYLength + this.frame_thickness, halfZLength + halfFrameThickness, this.frame_thickness, quarterYLength, this.frame_thickness, 'rightBackVertical');
    this.drawFrame(this.cx - halfCrossXLength + halfFrameThickness, this.cy + halfYLength - halfquarterYLength - this.frame_thickness, halfZLength + halfFrameThickness, this.frame_thickness, quarterYLength, this.frame_thickness, 'leftFrontVertical');
    this.drawFrame(this.cx + halfCrossXLength - halfFrameThickness, this.cy + halfYLength - halfquarterYLength - this.frame_thickness, halfZLength + halfFrameThickness, this.frame_thickness, quarterYLength, this.frame_thickness, 'rightFrontVertical');
  }
  
  draw_edges(x=this.x_length, y=this.y_length, z=this.z_length) {
    const disp = () => random(-this.max_displacement, this.max_displacement);
    const half_x = Math.ceil(x / 2);
    const half_y = Math.ceil(y / 2);
    const half_z = Math.ceil(z / 2);

    const points = [
        [-half_x, -half_y, half_z],
        [half_x, -half_y, half_z],
        [half_x, half_y, half_z],
        [-half_x, half_y, half_z],
        [-half_x, -half_y, -half_z],
        [half_x, -half_y, -half_z],
        [half_x, half_y, -half_z],
        [-half_x, half_y, -half_z]
    ].map(pt => pt.map(val => val + disp()));

    const edgesToDraw = [
        [points[4], points[5]],
        [points[5], points[6]],
        [points[6], points[7]],
        [points[7], points[4]],
        [points[0], points[4]],
        [points[1], points[5]],
        [points[2], points[6]],
        [points[3], points[7]]
    ];
    push();
    translate(this.cx, this.cy, this.cz);
    stroke(0);
    strokeWeight(1);
    for (const edge of edgesToDraw) {
        line(...edge[0], ...edge[1]);
    }
    pop();
  }

  draw_building(){
    push();
      noStroke();
      translate(this.cx, this.cy, this.cz); // X,Y,0 this.z_lenght/2 is the top of the building
      fill(this.building_color);
      box(this.x_length*this.cross_ratio, this.y_length, this.z_length);
      box(this.x_length, this.y_length*this.cross_ratio, this.z_length);
    pop();
    push();
      translate(0, 0, this.cz);
      if (this.top_frame) {
        this.draw_top_frame();
      }
      translate(0, 0, -this.z_length/2);
      if (this.x_length < this.y_length){
        this.draw_edges(this.x_length*this.cross_ratio, this.y_length, this.z_length);
        this.draw_edges(this.y_length*this.cross_ratio, this.x_length, this.z_length);
        this.draw_edges(this.x_length*this.cross_ratio, this.y_length*this.cross_ratio, this.z_length);
      } else {
        this.draw_edges(this.y_length, this.x_length*this.cross_ratio, this.z_length);
        this.draw_edges(this.x_length, this.y_length*this.cross_ratio, this.z_length);
        this.draw_edges(this.x_length*this.cross_ratio, this.y_length*this.cross_ratio, this.z_length);
      }
      this.windows = this.calculate_windows();
      this.draw_windows();
    pop();
  }
}