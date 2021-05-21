import {
  CircleGeometry, CylinderGeometry,
  DirectionalLight, Fog, HemisphereLight,
  PlaneGeometry, Quaternion, Vector3
} from "three";

import { Plane, Body } from "cannon";
import
  MeshedEntity
from "../Objects/meshedEntity";
import Scene from "../Graphics/scene";
import World from "../Physics/world";
import materials from"../Physics/materials";
import Eller from "../Maze/eller";
import {
  CellEntityConsumer
} from "../Maze/cell";

class MapController{
  constructor(){}

  init = (player, theme, mazeModel) => {
    console.log("mcinit");
    this.player = player;
    this.theme = theme;
    this.oldState = false;
    if(mazeModel !== undefined){
      this.oldState = true;
    }

    this.mazeModel = mazeModel || {};

    this.numCells = this.mazeModel.width ||
      Math.ceil(Math.random() * 8 + 8);

    this.cellSize=this.mazeModel.cellSize ||
      Math.ceil(Math.random() * 16 + 16);

    this.activeCells = [];

    this.fogDist = 50;
    this.surrSize = 6;

    this.activePos = {
      player: {
        x: -this.surrSize,
        y: -this.surrSize
      },
      ball: {
        x: -this.surrSize,
        y: -this.surrSize
      }
    };
  };

  loadEnvironment = () => {
    this.loadSkybox
    (2*2*this.numCells*this.cellSize
    );
    this.loadLights();
    this.loadGround(
      this.numCells*this.cellSize
    );

    if(!this.oldState){
      console.log("making new maze");
      this.createMaze();
    }

    this.loadMaze();
  };

  unloadEnvironment = () => {
    this.unloadMaze();
  };

  rotateCellBodies = () => {
    let cells = {};
    let pEdge = this.edge(
      this.player.position, this.player.key
    );
    if(pEdge){
      let cP = this.surroundingCells(
        this.player.position,
        this.player.key
      );
      for(let name of cP) cells[name] = 1;
    }

    let bEdge = this.edge(
      this.ball.position, this.ball.key
    );
    if(bEdge){
      let cB = this.surroundingCells(
        this.ball.position,
        this.ball.key
      );
      for(let name of cB) cells[name] = 1;
    }

    if(pEdge || bEdge){
      this.swapActiveCells(cells);
    }
  };

  placeEntities = () => {
    let dx = 0, dy = 0, d = this.numCells / 2;
    let goalCell = null, ballCell = null;
    goalCell = this.chooseRandomCell();

    while(dx + dy < d){
      ballCell = this.chooseRandomCell();

      dx = Math.abs(
        goalCell.position.x -
        ballCell.position.x
      );
      dy = Math.abs(
        goalCell.position.y -
        ballCell.position.y
      );
    }

    let ballPos = new Vector3(
      ballCell.position.x * this.cellSize,
      20,
      -ballCell.position.y * this.cellSize
    );

    let goalPos = new Vector3(
      goalCell.position.x * this.cellSize,
      20,
      -goalCell.position.y * this.cellSize
    );

    return [ballPos, goalPos];
  };

  loadSkybox = (size) => {
    Scene.fog = new Fog(
      "hotpink", 0, this.fogDist
    );

    let coverGeo = new CylinderGeometry(
      size, size, 500
    );

    let coverMaterial = this.theme.cover;

    let pos = new Vector3(0,0,0);
    coverMaterial.side = 1;
    let cover = new MeshedEntity({
      position: pos,
      orientation: new Quaternion(),
      geometry: coverGeo,
      material: coverMaterial,
    });

    Scene.add(cover.mesh);

    let skyGeo = new PlaneGeometry(
      2 * size, 2 * size,
    );


    let skyMaterial = this.theme.sky;
    skyMaterial.side = 0;
    let sky = new MeshedEntity({
      position: pos.clone().add(new Vector3(
        0,260,0
      )),
      orientation: new Quaternion().
      setFromAxisAngle(
        new Vector3(1,0,0), Math.PI / 2
      ),
      geometry: skyGeo,
      material: skyMaterial
    });

    Scene.add(sky.mesh);

    let sunGeo = new CircleGeometry(300,50);
    let sunMaterial = this.theme.sun;
    sunMaterial.side = 1;

    let sun = new MeshedEntity({
      position: new Vector3(
        size / 2,150,-size / 2
      ),
      orientation: new Quaternion().
      setFromAxisAngle(
        new Vector3(0,1,0), Math.PI / 2
      ),
      geometry: sunGeo,
      material: sunMaterial
    });

    Scene.add(sun.mesh);
  };

