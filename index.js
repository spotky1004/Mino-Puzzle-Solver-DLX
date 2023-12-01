import Grid from "./Grid.js";
import PieceList from "./PieceList.js";
import els from "./els.js";

import solver from "./solver.js";

const mainGrid = new Grid(els.mainGrid, "#d6eda8");
mainGrid.canvas.zoom = 10;

const pieceList = new PieceList(els.pieceList);
els.addPiece.addEventListener("click", () => pieceList.add());

mainGrid.addCell(0, 0);
mainGrid.addCell(0, 1);
mainGrid.addCell(1, 0);
mainGrid.addCell(1, 1);

pieceList.pieces[0].count = 2;
pieceList.pieces[0].grid.addCell(0, 0);
pieceList.pieces[0].grid.addCell(0, 1);

let isSolving = false;
let isResume = false;
let maxCover = 0;
let startTime = 0;
let stopTime = 0;
let step = null;
let display = null;

function solveLoop() {
  const gridCellCount = [...mainGrid.cells.entries()].length;
  startTime += new Date().getTime() - stopTime;

  while (true) {
    const result = step();
    if (result === -1) {
      isSolving = true;
      isResume = false;
      els.btns.solve.classList.add("disabled");
      els.btns.resume.classList.add("disabled");
      els.btns.reset.classList.remove("disabled");
      return;
    }
    const [coverCount, nodes, iterCount] = result;
    if (!isSolving) return;
    if (maxCover >= coverCount && gridCellCount !== coverCount) continue;

    maxCover = coverCount;
    els.status.iteration.innerText = `#${iterCount}`;
    els.status.elapsedTime.innerText = `${new Date().getTime() - startTime}ms`;
    els.status.maximumCover.innerText = `${maxCover} / ${gridCellCount}`;

    requestAnimationFrame(() => display(nodes));
    if (isResume || gridCellCount === coverCount) break;
  }

  isResume = true;
  els.btns.solve.classList.add("disabled");
  els.btns.resume.classList.remove("disabled");
  els.btns.reset.classList.remove("disabled");
  stopTime = new Date().getTime();
}

els.btns.solve.addEventListener("click", () => {
  if (isSolving) return;
  isSolving = true;
  maxCover = 0;
  mainGrid.locked = true;
  pieceList.locked = true;
  els.status.container.classList.remove("disabled");
  els.btns.solve.classList.add("disabled");
  els.btns.resume.classList.remove("disabled");
  els.btns.reset.classList.remove("disabled");
  
  els.status.iteration.innerText = `#0`;
  els.status.elapsedTime.innerText = `0ms`;
  els.status.maximumCover.innerText = `0 / 0`;
  
  startTime = new Date().getTime();
  stopTime = new Date().getTime();
  [step, display] = solver(mainGrid, pieceList);
  solveLoop();
});

els.btns.resume.addEventListener("click", () => {
  if (!isResume) {
    isResume = true;
  } else {
    isResume = false;
    solveLoop();
  }
});

els.btns.reset.addEventListener("click", () => {
  if (!isSolving) return;
  isSolving = false;
  isResume = false;
  mainGrid.locked = false;
  pieceList.locked = false;

  display([]);

  els.status.container.classList.add("disabled");
  els.btns.solve.classList.remove("disabled");
  els.btns.resume.classList.add("disabled");
  els.btns.reset.classList.add("disabled");
});
