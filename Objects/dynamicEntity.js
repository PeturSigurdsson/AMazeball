import { Body, Vec3, Quaternion } from "cannon";
import {
  Quaternion as Q, Vector3
} from "three";

import {
  materials
} from "./../Physics/materials";
import MeshedEntity from "./meshedEntity";
import World from "../Physics/world";


class DynamicEntity extends MeshedEntity {

  constructor(props){
    super({
      position: props.position,
      orientation: props.orientation,
      geometry: props.geometry,
      material: props.material,
      key: props.key
    });

    this.slerpStep = props.slerpStep || 1;

    this.turnGoal = new Quaternion().copy(
      this.orientation
    );

    this.accel = false;
    this.shouldTurn = false;

    this.body = props.body || new Body({
      mass: 100,
      material: materials.org,
      linearDamping: 0.4,
      fixedRotation: true
    });

    this.body.position.copy(this.position);
    this.body.quaternion.copy(
      this.orientation
    );

    for(let shape of props.shapes || [])
      this.body.addShape(shape);

    this.acceleration = new Vec3();
  }

  update(){

    super.update(
      this.body.position,
      this.body.quaternion
    );

    if(this.accel){
      let a = this.useAcceleration();
      this.body.velocity = this.body.
        velocity.vadd(a);
      this.clampVelocity();
    }

    if(this.shouldTurn){
      let q = this.useTurn();
      this.body.quaternion.copy(q);
    }

  };

  setVelocity = (v) => {
    v.applyQuaternion(this.body.quaternion);
    this.body.velocity.copy(v);
  };

  accelerate = (a) => {
    this.accel = true;
    this.acceleration = this.acceleration.
      vadd(a);
  };

  useAcceleration = () => {
    this.accel = false;
    let a = new Vec3().copy(
      this.acceleration
    );
    this.acceleration.set(0,0,0);
    return a;
  };

  turn = (quaternion) => {
    this.shouldTurn = true;
    this.turnGoal.copy(quaternion);
  };

  useTurn = () => {
    let o = new Q().copy(
      this.body.quaternion
    );
    if(!this.almostEqual(
      o, this.turnGoal, 0.1
    )){
      o.slerp(
        this.turnGoal, this.slerpStep
      );
    } else{
      this.shouldTurn = false;
    }
    return o;
  };

  handleCollision = (position) => {};

  almostEqual = (v, w, t) => {
    let qv = new Q().copy(v);
    let qw = new Q().copy(w);

    let angle = qv.angleTo(qw);
    return angle <= t;
  };

  setMaxVelocity = (vel) => {
    this.maxVelocity = vel;
  };

  clampVelocity = () => {
    let vel = new Vector3().copy(
      this.body.velocity
    );

    vel.y = 0;
    vel.clampLength(0,this.maxVelocity);

    let y = this.body.velocity.y < 80 ?
      this.body.velocity.y : 80;

    this.body.velocity.set(
      vel.x,
      y,
      vel.z
    );
  };

  moveTo(position){
    this.body.position.copy(position);
    super.moveTo(position);
  };

  orient(orientation){
    this.body.quaternion.copy(orientation);
    super.orient(orientation);
  }

}

export default DynamicEntity;