  loadLights = () => {

    const dl = new DirectionalLight(
      "white", 1
    );
    dl.position.set(0,10,0);
    dl.target.position.set(100,1,100);
    const al = new HemisphereLight(
      "white", "darkgrey", 0.6
    );
    Scene.add(dl);
    Scene.add(al);
  };

  loadGround = (size) => {
    let ground = new Plane();
    let groundBody = new Body({
      mass: 0,
      material: materials.floor
    });

    groundBody.addShape(ground);
    groundBody.quaternion.setFromAxisAngle(
      new Vector3(1,0,0), -Math.PI/2
    );

    World.addBody(groundBody);
  };

  createMaze = () => {
    let size = this.numCells;
    let maze = new Eller(size,size);
    this.mazeModel = maze.getModel();
    this.mazeModel.cellSize = this.cellSize;
  };

  loadMaze = () => {
    // Shorter names for small screen
    let size = this.numCells;
    let cellSize = this.cellSize;

    let model = this.mazeModel;

    let factory = new CellEntityConsumer(
      model.cells, cellSize, this.theme
    );
    let e = factory.consume();
    for(let entity in e){
      let cell = e[entity];
      this.loadCell(cell);
    }
    this.cellEntities = e;
  };

  unloadMaze = () => {
    for(let name in this.cellEntities){
      let e = this.cellEntities[name];
      Scene.remove(e.mesh);
    }

    for(let e of this.activeCells){
      this.unloadCellBodies(
        this.cellEntities[e]
      );
    }

    this.cellEntities = {};
    this.mazeModel = {};
  };

  loadCell = (cell) => {
    Scene.add(cell.mesh);
  };

  loadCellBodies = (cell) => {
    if(cell === undefined) {
      return;
    }
    for(let body of cell.bodies){
      if(body){ World.addBody(body); }
    }
  };

  unloadCellBodies = (cell) => {
    if(cell === undefined) {
      return;
    }
    for(let body of cell.bodies){
      if(body){ World.removeBody(body); }
    }
  };

  chooseRandomCell = () => {
    let arr = Object.keys(
      this.mazeModel.cells
    );
    let l = arr.length;

    let index = Math.floor(
      Math.random() * l
    );
    return this.mazeModel.cells[arr[index]];
  };

  surroundingCells = (position, name) => {
    let x = Math.floor(
      position.x / this.cellSize
    );
    let y = Math.floor(
      -position.z / this.cellSize
    );

    let cells = [];

    for(let i = -2; i <= this.surrSize; i++){
      for(let j = -2; j <= this.surrSize; j++){
        let cell = "Cell" + (x+i) + "," + (y+j);
        if(cell in this.cellEntities)
          cells.push(cell);
      }
    }

    this.activePos[name].x = x;
    this.activePos[name].y = y;

    return cells;
  };

  edge = (position, name) => {
    let x = Math.floor(
      position.x / this.cellSize
    );
    let y = Math.floor(
      -position.z / this.cellSize
    );
    return (
      Math.abs(
        x - this.activePos[name].x
      ) >= this.surrSize / 2 ||
      Math.abs(
        y - this.activePos[name].y
      ) >= this.surrSize / 2
    );
  };

  swapActiveCells = (cells) => {
    for(let cell of this.activeCells){
      if(cell in cells){
        delete cells[cell];
        continue;
      }
      this.unloadCellBodies(
        this.cellEntities[cell]
      );
    }

    let arr = Object.keys(cells);
    for(let cell of arr){
      this.loadCellBodies(
        this.cellEntities[cell]
      );
    }

    this.activeCells = arr;
  };

  setBall = (ball) => {
    this.ball = ball;
  };

  getMaze = () => {
    return this.mazeModel;
  };

  setMaze = (mazeModel) => {
    this.mazeModel = mazeModel;
  };
}

const MC = new MapController();
export default MC;
