class Building{
   constructor(cx, cy, cz, building_color, max_displacement){
     this.cx = cx;
     this.cy = cy;
     this.cz = cz;
     this.building_color = building_color;
     this.max_displacement = max_displacement;
   }

  check_quarter() {
    /*
    0: Top-left
    1: Top-Right
    2: Bottom-left
    3: Bottom-right
    */
    let horizontal = (this.cx <= width / 2) ? 0 : 1;
    let vertical = (this.cy <= height / 2) ? 0 : 1;
    return 2 * vertical + horizontal;
  }
  
  draw_windows(){
    push();
    for (const window of this.windows) {
      window.draw_window();
    }
    pop();
  }

  calc_displacement(){
    return Math.floor(($fx.rand() * (2 * this.max_displacement)) - this.max_displacement);
  }
  
  draw_edges(x, y, z) {
    const half_x = x / 2;
    const half_y = y / 2;
    const half_z = z / 2;

    const points = [
        [-half_x, -half_y, half_z],
        [half_x, -half_y, half_z],
        [half_x, half_y, half_z],
        [-half_x, half_y, half_z],
        [-half_x, -half_y, -half_z],
        [half_x, -half_y, -half_z],
        [half_x, half_y, -half_z],
        [-half_x, half_y, -half_z]
    ].map(pt => pt.map(val => val + this.calc_displacement()));

    const edgesToDraw = [
        [points[0], points[1]],
        [points[1], points[2]],
        [points[2], points[3]],
        [points[3], points[0]],
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
    stroke(0);
    strokeWeight(1);
    for (const edge of edgesToDraw) {
        line(...edge[0], ...edge[1]);
    }
    pop();
  }
}