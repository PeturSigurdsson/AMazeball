import {
  MeshLambertMaterial, MeshStandardMaterial
} from "three";
import {TextureLoader} from "expo-three";

const tl = new TextureLoader();

const loadDevTheme = () => {

  const bgColor = "lightpink";

  const wallMaterial = new MeshStandardMaterial({
    map: tl.load(require("./icon.png")),
    bumpMap: tl.load(require("./shrub.png")),
    bumpScale: 0.01
  });

  const floorMaterial = new MeshStandardMaterial({
    map: tl.load(require("./tile.png")),
    bumpMap: tl.load(require("./tile.png")),
    bumpScale: 0.8
  });
  const playerMaterial = new MeshLambertMaterial({
    map: tl.load(require("./greySquare.png"))
  });
  const bulletMaterial = new MeshLambertMaterial({
    map: tl.load(require("./greySquare.png"))
  });
  const ballMaterial = new MeshLambertMaterial({
    map: tl.load(require("./boltaMynstur.png"))
  });

  const coverMaterial = new MeshLambertMaterial({
    emissive: "deeppink",
    emissiveIntensity: 0.5,

  });

  coverMaterial.fog = false;

  const skyMaterial = new MeshLambertMaterial({
    emissive: "orangered",
    emissiveIntensity: 0.5
  });

  skyMaterial.fog = false;

  const sunMaterial = new MeshLambertMaterial({
    emissive: "deeppink",
    emissiveIntensity: 0.5
  });

  sunMaterial.fog = false;

  const beacMaterial = new MeshLambertMaterial({
    emissive: "lightblue",
    emissiveIntensity: 0.9,
  });

  beacMaterial.fog = false;

  const eneMaterial = new MeshStandardMaterial({
    map: tl.load(require("./bee.png"))
  });

  const dmgMaterial = new MeshLambertMaterial({
    emissive: "red",
    emissiveIntensity: 0.55
  });

  return {
    bgColor: bgColor,
    wall: wallMaterial,
    floor: floorMaterial,
    player: playerMaterial,
    bullet: bulletMaterial,
    ball: ballMaterial,
    cover: coverMaterial,
    sky: skyMaterial,
    sun: sunMaterial,
    beacon: beacMaterial,
    enemy: eneMaterial,
    damage: dmgMaterial,
  };
};

const themes = {
  devTheme: loadDevTheme,
};

export default class Materials{
  constructor(theme){
    const f = themes[theme];
    const {
      bgColor, wall, floor, player, bullet,
      ball, cover, sky, sun, beacon, enemy,
      damage
    } = f();
    this.wall = wall;
    this.floor = floor;
    this.player = player;
    this.bullet = bullet;
    this.ball = ball;
    this.cover = cover;
    this.sky = sky;
    this.sun = sun;
    this.beacon = beacon;
    this.enemy = enemy;
    this.damage = damage;
  }
}
