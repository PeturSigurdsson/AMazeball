import DynamicEntity from "./dynamicEntity";
import {
  Vector3, Quaternion, Mesh,
  TorusGeometry, CylinderGeometry
} from "three";

import { Body, Box, Vec3 } from "cannon";

class Goal extends DynamicEntity {
  constructor(props){
    props = props || {};

    let radius = 3;
    let girth = 1;
    let segments = 8;

    let geometry = new TorusGeometry(
      radius,girth,segments,segments
    );
    props.geometry = geometry;

    let rightAngle = new Quaternion();
    rightAngle.setFromAxisAngle(
      new Vector3(1,0,0), Math.PI / 2
    );
    let goalBody = new Body({
      mass: 1000,
      angularDamping: 0.999,
      linearDamping: 0.999
    });
    let offset = new Vector3(
      0,radius,-girth/2
    );

    let axis = new Vector3(0,0,1);
    let startAngle = Math.PI / segments;
    let angle = 2 * Math.PI / segments;
    let boxLength = 2 * radius *
      Math.PI / segments / 2 + 0.1;
    let boxHeight = girth / 6;
    let boxWidth = girth / 2;
    for(let i = 1; i <= segments; i++){
      let q = new Quaternion();
      q.setFromAxisAngle(
        axis, startAngle + i * angle
      );
      let o = new Vector3().copy(offset);
      o.applyQuaternion(q);
      let shape = new Box(
        new Vec3(
          boxLength,boxWidth,boxHeight
        )
      );
      goalBody.addShape(shape,o,q);
    }
    props.body = goalBody;
    props.material = props.material;
    props.orientation = rightAngle.clone();
    props.key = "goal";
    super(props);

    this.createBeacon(
      radius,props.beaconMaterial
    );
  }

  update(){
    super.update();
  }

  createBeacon(radius,material){
    let beaconHeight = 200;
    let goalBeaconGeo = new CylinderGeometry(
      radius/2,radius/2, beaconHeight
    );

    goalBeaconGeo.computeBoundingBox();
    let min = goalBeaconGeo.boundingBox.min;
    let goalBeacon = new Mesh(
      goalBeaconGeo, material
    );

    goalBeacon.position.copy(this.position);
    goalBeacon.position.y -= min.y;
    this.mesh.attach(goalBeacon);
  }
}

export default Goal;
