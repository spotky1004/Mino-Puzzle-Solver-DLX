import Piece from "./Piece.js";

export default class PieceList {
  /** @type {HTMLSpanElement} */
  el = document.createElement("span");
  /** @type {Piece[]} */
  pieces = [];
  #locked = false;

  /**
   * @param {HTMLSpanElement} listEl 
   */
  constructor(listEl) {
    this.el = listEl;
    this.add();
  }

  *[Symbol.iterator]() {
    for (const piece of this.pieces) {
      yield piece;
    }
  }

  get locked() {
    return this.#locked;
  }

  set locked(value) {
    this.#locked = value;
    for (const piece of this.pieces) {
      piece.grid.locked = value;
    }
  }

  add() {
    const color = `rgb(${Math.floor(Math.random() * 55) + 200}, ${Math.floor(Math.random() * 55) + 200}, ${Math.floor(Math.random() * 55) + 200})`;
    const piece = new Piece(this, color);
    this.pieces.push(piece);
    this.el.appendChild(piece.elManager.els.container);
  }

  /**
   * @param {Piece} piece 
   */
  remove(piece) {
    const idx = this.pieces.findIndex(p => p === piece);
    this.pieces.splice(idx, 1);

    this.el.removeChild(piece.elManager.els.container);
  }

  entries() {
    return this.pieces.entries();
  }
}
