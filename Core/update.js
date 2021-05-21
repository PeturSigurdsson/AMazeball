import { Vector3, Quaternion } from "three";

import MC from "./mapController";
import EC from "./entityController";
import World from "../Physics/world";

export default class Update{

  constructor(player,oldGame, theme){
    this.player = player;
    this.theme = theme;
    oldGame = oldGame || {};


    EC.init(theme);

    MC.init(
      player,
      theme,
      oldGame.maze
    );

    MC.loadEnvironment();

    if(
      oldGame.player !== undefined &&
      oldGame.ball   !== undefined &&
      oldGame.goal   !== undefined
    ) this.applyState(oldGame);
    else this.initializeEntities();

    MC.rotateCellBodies();

    this.framesPerSec = 10;
    this.framerate = 1 / this.framesPerSec;
  };

  initializeEntities = () => {
    let [
      ballPos, goalPos
    ] = MC.placeEntities();

    EC.loadBall(ballPos);
    EC.loadGoal(goalPos);

    MC.setBall(EC.getEntity("ball"));

    let playerPos = ballPos.clone();

    playerPos.y += -2;

    this.player.moveTo(playerPos);
    EC.loadPlayer(this.player);
  }

  applyState = (state) => {
    EC.loadBall(new Vector3().fromArray(
      state.ball.position
    ));
    EC.loadGoal(new Vector3().fromArray(
      state.goal.position
    ));
    this.player.moveTo(
      new Vector3().fromArray(
        state.player.position
      )
    );
    EC.loadPlayer(this.player);

    let ball = EC.entities["ball"];
    let goal = EC.entities["goal"];
    ball.orient(new Quaternion().fromArray(
      state.ball.orientation
    ));
    goal.orient(new Quaternion().fromArray(
      state.goal.orientation
    ));
    this.player.orient(
      new Quaternion().fromArray(
        state.player.orientation
      )
    );

    MC.setBall(ball);
  };

  update = async (dt) => {
    World.step(this.framerate);
    this.player.update(dt);
    for(let e in EC.entities){
      let entity = EC.entities[e];
      if(entity.remove)
        EC.removeEntity(entity, e);
      else
        entity.update(dt);
    }
    if(this.player.fireBullet){
      let p = this.player.getBullet();
      EC.loadBullet(...p);
    }

    EC.createEnemy();

    MC.rotateCellBodies();
  };

  reloadSimulation = () => {
    // Reset states
    this.player.state = "player";
    if("winText" in EC.entities){
    }
    EC.entities["winText"].detach();
    MC.unloadEnvironment();
    EC.unloadEntities();

    // Load new environment
    MC.createMaze();
    MC.loadMaze();
    EC.init(this.theme);
    this.initializeEntities();
  };

  getState = () => {
    let ball = EC.getEntity("ball");
    let goal = EC.getEntity("goal");
    return {
      player: {
        position: this.player.
        position.toArray(),
        orientation: this.player.
        orientation.toArray()
      },
      ball: {
        position: ball.position.toArray(),
        orientation: ball.orientation.toArray()
      },
      goal: {
        position: goal.position.toArray(),
        orientation: goal.orientation.toArray()
      },
      maze: MC.getMaze()
    };
  };

  getTheme = () => {
    return this.theme;
  };

}
