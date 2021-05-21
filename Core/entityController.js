import {
  Quaternion, Vector3, Fog, DirectionalLight,
  SphereGeometry, TorusGeometry,
  HemisphereLight, CylinderGeometry,
  CircleGeometry, PlaneGeometry,RectAreaLight,
  SpotLight, SpotLightHelper,Mesh
} from "three";

import {
  Body, Box, Plane, Quaternion as Q,
  Vec3, Sphere, PointToPointConstraint, Ray
} from "cannon";
import {noise} from "perlin";

import World from "../Physics/world";
import {
  materials as mat
} from "../Physics/materials";
import Scene from "../Graphics/scene";
import {
  materials
} from "../Physics/materials";
import Materials from "../assets/materials";
import
  Geometries
from "../assets/simpleGeometries";
import Eller from "../Maze/eller";
import {CellEntityConsumer} from "../Maze/cell";
import Enemy from "../Objects/enemy";
import NPC from "../Objects/npc";
import Goal from "../Objects/goal";
import { DmgText, WinnerText } from "../Objects/text";
import
  DynamicEntity
from "../Objects/dynamicEntity";
import
  MeshedEntity
from "../Objects/meshedEntity";
import Player from "../Player/player";
import MC from "./mapController";

class EntityController{

  constructor(){}

  init = (theme) => {
    this.theme = theme;
    this.entities = {};
    this.index = 0;
    this.player = null;
    this.enemyN = 0;
    this.rainN = 0;
  };

  generateData = (size) => {
    let data = [];
    noise.seed(Math.random());
    for(let i = 0; i < size; i++){
      data.push([]);
      for(let j = 0; j < size; j++){
        let height = noise.perlin2(
          i/100,j/100
        );
        data[i].push(height * 4 + 4);
      }
    }
    return data;
  };

  createPlayer = (camera,position) => {
    let player = new Player({
      position: position,
      orientation: new Quaternion(),
      geometry: undefined,
      material: this.theme.player,
      shapes: undefined,
      camera: camera,
      key: "player",
    });

    return player;
  };

  loadPlayer = (player) => {
    World.addBody(player.body);
    Scene.add(player.mesh);
    this.player = player;
    return player;
  };

  unloadPlayer = (player) => {
    Scene.remove(player.mesh);
    World.removeBody(player.body);
  };

  loadBullet = (
    position, orientation, speed, mass
  ) => {
    if(!Geometries.bullet)
      Geometries.loadBullet();
    let bulletGeo = Geometries.bullet;
    let bulletShape = new Sphere(
        4 * bulletGeo.boundingBox.max.z
    );
    let bulletMaterial = this.theme.bullet;
    let bulletBody = new Body({
      mass: mass,
      linearDamping: 0.1,
      material: materials.bullet,
    });

    let bullet = new DynamicEntity({
      position: position,
      orientation: orientation,
      body: bulletBody,
      shapes: [bulletShape],
      geometry: bulletGeo,
      material: bulletMaterial,
    });

    World.addBody(bullet.body);
    Scene.add(bullet.mesh);


    bullet.setVelocity(
      new Vector3(
        0,0,-1
      ).multiplyScalar(speed)
    );

    bullet.body.addEventListener(
      "collide", (e) => {
        bullet.remove = true;
      }
    );

    this.entities[this.index++] = bullet;
  };

  loadBall = (position) => {
    position = new Vector3().copy(position);
    let ballGeo = new SphereGeometry(4,8,8);
    let ballShape = new Sphere(4);
    let ballMaterial = this.theme.ball;
    let ballBody = new Body({
      mass: 200,
      linearDamping: 0.4,
      material: materials.ball,
    });
    ballBody.addShape(ballShape);

    let ball = new DynamicEntity({
      position: position,
      orientation: new Quaternion(),
      body: ballBody,
      geometry: ballGeo,
      material: ballMaterial,
      key: "ball"
    });

    Scene.add(ball.mesh);
    World.addBody(ball.body);

    this.entities[ball.key] = ball;
  };

