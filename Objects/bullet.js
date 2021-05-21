import { Body, Sphere } from "cannon";
import
  Geometries
from "../assets/simpleGeometries";

class Bullet extends DynamicEntity{
  constructor(props){

    let geo = Geometries.loadBullet();
    props.geometry = geo;
    let shape = new Sphere(
      geo.boundingBox.max.z * 4
    );
    let body = new Body({
      mass: props.mass,
      material: props.physicsMaterial
    });
    props.body = body;

    super(props);

    this.muzzleVel = props.muzzleVel;
    this.hits = 0;

    body.addEventListener(
      "collide", this.hit
    );

    body.velocity.copy({
      x:0, y:0, z: -this.muzzleVel
    });
  }

  hit = (e) => {
    if(this.hits++ > 3) this.remove = true;
  };
}
