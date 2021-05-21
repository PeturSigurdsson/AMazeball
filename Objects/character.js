import DynamicEntity from "./dynamicEntity";

/* Forty five */
const ff = Math.PI / 4;
/* One hundred thirty five */
const htf = Math.PI-ff;
/* Two hundred twenty five */
const ttf = Math.PI+ff;
/* Three hundred fifteen */
const tft = 2 * Math.PI - ff;


class Character extends DynamicEntity{
  constructor(props){
    super(props);

    this.animations = props.animations || [];
    this.animationsmap = props.animationsmap ||
      {};
    this.stateName = "idle";
    this.state = this.animations[
      this.animationsmap[this.stateName]
    ];
  }

  move = (v) => {

    let length = v.length();

    let ax = Math.abs(v.x);
    let ay = Math.abs(v.y);

    let axis = ax > ay ? 0 : 1;
    if( Math.abs(length) < 0.1 ){
      this.changeState("idle");
    } else {
      let angle = Math.atan2(v.x,v.y);

      let forward = (
        delta < ff || delta > thf
      );

      let left = (
        delta > ff && delta < htf
      );

      let backward = (
        delta > htf && delta < ttf
      );

      let right = (
        delta > ttf && delta < tft
      );

      let stateName = forward ?
        "walk" : left ?
        "strafeLeft" : backward ?
        "backup" :
        "strafeRight";

      this.changeState(stateName);

    }
  }

  update(){
    super.update();
  };

  changeState = (state) => {
    if(this.stateName === next) return;
    this.state.crossfade(this.animations[
      this.animationsmap[next]
    ]);
  };
}

export default Character;
