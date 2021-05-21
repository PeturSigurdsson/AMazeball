import Grid from "./grid";
import Set from "./set"
import {
  CellController
} from "./cell";

class Eller{

  constructor(props){
    let width = props.width || 16;
    let height = props.height || 16;

    this.g = new Grid(width, height);
    this.grid = this.g.model;
    this.sets = {};
    this.width = width;
    this.height = height;

    this.countSets = 0;


    for(let i = 0; i < this.height; i++){
      this.expandMaze();
    }

    this.clearEnclosures();
  };


  assignSets = (row) => {
    for(let cell in row){
      let set = new Set(this.countSets++);
      set.addCell(row[cell]);
      this.sets[set.name] = set;
    }
  };

  combineSets = (row) => {
    for(let name in row){
      let cell = row[name];
      if(!cell.next) return;
      let next = row[cell.next];
      if(
        cell.set !== next.set &&
        Math.random() >= 0.4
      ){
          CellController.joinRight(cell,next);
          let set1 = this.sets[cell.set];
          let set2 = this.sets[next.set];
          this.unionSets(set1, set2);
      }
    }
  };

  openDown = (row) => {
    let openings = this.randomInt(
      this.width - 1
    ) + 2;
    let arr = Object.values(row);
    for(let i = 0; i < openings; i++){
      let ind = this.randomInt(this.width-1);
      let cell = arr[ind];
      if(!cell.down) return;
      let down = this.grid.cells[cell.down];
      CellController.joinDown(cell,down);
      let set1 = this.sets[cell.set];
      let set2 = this.sets[down.set];
      this.unionSets(set1, set2);
    }
  };

  clearEnclosures = () => {
    Object.values(this.grid.cells).map(
      cell => {
        if(!cell.next) return;
        let next = this.grid.cells[cell.next];
        if(cell.set !== next.set){
          CellController.joinRight(cell,next);
          let set1 = this.sets[cell.set];
          let set2 = this.sets[next.set];
          this.unionSets(set1, set2);
        }
      }
    );
  };

  expandMaze = () => {
    let i = this.grid.rows.length - 1;
    let last = this.g.getRow(i);
    let row = this.g.addRow();
    this.assignSets(row);
    if(last) this.openDown(last);
    this.combineSets(row);
  };

  randomInt = (l) => {
    return Math.floor(Math.random() * l);
  };

  unionSets = (set1, set2) => {
    set1.union(set2);
    delete this.sets[set2];
  };

  getModel = () => {
    return this.grid;
  };

}

export default Eller;
