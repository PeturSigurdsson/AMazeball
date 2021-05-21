import Character from "./character";
import { Vector3, Quaternion } from "three";

class NPC extends Character{

  constructor(props){
    super(props);
    this.attached = false;
    this.turnAxis = new Vector3(0,1,0);
    this.turnQuat = new Quaternion();
    this.hitpoints = props.hitpoints;

    this.setMaxVelocity(5);
  }

  update(dt){
    super.update(dt);
  }

  turnTowards(position){
    let v1 = this.position.clone();
    let v2 = position.clone();

    let axis = v1.clone().cross(v2);

    let angle = Math.sqrt(
      v1.length() ** 2 * v2.length() ** 2
    ) + v1.dot( v2 );

    this.turnQuat.setFromAxisAngle(axis,angle);
    this.turnQuat.normalize();

    this.mesh.lookAt(position.clone());

    this.turnQuat = this.mesh.
      quaternion.clone();
    this.turn(this.turnQuat);

  }

  takeHit = (mass, vel) => {
    let force = mass * vel.length() ** 2;
    let dmg = force * 0.001;
    this.hitpoints -= dmg;
    if(this.hitpoints <= 0)this.remove = true;
    return dmg;
  }

}

export default NPC;
