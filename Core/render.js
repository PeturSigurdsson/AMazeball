import { Renderer } from "expo-three";
import
  CannonDebugRenderer
from "../assets/cannonDebugRenderer";

import Scene from "../Graphics/scene";
import World from "../Physics/world";

export default class Render{

  constructor(gl, width, height, col, cam){
    this.renderer = new Renderer({gl});
    this.renderer.setSize(width, height);
    this.renderer.setClearColor = col;

    this.gl = gl;
    this.camera = cam;


    this.dbr;
    if(debug){
      this.dbr = new CannonDebugRenderer(
        Scene, World
      );
    }
  }

  render = async () => {
    if(debug)
      this.dbr.update(Scene,this.camera);
    this.renderer.render(Scene,this.camera);
    this.gl.endFrameEXP();
  };
}
