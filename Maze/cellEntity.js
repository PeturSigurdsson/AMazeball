const wallMap = {
  left: 0, right: 1, bottom: 2, top: 3
};

export default class CellEntity{

  constructor(model, mesh, bodies){
    this.model = model;
    this.mesh = mesh;
    this.bodies = bodies || [];

    for(let wall in this.model.walls)
      if(!this.model.walls[wall])
        this.removeWall(wall);

    if(this.model.position.x != 0)
      this.removeWall("left");
    if(this.model.position.y != 0)
      this.removeWall("top");
  }

  removeWall = (wall) => {
    let index = wallMap[wall];
    for(let child of this.mesh.children){
      if(child.name === wall){
        this.mesh.remove(child);
      }
    }
    this.bodies[index] = null;
  };
}