  loadGoal = (position) => {
    position = new Vector3().copy(position);
    if(debug){
      position = this.entities[
        "ball"
      ].position.clone().add({x:0,y:0,z:-12});
    }

    let goal = new Goal({
      position: position,
      material: this.theme.floor,
      beaconMaterial: this.theme.beacon
    });

    goal.body.addEventListener(
      "collide", (e) => {
        if(!e.body.material) return;
        if(e.body.material.name === "ball")
          this.loadWin();
      }
    );

    Scene.add(goal.mesh);
    World.addBody(goal.body);

    this.entities[goal.key] = goal;
  };

  unloadGoal = () => {
    let goal = this.entities["goal"];
    this.removeEntity(goal);
  };

  createEnemy = () => {
    let should = Math.random() > 0.998;
    if(!should) return;

    let offset = new Vector3(
      Math.random() * -32,
      Math.random() * 10 + 10,
      Math.random() * 32
    );

    /*offset.applyQuaternion(
      this.player.orientation
    );*/

    let pos = new Vector3().copy(
      this.player.body.position.vadd(offset)
    );

    let index = this.trimEnemies(
      this.player.position
    );
    this.loadEnemy(pos, index);
  };

  loadEnemy = async (position, index) => {
    if(index === -1) return;

    let enemyMaterial = this.theme.enemy;

    let enemy = new Enemy({
      position: position,
      orientation: new Quaternion().
      setFromAxisAngle(
        new Vector3(0,1,0),
        Math.random() * Math.PI * 2
      ),
      material: enemyMaterial,
      hitRain: this.hitRain,
      ball: this.entities["ball"],
      slerpStep: 1,
      key: "enemy" + index,
    });

    Scene.add(enemy.mesh);
    World.addBody(enemy.body);


    World.addEventListener(
      "preStep", enemy.preStepFunction
    );

    this.entities[enemy.key] = enemy;

  };

  trimEnemies = (position) => {
    let n = this.enemyN;
    if(n < 10) return this.enemyN++;

    let max = 0, maxi = 0;
    for(let i = 0; i < n; i++){
      let e = this.entities["enemy"+i];
      if(e === undefined){
        return i;
      }
      let d = e.body.position.vsub(
        position
      ).lengthSquared();
      max = d > max ? d : max;
    }
    if(max > this.fogDist ** 2){
      let e = this.entities["enemy"+maxi];
      e.remove = true;
      this.removeEntity(e,"enemy"+maxi);
      return maxi;
    }

    return -1;
  };

  unloadEntities = () => {
    for(let name in this.entities){
      this.removeEntity(
        this.entities[name], name
      );
    }
  };

  removeEntity = (e, key) => {
    if(e.body && e.body !== undefined)
      World.removeBody(e.body);
    if(e.mesh && e.mesh !== undefined)
      Scene.remove(e.mesh);
    delete this.entities[key];
  };

  hitRain = async ( dmg, position, velocity ) => {
    let rain = new DmgText({
      position: position,
      orientation: new Quaternion(),
      text: dmg,
      material: this.theme.damage,
      physicsMaterial: materials.damage,
      key: "rain" + this.rainN++
    });

    let lookPos = position.vadd(
      velocity.negate()
    );

    rain.mesh.lookAt(
      lookPos.x, lookPos.y, lookPos.z
    );

    rain.body.quaternion.copy(
      rain.mesh.quaternion
    );

    rain.orientation = rain.mesh.quaternion;

    Scene.add(rain.mesh);
    World.addBody(rain.body);
    this.entities[rain.key] = rain;
  };

  loadWin = async () => {
    if(!("winText" in this.entities)){
      let win = new WinnerText({
        player: this.player,
        material: this.theme.bullet,
      });
      this.entities["winText"] = win;
    }

    if(this.player.state !== "winner"){
      this.player.setWin();

      this.entities["winText"].attach();
    }
  };

  getEntity = (name) => {
    return this.entities[name];
  };

  setTheme = (theme) => {
    this.theme = theme;
  };

}

const EC = new EntityController();
export default EC;
