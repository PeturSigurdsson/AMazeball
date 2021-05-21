import { Box, Vec3, Sphere, Body } from "cannon";
import {
  Vector3, Quaternion, Clock
} from "three";

import Character from "../Objects/character";
import
  Geometries
from "../assets/simpleGeometries";

import {
  Fusor
} from "../Controller/controller";

const fuse = new Fusor();

class Player extends Character{

  /* @input: {Object{
   *  position : { Vector3 },
   *  orientation : { Quaternion },
   *  geometry: { Geometry }*,
   *  material: { MeshMaterial },
   *  shapes: { [ Shape ] }*
   * }}
   *
   * *optional
   */
  constructor(props){

    let geometry = props.geometry;

    if(!geometry){
      Geometries.loadBody();
      geometry = Geometries.body;
    }

    geometry.computeBoundingBox();
    let he = geometry.boundingBox.max;

    let shapes = props.shapes || [
      new Box(new Vec3().copy(he))
    ];

    super({
      position: props.position,
      orientation: props.orientation,
      geometry: geometry,
      material: props.material,
      shapes: shapes,
      key: props.key
    });

    this.camera = props.camera;

    this.camera.position.copy(
      this.mesh.position
    );

    this.camera.quaternion.copy(
      this.mesh.quaternion
    );

    this.geometry.computeBoundingBox();

    this.cameraOffset = new Vector3(
      0,3 * he.y,4
    );

    this.camera.position.add(
      this.cameraOffset
    );

    this.mesh.attach(this.camera);

    let extraShape = new Sphere(2*he.x);
    this.body.addShape(
      extraShape,
      new Vec3(0,-he.y,0)
    );

    this.states = {
      player: "player",
      pause: "pause",
      winner: "winner",
      reload: "reload"
    };

    this.state = this.states.player;

    this.winClock = new Clock(false);

    this.playerModel = {
      acceleration: 80,
      walkSpeed: 6,
      runSpeed: 9,
      jumpForce: 20,
      crouch: false,
      stand: false,
    };

    this.setMaxVelocity(
      this.playerModel.walkSpeed
    );

    this.fireBullet = false;
    this.look = new Quaternion();
  }

  update(){
    super.update();

    let o = fuse.getFusedOrientation();
    this.look.copy(o);
    let t = new Quaternion().copy(o);
    let [ twist, swing ] = this.twistSwing(
      t,new Vector3(0,1,0)
    );
    this.turn( twist );


    let m = new Quaternion().copy(
      this.mesh.quaternion
    ).inverse().multiply(o);

    let oc = this.cameraOffset.clone();
    oc.applyQuaternion(m);

    this.camera.quaternion.copy(m);
    this.camera.position.copy(oc);
    this.adjustAspect();
    this.clampHeight();
  };

  toggleSpeedLimit = (speed) => {
    if(speed != this.maxVelocity)
      this.setMaxVelocity(speed);
  };

  adjustAspect = () => {
    let [twist, swing] = this.twistSwing(
      this.camera.quaternion.clone(),
      new Vector3(0,0,1)
    );

    let w = this.cameraWidth * twist.w +
      this.cameraHeight * (1-twist.w);
    let h = this.cameraHeight * twist.w +
      this.cameraWidth * (1-twist.w);
    this.camera.aspect =  h > w ? w / h : h / w;
    this.camera.updateProjectionMatrix();
  };

  twistSwing = (quat, axis) => {
    let rAxis = new Vector3(
      quat.x,quat.y,quat.z
    );

    let proj = rAxis.projectOnVector(axis);

    let twist = new Quaternion(
      proj.x,proj.y,proj.z,quat.w
    );

    let swing = quat.multiply(
      twist.clone().conjugate()
    );

    return [ twist, swing ];
  };

  clampHeight = () => {
    let pos = this.position.y;
    this.position.y = pos > 0.1 ? pos : 0.1;
  };

  walkRun = (offset, ratio) => {
    this.shouldReload();

    let speedLimit = ratio > 1 ?
      this.playerModel.runSpeed :
      this.playerModel.walkSpeed;


    this.toggleSpeedLimit(speedLimit);

    let acc = new Vector3(
      offset.x,
      0,
      offset.y
    );

    ratio = ratio > 1.1 ? 1.1 : ratio;

    acc.applyQuaternion(this.body.quaternion);
    acc.y = 0;
    acc.clampLength(
      0, this.playerModel.acceleration * ratio
    );

    this.accelerate(acc);
  };

  jump = () => {
    this.shouldReload();

    if(Math.abs(this.body.velocity.y) < 0.1){
      let a = new Vector3(
        0,this.playerModel.jumpForce, 0
      );

      this.accelerate(a);
    }
  };

  crouching = false;
  crouch = (dt) => {
    if(this.crouching) return;
    this.crouching = true;
    this.shouldReload();
    /*
     * temporary crouch until 3d model with
     * animations is available
     */
    this.mesh.geometry.scale(1,0.5,1);
    this.mesh.geometry.computeBoundingBox();
    let he = this.mesh.geometry.
      boundingBox.max;
    this.body.shapes[0].
      halfExtents = new Vec3().copy(he);
    this.body.shapes[0].
      updateConvexPolyhedronRepresentation();
    this.body.shapeOffsets[1].y = -he.y;
    this.body.updateMassProperties();
    this.body.updateBoundingRadius();
  };

  stand = (dt) => {
    if(!this.crouching) return;
    this.crouching = false;
    this.mesh.geometry.scale(1,2,1);
    this.mesh.geometry.computeBoundingBox();
    let he = this.mesh.geometry.
      boundingBox.max;
    this.body.shapes[0].
      halfExtents = new Vec3().copy(he);
    this.body.shapes[0].
      updateConvexPolyhedronRepresentation();
    this.body.shapeOffsets[1].y = -he.y;
    this.body.updateMassProperties();
    this.body.updateBoundingRadius();
  };

  fire = (e) => {
    this.shouldReload();
    this.fireBullet = true;
  };

  shouldReload = () => {
    if(this.winClock.getElapsedTime() > 2 &&
       this.state === this.states.winner){
      this.state = this.states.reload;
    }
  };

  getBullet = () => {
    this.fireBullet = false;
    let offset = new Vector3(0,0,-1);
    offset.applyQuaternion(
      this.look
    );

    let o = new Quaternion().copy(
      this.look
    ).multiply(
      new Quaternion().setFromAxisAngle(
        new Vector3(1,0,0), Math.PI / 12
      )
    );
    return [
      this.position.clone().add(
        offset
      ),
      new Quaternion().copy(o),
      50,
      20
    ];
  };

  setWin = () => {
    this.winClock.start();
    this.state = this.states.winner;
  };


  actions = {
    fire: {
      grant: this.fire,
      move: () => ("fire"),
      release: () => ("!fire")
    },
    crouch: {
      grant: this.crouch,
      move: () => ("crouch"),
      release: this.stand
    },
    walk: {
      grant: () => ("walk"),
      move: this.walkRun,
      release: () => ("!walk")
    },
    act: {
      grant: () => {
        this.shouldReload();
        this.state = this.state !==
          this.states.pause ?
          this.states.pause :
          this.states.player;
      },
      move: () => ("act"),
      release: () => ("act")
    },
    jump: {
      grant: this.jump,
      move: () => ("jumping"),
      release: () => ("!jumping")
    }
  };
}

export default Player;
