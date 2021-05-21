import {
 FileLoader, TextGeometry, Font, Vector3, Quaternion
} from "three";

import { Body, Box, Vec3 } from "cannon";

import DynamicEntity from "./dynamicEntity";
import MeshedEntity from "./meshedEntity";
import FontLoader from "../assets/fontLoader";

let json = require(
"../assets/dmgFont.typeface.json"
);

let dmgFont = new Font(json);

class DmgText extends DynamicEntity{
  constructor(props){
    let text = props.text || "";

    let geometry = new TextGeometry(
      text, {
        font: dmgFont,
        size: 1,
        height: 0.1

      }
    );

    geometry.computeBoundingBox();
    props.geometry = geometry;

    let he = new Vec3().copy(
      geometry.boundingBox.max
    );
    let shape = new Box(he);

    let body = new Body({
      mass: 1,
      material: props.physicsMaterial
    });
    body.addShape(shape);
    props.body = body;

    body.collisionResponse = false;
    super(props);

    this.startPosition = props.position.clone();
    this.body.velocity.set(
      Math.random() * 4 - 2,
      Math.random() * 20,
      Math.random() * 4 - 2
    );

  }

  update(dt){
    super.update();

    if(
      this.body.position.y <
      this.startPosition.y
    ) this.remove = true;
  }

}

class WinnerText extends MeshedEntity{
  constructor(props){
    props = props || {};
    let player = props.player;
    let text = "" +
    "                      Congratulations!\n" +
    "You have brought the ball through the \n" +
    "          maze and saved the Universe.\n" +
    "             Consider yourself a HERO!\n" +
      "\n" +
    "                              YOU WIN!\n" +
      "\n" +
    " press anywhere to begin another game ";

    let geometry = new TextGeometry(
      text,{
        font: dmgFont,
        size: 0.1,
        height: 0.001
      }
    );

    props.geometry = geometry;

    geometry.computeBoundingBox();

    let min = geometry.boundingBox.min;
    let max = geometry.boundingBox.max;

    let or = new Quaternion();

    props.orientation = or;

    // Customized to text. Has to be changed
    // by view or find a way to center bb in
    // frustum.
    let offset = new Vector3(
      -max.x/2,-min.y * 2,player.camera.near
    );

    let pos = player.position.clone().add(
      offset.clone().applyQuaternion(
        player.camera.quaternion
      )
    );

    props.position = pos;
    props.key = "winText";

    super(props);

    this.player = player;
    this.offset = offset;

    this.attach();
  }

  update(){

    let or = this.player.camera.
      quaternion.clone();

    let pos = this.offset.clone().
      applyQuaternion(or);

    super.update(pos,or);
  }

  attach = () => {
    this.player.mesh.attach(this.mesh);
  };

  detach = () => {
    this.player.mesh.remove(this.mesh);
  };
}

export { DmgText, WinnerText };
