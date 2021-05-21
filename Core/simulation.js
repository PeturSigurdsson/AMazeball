import {
  PerspectiveCamera , Vector3,
  Quaternion, Clock
} from "three";

import World, {
  ReloadWorld
} from "../Physics/world";
import Scene, {
  UnloadScene, LoadScene
} from "../Graphics/scene";
import Render from "./render";
import Update from "./update";
import EC from "./entityController";
import MC from "./mapController";
import Materials from "../assets/materials";

export default class Simulation{

  constructor(){
    LoadScene();
    this.theme = new Materials("devTheme");
    this.camera = new PerspectiveCamera(
      90, 1, 0.1, 30000
    );

    EC.setTheme(this.theme);
    this.player = EC.createPlayer(
      this.camera, new Vector3()
    );

    this.exitSimulation = false;

    this.timeout;
    clearTimeout(this.timeout);

    this.clock = new Clock();
  }

  init = (gl, oldGameState, w, h) => {
    let gameState = oldGameState || {};

    let color = this.theme.bgColor;

    this.render = new Render(
      gl, w, h, color, this.camera
    );

    this.upd = new Update(
      this.player, oldGameState, this.theme
    );

    this.setAspect(w,h);
  }


  setAspect = (width, height) => {
    this.player.cameraWidth = width;
    this.player.cameraHeight = height;
  };

  update = () => {
    switch(this.player.state){
      case "pause":
        break;
      case "reload":
        this.upd.reloadSimulation();
        return;
        break;
      case "player":
        this.upd.update(
          this.clock.getDelta()
        );
        this.render.render();
        break;
      case "winner":
        World.step(this.clock.getDelta());
        this.player.update();
        break;
    }

    if(this.exitSimulation) {
      this.player.state = this.player.
        states.pause;
      this.exit();
    }

    this.timeout = requestAnimationFrame(
      this.update
    );
  };

  getState = () => {
    return this.upd.getState();
  };

  exit = () => {
    EC.unloadEntities();
    MC.unloadEnvironment();
    UnloadScene();
    ReloadWorld();
  };
}
