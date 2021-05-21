import React, { Component } from "react";
import {
  View, PanResponder, Dimensions, StyleSheet
} from "react-native";

// Private constants
const {
  width,
  height
} = Dimensions.get("screen");

// Ratio of screen reserved for a button size
const ratio = 0.2;
// Button height
const bh = height * ratio;
// Half height
const hh = bh / 2;
// Height of the end of fire button
const fh = height - (2 * bh);
// Height of the end of walk button
const wh = fh + bh;
// Jump button is beneath

// Button width
const bw = width / 3;
// Width at end of walk button
const ww = 2 * bw;
// Half width
const hw = bw / 2;

/*
_____________
|           |
|           |
|     F     |
|           |
|           |
|___________| fh
| c | w | a |
|___|___|___| wh
|     j     |
|___________| h
  bw  ww

*/

// Private variables

const walkPos = {
  x: bw,
  y: fh,
  center:{
    x: bw + hw,
    y: fh + hh
  }
}

const pointer = {
  width: hw,
  hw: hw / 2,
  height: hh,
  hh: hh / 2,
  max: hw,
  center: {
    x: walkPos.center.x - (hw/2),
    y: walkPos.center.y - (hh/2)
  },
  offset: {
    x: 0,
    y: 0
  },
  trim: (ratio,offset,max) => {
    if(ratio > 1){
      let xx = offset.x ** 2;
      let yy = offset.y ** 2;

      let length = Math.sqrt(xx + yy);

      offset.x = offset.x / length * max;
      offset.y = offset.y / length * max;
    }
  }
};




// Object template for actions
class ActionObject{
  constructor(k,g,m,r){
    this.key = k;
    this.grant = g;
    this.move = m;
    this.release = r;
  }
  active = false;
};

/*
 * Keeps the callbacks provided by parent
 * accessible to private functions.
 */
let callbacks = {
  fire: {
    grant: undefined,
    move: undefined,
    release: undefined
  },
  crouch: {
    grant: undefined,
    move: undefined,
    release: undefined
  },
  walk: {
    grant: undefined,
    move: undefined,
    release: undefined
  },
  act: {
    grant: undefined,
    move: undefined,
    release: undefined
  },
  jump: {
    grant: undefined,
    move: undefined,
    release: undefined
  }
}


class TouchLayout extends Component {

  constructor(props){
    super(props);
    for(let action in callbacks)
      callbacks[action] = props.actions[
        action
      ];
    this.state = {
      pointer: {
        x: pointer.center.x,
        y: pointer.center.y
      },
      fireOpacity: this.props.baseOpacity
        || 0,
      crouchOpacity: this.props.baseOpacity
        || 0,
      walkOpacity: this.props.baseOpacity
        || 0,
      actOpacity: this.props.baseOpacity
        || 0,
      jumpOpacity: this.props.baseOpacity
        || 0
    };
  }



