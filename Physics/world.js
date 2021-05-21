import {
  World as w,
  ContactMaterial,
  GSSolver,
  SAPBroadphase,
  SplitSolver,
  Vec3
} from "cannon";

//import Grid from "../Core/grid";
import PhysicsMaterials from "./materials";

let World = new w();
World.gravity.set(0, -10, 0);
World.broadphase = new SAPBroadphase(World);

let gss = new GSSolver();
gss.iterations = 20;
gss.tolerance = 0.1;

let ss = new SplitSolver(gss);
World.solver = ss;

const mat = new PhysicsMaterials(
  (cmat) => {
    World.contactmaterials.push(cmat);
    World.contactMaterialTable.set(
      cmat.materials[0].id,
      cmat.materials[1].id,
      cmat
    );
  }
);

export default World;

const UnloadWorld = () => {
  for(let p in World) World[p] = null;
};

const LoadWorld = () => {
  const nw = new w();
  for(let p in nw) World[p] = nw[p];
};

export { UnloadWorld, LoadWorld };
