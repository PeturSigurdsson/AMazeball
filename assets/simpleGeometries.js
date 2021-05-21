import {BoxGeometry, Mesh} from "three";

/* default:
 *  cell: Size      { s  },
 *        halfSize  { hs },
 *  wall: height    { wh },
 *        depth     { d  }
 */
let s = 16, hs = s / 2, wh = hs, d = 3;

/* default:
 *  body: width   { bw },
 *        height  { bh },
 *        depth   { bd }
 *
 */
let bw = 0.6, bh = 1.8, bd = 0.6;

class Geometry{
  constructor(){}

  resizeEnvironment(size){
    s = size;
    hs = s / 2;
    wh = hs;
    this.loadWall();
    this.loadFloor()
  }

  resizeOrganic(height){
    bh = height;
    bw = height / 3;
    bd = bw;
    this.loadBody();
    this.loadEnemy();
  }

  wall = null;
  floor = null;
  body = null;
  bullet = null;
  enemy = null;

  getGeometry = (geometry) => {
    if(!this[geometry]) this.load(geometry);
    return this[geometry];
  };

  load = (geometry) => {
    let f = this.loadFunctions[geometry];
    f();
  };

  loadWall = () => {
    this.wall = new BoxGeometry(s,wh,d);
    this.wall.computeBoundingBox();
  };

  loadFloor = () => {
    this.floor = new BoxGeometry(s, d, s);
    this.floor.computeBoundingBox();
  };

  loadBody = () => {
    this.body = new BoxGeometry(bw, bh, bd);
    this.body.computeBoundingBox();
  }

  loadBullet = () => {
    this.bullet = new BoxGeometry(0.1,0.1,0.2);
    this.bullet.computeBoundingBox();
  };

  loadEnemy = () => {
    this.enemy = new BoxGeometry(bh,bh,bh);
    this.enemy.computeBoundingBox();
  };

  loadFunctions = {
    wall: this.loadWall,
    floor: this.loadFloor,
    body: this.loadBody,
    bullet: this.loadBullet,
    enemy: this.loadEnemy,
  };


}

const Geometries = new Geometry();

export default Geometries;