  /*
   * Actions call the callbacks provided by
   * parent.
   */
  actions = {
    fire : new ActionObject(
      "fire",
      (e) => {
          this.setState({
            fireOpacity: this.props.
              touchOpacity || 0.5
          });
        if(callbacks.fire.grant !== "undefined")
          callbacks.fire.grant();
      },
      (e,id) => {
        let touch = e.touchHistory.touchBank[
          id
        ];

        let start = {
          x: touch.startPageX,
          y: touch.startPageY
        };

        let delta = {
          x: touch.currentPageX - start.x,
          y: touch.currentPageY - start.y
        };

        if(
          callbacks.fire.move !==
          "undefined"
        ) callbacks.fire.move(delta);
      },
      (e) => {
        this.setState({
          fireOpacity: this.props.baseOpacity
            || 0
        });
        if(
          callbacks.fire.release !==
          "undefined"
        ) callbacks.fire.release();
      }
    ),
    crouch : new ActionObject(
      "crouch",
      (e) => {
        this.setState({
          crouchOpacity:
          this.props.touchOpacity || 0.5
        });
        if(
          callbacks.crouch.grant !==
          "undefined"
        ) callbacks.crouch.grant();
      },
      (e, id) => {
        if(
          callbacks.crouch.move !==
          "undefined"
        ) callbacks.crouch.move();
      },
      (e) => {
        this.setState({
          crouchOpacity:
          this.props.baseOpacity || 0
        });
        if(
          callbacks.crouch.release !==
          "undefined"
        ) callbacks.crouch.release();
      }
    ),
    walk : new ActionObject(
      "walk",
      (e) => {
        this.setState({
          walkOpacity:
          this.props.touchOpacity || 0.5
        });
        if(
          callbacks.walk.grant !==
          "undefined"
        ) callbacks.walk.grant();
      },
      (e,id) => {

        let t = e.touchHistory.touchBank[id];

        pointer.offset = {
          x: t.currentPageX -
          walkPos.center.x,

          y: t.currentPageY -
          walkPos.center.y
        };

        let radius = Math.sqrt(
          pointer.offset.x ** 2 +
          pointer.offset.y ** 2
        );

        let ratio = radius / pointer.max;
        pointer.trim(
          ratio,pointer.offset,pointer.max
        );

        if(this.props.shouldRender()){
          this.setState({
            pointer: {
              x: walkPos.center.x -
                 pointer.hh +
                 pointer.offset.x,
              y: walkPos.center.y -
                 pointer.hh +
                 pointer.offset.y
            },
            walkOpacity: 0.5
          });
        }
        if(
          callbacks.walk.move !==
          "undefined"
        ) callbacks.walk.move(
          pointer.offset, ratio
        );
      },
      (e) => {
        this.setState({
          pointer:{
            x: pointer.center.x,
            y: pointer.center.y
          },
          walkOpacity: this.props.baseOpacity
            || 0
        });
        if(
          callbacks.walk.release !==
          "undefined"
        ) callbacks.walk.release();
      }
    ),
    act : new ActionObject(
      "act",
      (e) => {
        this.setState({
          actOpacity:
          this.props.touchOpacity || 0.5
        });
        if(
          callbacks.act.grant !==
          "undefined"
        ) callbacks.act.grant();
      },
      (e) => {
        if(
          callbacks.act.move !==
          "undefined"
        ) callbacks.act.move();
      },
      (e) => {
        this.setState({
          actOpacity:
          this.props.baseOpacity || 0
        });
        if(
          callbacks.act.release !==
          "undefined"
        ) callbacks.act.release();
      }
    ),
    jump : new ActionObject(
      "jump",
      (e) => {
        this.setState({
          jumpOpacity:
          this.props.touchOpacity || 0.5
        });
        if(
          callbacks.jump.grant !==
          "undefined"
        ) callbacks.jump.grant();
      },
      (e) => {
        if(
          callbacks.jump.move !==
          "undefined"
        ) callbacks.jump.move();
      },
      (e) => {
        this.setState({
          jumpOpacity:
          this.props.baseOpacity || 0
        });
        if(
          callbacks.jump.release !==
          "undefined"
        ) callbacks.jump.release();
      }
    )
  };

  walkListener = (e) => {
    let th = e.touchHistory;
    this.actions.walk.move(
      e, th.indexOfSingleActiveTouch
    );
    this.otherActions(e);
  };


  layoutMap = (p) => {
    if( p.y > fh ){
      if( p.y < wh ){
        if( p.x > bw ){
          if( p.x < ww ){
            return this.actions.walk;
          } return this.actions.act;
        } return this.actions.crouch;
      } return this.actions.jump;
    } return this.actions.fire;
  };


  otherActions = (evt) => {
    let th = evt.touchHistory;
    let actives = {};
    for(let a in this.actions){
      if(this.actions[a].active)
        actives[a] = a;
    }

    let l = th.numberActiveTouches;
    for(let i = 0; i < l; i++){
      if(i == th.indexOfSingleActiveTouch)
        continue;
      let touch = th.touchBank[i];
      let action = this.layoutMap({
        x: touch.currentPageX,
        y: touch.currentPageY
      });
      if(
        touch.startTimeStamp ===
        touch.previousTimeStamp
      ) {
        action.grant(evt);
        delete actives[action.key]
        action.active = true;
      }
      else {
        action.move(evt,i);
        delete actives[action.key];
        action.active = true;
      }
    }
    for(let a in actives){
      let action = this.actions[a];
      action.release();
      action.active = false;
    }
  };

