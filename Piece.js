import Grid from "./Grid.js";
import PieceElement from "./PieceElement.js";

export default class Piece {
  /** @type {import("./PieceList.js").default} */
  parent = null;
  elManager = new PieceElement(this);
  #color = "black";
  grid = new Grid(this.elManager.els.grid, this.#color);
  #count = 1;
  isRotatable = false;
  isFlipable = false;

  /**
   * @param {import("./PieceList.js").default} parent 
   * @param {string} defaultColor 
   */
  constructor(parent, defaultColor = "black") {
    this.parent = parent;
    this.#color = defaultColor;
    this.grid.defaultColor = defaultColor;
  }

  get color() {
    return this.#color;
  }

  set color(value) {
    this.#color = value;
    this.grid.defaultColor = value;
  }

  get count() {
    return this.#count;
  }

  set count(value) {
    this.#count = value;
    if (isNaN(this.#count)) this.#count = 1;
    if (this.#count < 0) this.#count = 0;
    if (this.#count > 10000) this.#count = 10000;
    this.elManager.update();
  }
}
