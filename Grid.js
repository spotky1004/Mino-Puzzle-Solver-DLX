import GridCanvas from "./GridCanvas.js";
import GridCells from "./GridCells.js";
import Cell from "./Cell.js";

export default class Grid {
  screen = document.createElement("span");
  canvas = new GridCanvas(this);
  /** @type {GridCells} */
  cells = new GridCells();
  defaultColor = "black";
  #locked = false;
  
  /**
   * @param {HTMLSpanElement} screenEl 
   * @param {string} defaultColor 
   */
  constructor(screenEl, defaultColor = "black") {
    this.screen = screenEl;
    this.canvas = new GridCanvas(this);
    this.defaultColor = defaultColor;

    this.screen.addEventListener("resize", () => {
      this.render();
    });
  }

  get locked() {
    return this.#locked;
  }

  set locked(value) {
    const isChanged = this.#locked !== value;
    this.#locked = value;
    if (isChanged) this.render();
  }

  addCell(x = 0, y = 0, color = this.defaultColor, text = "") {
    const updated = this.cells.addCell(new Cell(x, y, color, text));
    if (updated) this.render();
  }

  /**
   * @param {number} x 
   * @param {number} y 
   */
  removeCell(x, y) {
    const updated = this.cells.removeCell(x, y);
    if (updated) this.render();
  }

  getMinXY() {
    const points = [...this.cells.entries()].map(cell => [cell.x, cell.y]);
    const [minX, minY] = points.reduce(([minX, minY], [x, y]) => [Math.min(minX, x), Math.min(minY, y)], [Infinity, Infinity]);
    return [minX, minY];
  }

  toMatrix() {
    const points = [...this.cells.entries()].map(cell => [cell.x, cell.y]);
    const [minX, minY] = points.reduce(([minX, minY], [x, y]) => [Math.min(minX, x), Math.min(minY, y)], [Infinity, Infinity]);
    const [maxX, maxY] = points.reduce(([maxX, maxY], [x, y]) => [Math.max(maxX, x), Math.max(maxY, y)], [-Infinity, -Infinity]);
    /** @type {number[][]} */
    const matrix = Array.from({ length: maxY - minY + 1 }, _ => Array(maxX - minX + 1).fill(0));
    for (const [x, y] of points) {
      matrix[y - minY][x - minX] = 1;
    }
    return matrix;
  }

  render() {
    this.canvas.render();
  }
}
