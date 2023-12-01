export default class Cell {
  x = 0;
  y = 0;
  color = "black";
  text = "";

  constructor(x = 0, y = 0, color = "black", text = "") {
    this.x = x;
    this.y = y;
    this.color = color;
    this.text = text;
  }

  /**
   * @param {Cell} cell 
   */
  isSameCell(cell) {
    return (
      this.x === cell.x &&
      this.y === cell.y &&
      this.color === cell.color &&
      this.text === cell.text
    );
  }

  clone() {
    return new Cell(this.x, this.y, this.color, this.text);
  }
}
