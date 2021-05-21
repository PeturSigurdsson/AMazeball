import {
  CellController,
  CellEntityConsumer
} from "./cell";

export default class Grid{

  constructor(position, width, cellSize){
    this.model = new GridModel();
    this.model.position = position;
    this.model.width = width;
    this.model.cellSize = cellSize;
  };

  getRow = (i) => {
    return this.model.rows[i];
  };

  addRow = () => {
    let row = {};

    for(let i = 0; i < this.model.width; i++){

      let cell = this.createCell(i);
      let position = cell.position;


      row[cell.name] = cell;
      this.model.cells[cell.name] = cell;

      if(position.x > 0){
        let prev = this.model.cells[
          this.createName({
            x: position.x - 1,
            y: position.y
          })
        ];
        prev.next = cell.name;
      }
      if(position.y > 0){
        let up = this.model.cells[
          this.createName({
            x: position.x,
            y: position.y - 1
          })
        ];
        up.down = cell.name;
      }
    }
    this.model.rows[
      this.model.height++
    ] = row;
    return row;
  };

  createCell = (i) => {
    let position = {
      x: i,
      y: this.model.height
    };

    let size = this.model.cellSize;

    let name = this.createName(position);

    let cell = CellController.getModel(
      position, size, name
    );

    return cell;
  };

  createName = (pos) => {
    return "Cell" + pos.x + "," + pos.y;
  };
};

class GridModel{
  position = null;
  width = null;
  height = 0;
  cellSize = null;
  cells = {};
  rows = [];
};

class GridManager{
  constructor(model, radius){
    this.model = model;
    this.radius = radius;
    this.entities = new CellEntityConsumer(
      model.cells, model.cellSize
    );
  }

  getCells = (position) => {
    let l = this.model.rows.length;
    let rows = [];
    let row = this.model.rows[position.y];

    rows.push(row);

    for(let i = 1; i < this.radius; i++){

      let hi = position.y - i;
      let above = hi >= 0 ?
        this.model.rows[hi] :
        null;

      if(above) rows.push(above);

      let lo = position.y + i;
      let below = lo < l ?
        this.model.rows[lo] :
        null;

      if(below) rows.push(below);
    }

    let cells = {};
    for(let i = 0; i < this.radius; i++){
      let back = position.x - i;
      if(back >= 0){
        for(let j = 0; j < rows.length; j++){
          let cell = rows[j][i];
          cells[cell.name] = cell;
        }
      }
      let front = position.x + i;
      if(front < row.length){
        for(let j = 0; j < rows.length; j++){
          let cell = rows[i][j];
          cells[cell.name] = cell;
        }
      }
    }
    return cells;
  };
}
