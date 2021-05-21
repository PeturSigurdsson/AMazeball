import React from "react";
import {
  StyleSheet, AsyncStorage as Ass, AppState
} from "react-native";
import { Clock } from "three";
import {
  ExpoWebGLRenderingContext,
  GLView
} from "expo-gl";

import { Renderer }from "expo-three";

import {
  TouchLayout
} from "./Controller/controller";
import Scene from "./Graphics/scene";
import World from "./Physics/world";
import Simulation from "./Core/simulation";

global.debug = true;

class Game extends React.Component{

  constructor(props){
    super(props);
    this.state = props.route.params.state;
    this.renderClock = new Clock();
    this.timeout;
    this.sim = new Simulation();
    this.player = this.sim.player;
    this.hudClock = new Clock();
    this.hudMaxRenderSpeed = 1 / 60;


    AppState.addEventListener(
      "change", () => {
        let cur = AppState.currentState;
        if(cur === "background"){
          this.props.save(
            this.sim.getState, "gameState"
          );
        }
      }
    );

    clearTimeout(this.timeout)
  }

  componentWillUnmount = () => {
    this.props.save(
      this.sim.getState(),"gameState"
    );
    this.sim.exitSimulation = true;
  };

  render = () => {
    return (
      <TouchLayout
      shouldRender = {() => {
        return (
          this.hudClock.getDelta() >
          this.hudMaxRenderSpeed
        );
      }}

      baseOpacity = { 0.2 }
      touchOpacity = { 0.5 }
      actions = {this.player.actions}
      color = {""}
      style={styles.Container}
      >
      <GLView
      style={{flex: 1}}
      onContextCreate={
        async(gl: ExpoGlRenderingContext) => {

          const {
            drawingBufferWidth: width,
            drawingBufferHeight: height
          } = gl;


          this.sim.init(
            gl, this.state, width, height
          );

          this.sim.update();
        }}
      />
      </TouchLayout>
    );
  }
}

const styles = StyleSheet.create({
  Container: {
    flex: 1,
  },
});

export default Game;
