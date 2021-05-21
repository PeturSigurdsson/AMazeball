import {
  Scene as s,
  AmbientLight,
} from "three";

let Scene = new s();


const LoadScene = () => {
  let ns = new s();
  for(let p in ns) Scene[p] = ns[p];
};

const UnloadScene = () => {
  for(let p in Scene) Scene[p] = null;
};
export {UnloadScene, LoadScene};
export default Scene;
