class CylinderBuilding extends Building{
  constructor(cx, cy, cz, x, y, z, building_color, max_displacement, horizontal_lines=5){
    super(cx, cy, cz, building_color, max_displacement);
    this.x_length = x;
    this.y_length = y;
    this.z_length = z;
    this.radius = Math.ceil(max(this.x_length/2, this.y_length/2));
    this.segments = Math.floor(min(this.x_length/2, this.y_length/2));
    this.horizontal_lines = horizontal_lines;
  }
  
  draw_building(){
   push();
   noStroke();
   translate(this.cx, this.cy, this.cz);
   rotateX(HALF_PI);
   fill(this.building_color);
   cylinder(this.radius, this.z_length);
   this.draw_windows();
   pop();
  }
  
  draw_windows() {
    stroke(0);
    strokeWeight(1);

    let topPoints = [];
    let bottomPoints = [];
    let midPoints = Array.from({ length: this.horizontal_lines }, () => []);
    for (let i = 0; i < this.segments; i++) {
      let theta = TWO_PI / this.segments * i;
      let x = this.radius * cos(theta);
      let y = this.radius * sin(theta);

      topPoints.push([x + this.calc_displacement(), this.z_length / 2 + this.calc_displacement(), y + this.calc_displacement()]);
      bottomPoints.push([x + this.calc_displacement(), -this.z_length / 2 + this.calc_displacement(), y + this.calc_displacement()]);

      for (let j = 0; j < this.horizontal_lines; j++) {
        let fraction = (j + 1) / (this.horizontal_lines + 1);
        let z = lerp(-this.z_length / 2, this.z_length / 2, fraction);
        midPoints[j].push([x + this.calc_displacement(), z + this.calc_displacement(), y + this.calc_displacement()]);
      }
    }

    // Draw the top and bottom circles
    for (let i = 0; i < this.segments; i++) {
      let nextIdx = (i + 1) % this.segments;
      line(...topPoints[i], ...topPoints[nextIdx]);
      line(...bottomPoints[i], ...bottomPoints[nextIdx]);
    }

    // Draw the sides of the cylinder
    for (let i = 0; i < this.segments; i++) {
      line(...topPoints[i], ...bottomPoints[i]);
    }

    // Draw the horizontal lines
    for (let j = 0; j < this.horizontal_lines; j++) {
      for (let i = 0; i < this.segments; i++) {
        let nextIdx = (i + 1) % this.segments;
        line(...midPoints[j][i], ...midPoints[j][nextIdx]);
      }
    }
  }
}