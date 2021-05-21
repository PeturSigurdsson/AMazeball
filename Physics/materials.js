import {
  Material,
  ContactMaterial
} from "cannon";

export const materials = {};

const contactMaterials = {};

export default class PhysicsMaterials{
  constructor(callback){
    this.callback = callback;

    this.addMaterial(
      "env", {}
    );

    this.addMaterial(
      "floor", {}
    );

    this.addMaterial(
      "org", {
        env: {
          friction: 0.9,
          restitution: 1
        },
        floor: {
          friction: 0,
          restitution: 0.001
        },
        org: {
          friction: 0.0,
          restitution: 0.2
        }
      }
    );

    this.addMaterial(
      "ball", {
        floor: {
          friction: 0.3,
          restitution: 0.99
        },
        env: {
          friction: 0.6,
          restitution: 0.99
        },
        org: {
          friction: 0.0001,
          restitution: 0.7
        },
      }
    );

    this.addMaterial(
      "bullet", {
        org: {
          friction: 0.6,
          restitution: 0
        },
        ball: {
          friction: 0.99,
          restitution: 0
        }
      }
    );

    this.addMaterial(
      "damage", {}
    );
  }

  /* @input { name: string }: name of material
   * @input { contact: {
   *  name: {
   *    friction: Number: 0-1,
   *    restitution: Number: 0-1
   *  },
   *  ...
   *  name: {
   *    ...
   *  }
   * } }: contact attributes
   */
  addMaterial = (name, contact) => {
    materials[name] = new Material(name);

    for(let m in materials){
      let mat = materials[m];

      if(m in contact){
        let cm = new ContactMaterial(
          materials[name],
          materials[m],
          contact[m]
        );

        cm.contactEquationStiffness = 1e20;
        cm.contactEquationRelaxation = 1;

        contactMaterials[
          "" + name + "x" + m + ""
        ] = cm;

        if(this.callback != undefined){
          this.callback(cm);
        }
      }
    }
  };

  getMaterial = (name) => {
    return materials[name];
  };
}
