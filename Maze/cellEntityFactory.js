import {
  Box, Vec3, Body, Quaternion
} from "cannon";
import {
  Object3D, Mesh, PointLight, PointLightHelper
} from "three";

import CellEntity from "./cellEntity";
import
  Geometries
from "../assets/simpleGeometries";
import Materials from "../assets/materials";
import {
  materials
} from "../Physics/materials";
import Scene from "../Graphics/scene";


const mat = new Materials("devTheme");


class CellEntityProducer{

  constructor(size){
    this.size = size;
    this.mesh = this.buildMesh(size);
    this.bodies = this.buildBody();
  }

  produce = (model) => {
    const mesh = this.mesh.clone(true);

    const pos = new Vec3(
      model.position.x,
      0,
      -model.position.y
    ).scale(this.size);
    mesh.name = model.name;
    mesh.position.copy(pos);

    const bodies = [];
    for(let options of this.bodies){
      const o = this.cloneOptions(
        options
      );
      o.position = o.position.vadd(pos);
      let b = new Body(o);
      b.shape = b.shapes[0];
      bodies.push(b);
    }
    return new CellEntity(
      model, mesh, bodies
    );
  };

  buildMesh = (s) => {

    Geometries.resizeEnvironment(s);

    const wall = Geometries.getGeometry(
      "wall"
    );

    wall.computeBoundingBox();
    let wallDims = wall.boundingBox.max;

    const hs = s / 2;
    const wallHeight = wallDims.y;
    const wallWidth  = wallDims.x;
    const wallDepth  = wallDims.z;

    const c = hs - wallDepth;
    const e =  wallHeight;//c / 2 - 1;

    let positions = [
      [ -c, e,  0 ], // left
      [  c, e,  0 ], // right
      [  0, e, -c ], // bottom
      [  0, e,  c ]  // top
    ];

    let rotations = [
      Math.PI / 2,
      Math.PI / 2,
      0,
      0
    ];

    let wallNames = [
      "left","right","bottom","top"
    ];

    const cell = new Object3D();


    for(let i = 0; i < 4; i++){
      let wallMesh = new Mesh(
        wall, mat.wall
      );
      wallMesh.rotateOnAxis(
        {x: 0,y: 1,z: 0}, rotations[i]
      );
      wallMesh.name = wallNames[i];
      wallMesh.position.set(
        ...positions[i]
      );
      wallMesh.useQuaternions = true;

      cell.attach(wallMesh);

    }
    const floor = Geometries.getGeometry(
      "floor"
    );

    floor.computeBoundingBox();
    let floorDims = floor.boundingBox.max;
    const floorLength = floorDims.z * 2;
    const floorWidth =  floorDims.x * 2;
    const floorDepth =  floorDims.y;


    const floorMesh = new Mesh(
      floor, mat.floor
    );

    floorMesh.name = "floor";
    floorMesh.position.set(0,-floorDepth,0);

    cell.attach(floorMesh);

    return cell;
  };

  buildBody = () => {
    const cell = this.mesh;

    const bodies = [];

    // Iterate over meshes in 3d object
    for(let c of cell.children){
      // Use a plane instead of floors
      if(
        c.geometry === undefined ||
        c.name === "floor"
      )
        continue;
      let w = c.geometry.parameters.width;
      let h = c.geometry.parameters.height;
      let d = c.geometry.parameters.depth;
      let hw = w/2, hh = h/2, hd = d/2;


      const v = new Vec3(hw,hh,hd);
      const box = new Box(v);

      /*
       * Wrap parameters in options
       * for simple cloning
       */
      const options = {
        mass: 0,
        material: materials.env,
        shape: box,
        position: new Vec3().copy(c.position),
        quaternion: new Quaternion().copy(
          c.quaternion
        )
      };

      bodies.push(options);
    }

    return bodies;
  };

  cloneOptions = (o) => {
    const res = {
      mass: o.mass,
      material: o.material,
      shape: o.shape,
      position: new Vec3().copy(o.position),
      quaternion: new Quaternion().copy(
        o.quaternion
      )
    };
    return res;
  };
};

class CellEntityConsumer{
  constructor(models, size){
    this.models = models;
    this.producer = new CellEntityProducer(
      size
    );
  }

  consume = () => {
    let entities = {};
    for(let model in this.models){
      const entity = this.producer.produce(
        this.models[model]
      );
      entities[model] = entity;
    }
    return entities;
  };
};

export default CellEntityConsumer;
