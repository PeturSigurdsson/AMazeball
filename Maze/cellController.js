import CellModel from "./cellModel.js";

class Controller{

  setNext = (cell, next) => {
    cell.next = next;
  };

  setDown = (cell, down) => {
    cell.down = down;
  };

  join = (cell, adjacent, direction) => {
    cell.walls[direction[0]] = false;
    adjacent.walls[direction[1]] = false;
  };

  joinRight = (cell, right) => {
    this.join(cell, right, ["right","left"]);
  };

  joinDown = (cell, down) => {
    this.join(cell, down, ["bottom", "top"]);
  };

  assignSet = (cell, setName) => {
    cell.set = setName;
  };

  getModel = (position, size, name) => {
    let cell = new CellModel();
    cell.position = position;
    cell.size = size;
    cell.name = name;
    return cell;
  };

  getNameFromPosition = (pos) => {
    return "Cell" + pos.x + "," + pos.y;
  };
}

const CellController = new Controller();
export default CellController;
