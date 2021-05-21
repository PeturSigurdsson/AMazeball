export default class Set{

  constructor(num){
    this.name = "Set" + num;
    this.cells = {};
    this.size = 0;
  }

  addCell = (cell) => {
    cell.set = this.name;
    this.cells[cell.name] = cell;
    this.size += 1;
  };

  union = (set) => {
    for(let cell in set.cells){
      this.addCell(set.cells[cell]);
    }
  };

}
