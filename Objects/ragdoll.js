import { Box, Sphere } from "cannon";
import {
  BoxGeometry, SphereGeometry
} from "three";
import {
  materials
} from "../Physics/materials";

class Ragdoll{
  constructor(height, materials){
    this.materials = materials;
    this.pmat = materials.org;
    this.height = height;
    this.headHeight = height / 7;
    this.mass = height * 100 - 100;
  }

  buildHead(){
    let headWidth = this.headHeight / 2;
    let headHeight = this.headHeight;
    let headDepth = headWidth;

    let pivot = new Vec3(0,-headHeight / 2,0);
    return this.buildBodyPart(
      headWidth,headHeight,headDepth,
      this.materials.head
    );
  }

  buildTorso(){
    let torsoWidth = this.headHeight * 2;
    let torsoHeight = this.headHeight * 3;
    let torsoDepth = this.headHeight;

    return this.buildBodyPart(
      torsoWidth, torsoHeight, torsoDepth,
      this.materials.torso
    );
  }

  buildHips(){
    let hipWidth = this.headHeight * 3;
    let hipHeight = this.headHeight / 2;
    let hipDepth = this.headHeight * 2;

    return this.buildBodyPart(
      hipWidth, hipHeight, hipDepth,
      this.materials.hips
    );
  }

  buildLeg(){
    let legWidth = this.headHeight;
    let legHeight = this.headHeight * 1.5;
    let legDepth = this.headHeight;

    return this.buildBodyPart(
      legWidth,legHeight,legDepth,
      this.materials.leg
    );
  }

  buildArm(){
    let armWidth = this.headHeight / 2;
    let armHeight = this.headHeight;
    let armDepth = armWidth;

    return this.buildBodyPart(
      armWidth,armHeight,armDepth,
      this.materials.arm
    );
  }

  buildBodyPart(w,h,d,mat){
    let geometry = new BoxGeometry(w,h,d);
    let shape = new Box(w/2,h/2,d/2);
    let mesh = new Mesh(geometry,mat);

    let mass = this.mass * h / this.height;
    let body = new Body({
      mass: mass, material: this.pmat
    });

    return { mesh, body };
  }

  createConstraint(a,b){
    let bodyA = a.body;
    let bodyB = b.body;
    let c = new ConeTwistConstraint(
      bodyA, bodyB, {
        pivotA: a.pivot,
        pivotB: b.pivot,
        angle: this.angle,
        twistAngle: this.twistAngle
    });
    return c;
  }

}
