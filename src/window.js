class Window{
  constructor(x,y,z,w,h,d,bg_color,position, max_displacement, roll_color=color(197,197,197), rolls=true){
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
    this.h = h;
    this.d = d;
    this.bg_color = bg_color;
    this.position = position;
    this.max_displacement = max_displacement
    this.rolls = rolls;
    this.roll_color = roll_color;
  }
  
  randomDisplacement(){
    return random(-this.max_displacement, this.max_displacement);
  }
  
  draw_rolls(){
    const drawRoll = (x1, y1, z1, x2, y2, z2, volume) => {
      strokeWeight(1);
      line(x1 + volume*this.randomDisplacement(), y1, z1 + volume*this.randomDisplacement(),
           x2 + volume*this.randomDisplacement(), y2, z2 + volume*this.randomDisplacement());
    };
    
    let roll_position;
    if (this.position === 'front'){
        roll_position = -0.5;
    } else {
      roll_position = 0.5
    }
    
    push();
    let roll_height = Math.floor(random(0,this.h));
      drawRoll(this.w/2, roll_position, roll_height - this.h/2, -this.w/2, roll_position, roll_height - this.h/2, 2);
      translate(0, roll_position, roll_height - this.h/2 - roll_height/2);
      rotateX(HALF_PI);
      noStroke();
      fill(this.roll_color);
      plane(this.w, roll_height);
    pop();
  }
  
  draw_window() {
    // Function to draw edges with displacement
    const drawEdge = (x1, y1, z1, x2, y2, z2) => {
      strokeWeight(1);
      line(x1 + this.randomDisplacement(), y1, z1 + this.randomDisplacement(),
           x2 + this.randomDisplacement(), y2, z2 + this.randomDisplacement());
    };

    // Function to handle the translation and rotation of the window
    const translateAndRotate = (x, y, z, rx, ry, rz) => {
      translate(x, y, z);
      rotateX(rx);
      if (ry !== undefined) rotateY(ry);
      if (rz !== undefined) rotateZ(rz);
    };
    
    const make_edge = (rx, ry, rz) => {
      stroke(1);
      strokeWeight(1);
      rotateX(rx);
      if (ry !== undefined) rotateY(ry);
      if (rz !== undefined) rotateZ(rz);
      if (this.rolls){
        this.draw_rolls();
      }
      drawEdge(-this.w / 2, 0, this.h / 2, this.w / 2, 0, this.h / 2);
      drawEdge(-this.w / 2, 0, -this.h / 2, this.w / 2, 0, -this.h / 2);
      drawEdge(-this.w / 2, 0, this.h / 2, -this.w / 2, 0, -this.h / 2);
      drawEdge(this.w / 2, 0, this.h / 2, this.w / 2, 0, -this.h / 2);
    };

    // Begin drawing
    push();
    noStroke();
    fill(this.bg_color);
    // Calculate the center of the window
    const centerX = this.x + this.w / 2;
    const centerY = this.y - this.w / 2;
    const centerZ = this.z + this.h / 2;

    // Draw the window based on its position
    switch (this.position) {
      case 'front':
        translateAndRotate(centerX, this.y, centerZ, HALF_PI);
        plane(this.w, this.h);
        make_edge(HALF_PI);
        break;
      case 'right':
        translateAndRotate(this.x, centerY, centerZ, HALF_PI, HALF_PI);
        plane(this.w, this.h);
        make_edge(HALF_PI);
        break;
      case 'left':
        translateAndRotate(this.x, centerY, centerZ, HALF_PI, -HALF_PI);
        plane(this.w, this.h);
        make_edge(HALF_PI);
        break;
      case 'back':
        translateAndRotate(centerX, this.y, centerZ, -HALF_PI);
        plane(this.w, this.h);
        make_edge(-HALF_PI);
        break;
    }
    
    pop();
  }
}

class LineWindow {
  constructor(x,y,z,w,h,d){
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
    this.h = h;
    this.d = d;
  }
  draw_window(){
    push();
    noStroke();
    fill(197,197,197);
    translate(this.x, this.y, this.z);
    plane(this.w, this.h);
    pop();
  }
}