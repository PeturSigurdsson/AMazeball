import {
  Mesh, Vector3, Quaternion
} from "three";

import Entity from "./entity";

class MeshedEntity extends Entity{
  constructor(props){

    super({
      geometry: props.geometry,
      key: props.key
    });

    this.position = props.position ||
      new Vector3();
    this.orientation = props.orientation ||
      new Quaternion();
    this.material = props.material;
    this.mesh = new Mesh(
      this.geometry, this.material
    );
    this.mesh.name = this.key;
    this.mesh.position.copy(this.position);
    this.mesh.quaternion.copy(
      this.orientation
    );
  }

  update(position, orientation){
    this.position.copy(position);
    this.orientation.copy(orientation);
    this.mesh.position.copy(position);
    this.mesh.quaternion.copy(orientation);
  };

  moveTo(position){
    this.mesh.position.copy(position);
    this.position.copy(position);
  }

  orient(orientation){
    this.mesh.quaternion.copy(orientation);
    this.orientation.copy(orientation);
  }
}

export default MeshedEntity;
