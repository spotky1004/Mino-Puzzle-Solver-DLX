export default class GridCells {
  static coordHashing(x, y) {
    return `${x},${y}`;
  }

  /** @type {Map<string, import("./Cell").default>} */
  #cells = new Map();

  constructor() {}

  *[Symbol.iterator]() {
    for (const cell of this.entries()) {
      yield cell;
    }
  }

  /**
   * @param {import("./Cell").default} cell
   */
  addCell(cell) {
    const hash = GridCells.coordHashing(cell.x, cell.y);
    if (
      this.#cells.has(hash) &&
      cell.isSameCell(this.#cells.get(hash))
    ) return false;
    this.#cells.set(hash, cell.clone());
    return true;
  }

  /**
   * @param {number} x 
   * @param {number} y 
   */
  removeCell(x, y) {
    const hash = GridCells.coordHashing(x, y);
    return this.#cells.delete(hash);
  }

  entries() {
    return this.#cells.values();
  }
}
