class SetBackBuilding extends BoxBuilding{
  constructor(cx, cy, cz, x, y, z, building_color, max_displacement, top_frame=true, frame_thickness=5, set_back_ratio=[1, 0.7]){
    super(cx, cy, cz, x, y, z, building_color, max_displacement, top_frame, frame_thickness);
    this.set_back_ratio = set_back_ratio;
    this.set_backs = this.define_set_backs();
  }
  
  define_set_backs(){
    let set_back_array = []
    let z_segment_length = this.z_length / this.set_back_ratio.length;
    for (let i=0; i<this.set_back_ratio.length; i++){
      let ratio_x = this.set_back_ratio[i] * this.x_length;
      let ratio_y = this.set_back_ratio[i] * this.y_length;
      let current_height = z_segment_length / 2 + i * z_segment_length;
      let set_back = new BoxBuilding(this.cx, this.cy, current_height, ratio_x, ratio_y, z_segment_length, this.building_color, this.max_displacement, this.top_frame, this.frame_thickness);
      set_back_array.push(set_back);
    }
    return set_back_array;
  }
  
  draw_building(){
    push();
      for(let i = 0; i < this.set_backs.length; i++){
        this.set_backs[i].draw_building();
      }
    pop();
  }  
}