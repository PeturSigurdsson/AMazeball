
export default class Entity{

  constructor(props){
    this.remove = false;
    this.key = props.key || null;
    this.geometry = props.geometry;
  }
}
