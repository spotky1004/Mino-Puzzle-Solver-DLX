/**
 * @typedef PieceElmentSubEls 
 * @prop {HTMLDivElement} container 
 * @prop {HTMLDivElement} grid 
 * @prop {HTMLSpanElement} countInput 
 * @prop {HTMLDivElement} countUp 
 * @prop {HTMLDivElement} countDown 
 * @prop {HTMLSpanElement} rotatableToggle 
 * @prop {HTMLSpanElement} flipableToggle 
 * @prop {HTMLSpanElement} delete 
 */

export default class PieceElement {
  /** @type {import("./Piece.js").default} */
  parent = null;
  /** @type {PieceElmentSubEls} */
  els = {};

  /**
   * @param {import("./Piece.js").default} parent 
   */
  constructor(parent) {
    this.parent = parent;

    // initialize
    /** @type {HTMLTemplateElement} */
    const templateEl = document.getElementById("template__piece-list__item");
    /** @type {HTMLDivElement} */
    const container = templateEl.content.firstElementChild.cloneNode(true);
    this.els = {
      container,
      grid: container.getElementsByClassName("piece-list__item__grid")[0],
      countInput: container.getElementsByClassName("piece-list__count__input")[0],
      countUp: container.getElementsByClassName("piece-list__count__up")[0],
      countDown: container.getElementsByClassName("piece-list__count__down")[0],
      rotatableToggle: container.getElementsByClassName("piece-rotatable")[0],
      flipableToggle: container.getElementsByClassName("piece-flipable")[0],
      delete: container.getElementsByClassName("piece-delete")[0],
    };

    this.els.countUp.addEventListener("click", () => {
      this.parent.count++;
    });
    this.els.countDown.addEventListener("click", () => {
      this.parent.count--;
    });
    this.els.rotatableToggle.addEventListener("click", () => {
      this.parent.isRotatable = !this.parent.isRotatable;
      this.update();
    });
    this.els.flipableToggle.addEventListener("click", () => {
      this.parent.isFlipable = !this.parent.isFlipable;
      this.update();
    });
    this.els.delete.addEventListener("click", () => {
      this.parent.parent.remove(this.parent);
    });
  }

  update() {
    this.els.countInput.innerText = this.parent.count;
    
    if (this.parent.isRotatable) {
      this.els.rotatableToggle.classList.add("active");
    } else {
      this.els.rotatableToggle.classList.remove("active");
    }

    if (this.parent.isFlipable) {
      this.els.flipableToggle.classList.add("active");
    } else {
      this.els.flipableToggle.classList.remove("active");
    }
  }
}
