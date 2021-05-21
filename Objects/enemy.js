import { Body, Box, Vec3 } from "cannon";
import { Vector3, Quaternion } from "three";
import
Geometries
from "../assets/simpleGeometries";
import NPC from "./npc";

class Enemy extends NPC {

  constructor(props){
    const geo = Geometries.getGeometry(
      "enemy"
    );

    props.geometry = geo;

    let bb = geo.boundingBox;
    let shape = new Box(
      new Vec3().copy(bb.max)
    );


    let body = new Body({
      mass: 200,
      material: props.physicsMaterial
    });

    body.addShape(shape);

    props.body = body;
    props.searchRadius = 30;
    props.hitpoints = 400;

    super(props);

    this.body.addEventListener(
      "collide", this.handleCollision
    );

    this.searchRadius = props.searchRadius;
    this.hitRain = props.hitRain;
    this.lastPosition = null;
    this.ball = props.ball;
    this.acc = new Vector3();
    this.speed = 0.6;
  }

  update(dt){
    super.update(dt);
    if(!this.lastPosition){
      this.searchForBall();
    } else if(!this.attached){
      this.huntBall();
    }
  }

  checkForBall = () => {
    let d = this.ball.position.clone().sub(
      this.position
    );

    if(d.length() < this.searchRadius){
      this.find(
        this.ball.position.clone()
      );
    } else this.loose();
  };

  huntBall(){
    this.turnTowards(this.lastPosition);

    this.acc.set(
      0,
      Math.random() * 0,
      this.speed
    );

    this.acc.applyQuaternion(
      this.turnQuat
    );

    this.accelerate(this.acc);

    if(
      this.body.position.almostEquals(
        this.lastPosition, 2
      )
    ){
      this.lastPosition = null;
    }
  };

  searchForBall(){
    this.acc.set(
      Math.random() * 0.001,
      Math.random() * 0.001,
      -this.speed
    );

    this.acc.applyQuaternion(
      this.body.quaternion
    );
    this.accelerate(this.acc);

    this.turn(
      this.turnQuat.multiply(
        new Quaternion().setFromAxisAngle(
          this.turnAxis,
          Math.random() * Math.PI / 500
        )
      )
    );

    this.checkForBall();
  };

  handleCollision = (e) => {
    if(!e.body.material)
      return;
    if(e.body.material.name === "bullet"){
      let dmg = this.takeHit(
        e.body.mass,e.body.velocity
      );
      this.hitRain(
        "" + Math.floor(dmg) + "",
        e.body.position,
        e.body.velocity,
      );
    }
  };

  find = (position) => {
    this.lastPosition = new Vector3().copy(
      position
    );
  };

  loose = () => {
    if(this.lastPosition)
      this.lastPosition = null;
  };

  preStepFunction = () => {
    if(!this.body.world) return;
    this.body.force.y += this.body.mass *
      -this.body.world.gravity.y;
  };
}

export default Enemy;
