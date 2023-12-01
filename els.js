const els = {
  /** @type {HTMLSpanElement} */
  mainGrid: document.getElementById("main-grid"),
  /** @type {HTMLSpanElement} */
  pieceList: document.getElementById("piece-list"),
  /** @type {HTMLDivElement} */
  addPiece: document.getElementById("piece-list__add"),
  status: {
    /** @type {HTMLDivElement} */
    container: document.getElementById("solve-status"),
    /** @type {HTMLSpanElement} */
    iteration: document.getElementById("solve-status__iteration-value"),
    /** @type {HTMLSpanElement} */
    maximumCover: document.getElementById("solve-status__maximum-cover-value"),
    /** @type {HTMLSpanElement} */
    elapsedTime: document.getElementById("solve-status__elapsed-time-value"),
  },
  btns: {
    /** @type {HTMLDivElement} */
    solve: document.getElementById("solve-btn"),
    /** @type {HTMLDivElement} */
    resume: document.getElementById("resume-btn"),
    /** @type {HTMLDivElement} */
    reset: document.getElementById("reset-btn"),
  },
};

export default els;