  render(){
    return (
      <View
      style = { this.props.style }
      >
      {this.props.children}
      <View
      style = {[ styles.fireButton, {
        opacity: this.state.fireOpacity,
        backgroundColor: this.props.color,
        borderColor: this.props.borderColor
        || "lightgrey"
      } ]}
      onStartShouldSetResponder = {
        () => true
      }
      onMoveShouldSetResponder = {
        () => true
      }
      accessible = { true }
      accessibilityRole = { "button" }
      onResponderGrant = {
        (e) => {
          this.actions.fire.grant(e);
        }
      }
      onResponderMove = {
        (e) => {
          let th = e.touchHistory;
          this.actions.fire.move(
            e, th.indexOfSingleActiveTouch
          );
          this.otherActions(e);
        }
      }
      onResponderRelease = {
        (e) => {
          this.actions.fire.release(e);
        }
      }
      >
      </View>
      <View
      style = {[ styles.crouchButton, {
        opacity: this.state.crouchOpacity,
        backgroundColor: this.props.color,
        borderColor: this.props.borderColor
        || "lightgrey"
      } ]}
      onStartShouldSetResponder = {
        () => true
      }
      onMoveShouldSetResponder = {
        () => true
      }
      accessible = { true }
      accessibilityRole = { "button" }
      onResponderGrant = {
        (e) => {
          this.actions.crouch.grant(e);
        }
      }
      onResponderMove = {
        (e) => {
          let th = e.touchHistory;
          this.actions.crouch.move(
            e, th.indexOfSingleActiveTouch
          );
          this.otherActions(e);
        }
      }
      onResponderRelease = {
        (e) => {
          this.actions.crouch.release(e);
        }
      }
      />
      <View
      style = {[ styles.walkButton, {
        borderColor: this.props.borderColor
        || "lightgrey"
      }]}
      onStartShouldSetResponder = {
        () => true
      }
      onMoveShouldSetResponder = {
        () => true
      }
      accessible = { true }
      accessibilityRole = { "button" }
      onResponderGrant = {
        (e) => {
          this.actions.walk.grant(e);
        }
      }
      onResponderMove = {
        this.walkListener
      }
      onResponderRelease = {
        (e) => {
          this.actions.walk.release();
        }
      }
      />
      <View
      style = {[ styles.actionButton,{
        opacity: this.state.actOpacity,
        backgroundColor: this.props.color,
        borderColor: this.props.borderColor
        || "lightgrey"
      } ]}
      onStartShouldSetResponder = {
        () => true
      }
      onMoveShouldSetResponder = {
        () => true
      }
      accessible = { true }
      accessibilityRole = { "button" }
      onResponderGrant = {
        (e) => {
          this.actions.act.grant(e);
        }
      }
      onResponderMove = {
        (e) => {
          let th = e.touchHistory;
          this.actions.act.move(
            e, th.indexOfSingleActiveTouch
          );
          this.otherActions(e);
        }
      }
      onResponderRelease = {
        (e) => {
          this.actions.act.release(e);
        }
      }
      />
      <View
      style = {[ styles.jumpButton,{
        opacity: this.state.jumpOpacity,
        backgroundColor: this.props.color,
        borderColor: this.props.borderColor
        || "lightgrey"
      }]}
      onStartShouldSetResponder = {
        () => true
      }
      onMoveShouldSetResponder = {
        () => true
      }
      accessible = { true }
      accessibilityRole = { "button" }
      onResponderGrant = {
        (e) => {
          this.actions.jump.grant(e);
        }
      }
      onResponderMove = {
        (e) => {
          let th = e.touchHistory;
          this.actions.jump.move(
            e, th.indexOfSingleActiveTouch
          );
          this.otherActions(e);
        }
      }
      onResponderRelease = {
        (e) => {
          this.actions.jump.release(e);
        }
      }
      />
      <View
      style = {[styles.pointer, {
        left: this.state.pointer.x,
        top: this.state.pointer.y,
        opacity: this.state.walkOpacity,
        backgroundColor: this.props.color,
        borderColor: this.props.borderColor
        || "lightgrey"
      }]}
      onStartShouldSetResponder = {
        () => true
      }
      onMoveShouldSetResponder = {
        () => true
      }
      accessible = { true }
      accessibilityRole = { "button" }
      onResponderGrant = {
        (e) => { this.actions.walk.grant(e) }
      }
      onResponderMove = {
        this.walkListener
      }
      onResponderRelease = {
        (e) => {
          this.actions.walk.release();
        }
      }
      />
      </View>
    );
  }
};

const styles = StyleSheet.create({
  fireButton: {
    position: "absolute",
    width: width,
    height: fh,
    top: 0,
    left: 0,
    borderWidth: StyleSheet.hairlineWidth,
  },
  walkButton: {
    position: "absolute",
    width: width / 3,
    height: bh,
    top: walkPos.y,
    left: walkPos.x,
    borderWidth: 1,
    opacity: 0.5,
    borderRadius: 100
  },
  crouchButton: {
    position: "absolute",
    width: width / 3,
    height: bh,
    top: fh,
    left: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth:StyleSheet.hairlineWidth
  },
  actionButton:{
    position: "absolute",
    width: width / 3,
    height: bh,
    top: fh,
    left: 2 * width / 3,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth:StyleSheet.hairlineWidth
  },
  jumpButton:{
    position: "absolute",
    width: width,
    height: bh,
    top: wh,
    left: 0,
    borderWidth: StyleSheet.hairlineWidth
  },
  pointer:{
    position: "absolute",
    width: pointer.width,
    height: pointer.height,
    borderRadius: bw,
    borderWidth: StyleSheet.hairlineWidth,
  }

});

export default TouchLayout;
