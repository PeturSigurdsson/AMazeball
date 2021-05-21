export default class CellModel{
  position = null;
  size = null;
  name = null;
  next = null;
  down = null;
  set = null;
  walls = {
    top : true,
    bottom: true,
    left: true,
    right: true
  };
};
