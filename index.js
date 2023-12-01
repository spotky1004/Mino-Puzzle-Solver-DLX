import Grid from "./Grid.js";
import PieceList from "./PieceList.js";
import els from "./els.js";
import solver from "./solver.js";

let isDev = false;

const mainGrid = new Grid(els.mainGrid, "#d6eda8");
mainGrid.canvas.zoom = 10;

const pieceList = new PieceList(els.pieceList);
els.addPiece.addEventListener("click", () => pieceList.add());

if (isDev) {
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 8; j++) {
      if (
        (i === 4 && j === 3) ||
        (i === 5 && j === 3) ||
        (i === 4 && j === 4) ||
        (i === 5 && j === 4)
      ) continue;
      mainGrid.addCell(i, j);
    }
  }

  for (let i = 0; i < 4; i++) {
    pieceList.add();
  }
  for (let i = 0; i < 5; i++) {
    pieceList.pieces[i].count = 4;
    pieceList.pieces[i].isFlipable = true;
    pieceList.pieces[i].isRotatable = true;
  }
  pieceList.pieces[0].grid.addCell(1, 0);
  pieceList.pieces[0].grid.addCell(2, 0);
  pieceList.pieces[0].grid.addCell(0, 1);
  pieceList.pieces[0].grid.addCell(1, 1);
  pieceList.pieces[1].grid.addCell(0, 0);
  pieceList.pieces[1].grid.addCell(1, 0);
  pieceList.pieces[1].grid.addCell(2, 0);
  pieceList.pieces[1].grid.addCell(3, 0);
  pieceList.pieces[2].grid.addCell(1, 0);
  pieceList.pieces[2].grid.addCell(0, 1);
  pieceList.pieces[2].grid.addCell(1, 1);
  pieceList.pieces[2].grid.addCell(2, 1);
  pieceList.pieces[3].grid.addCell(0, 0);
  pieceList.pieces[3].grid.addCell(1, 0);
  pieceList.pieces[3].grid.addCell(0, 1);
  pieceList.pieces[3].grid.addCell(1, 1);
  pieceList.pieces[4].grid.addCell(0, 0);
  pieceList.pieces[4].grid.addCell(0, 1);
  pieceList.pieces[4].grid.addCell(1, 1);
  pieceList.pieces[4].grid.addCell(2, 1);
} else {
  mainGrid.addCell(0, 0);
  mainGrid.addCell(0, 1);
  mainGrid.addCell(1, 0);
  mainGrid.addCell(1, 1);

  pieceList.pieces[0].count = 2;
  pieceList.pieces[0].grid.addCell(0, 0);
  pieceList.pieces[0].grid.addCell(0, 1);
}

let isSolving = false;
let isResume = false;
let isRunning = false;
let maxCover = 0;
let startTime = 0;
let stopTime = 0;
let step = null;
let display = null;

async function solveLoop() {
  isRunning = true;
  const gridCellCount = [...mainGrid.cells.entries()].length;
  startTime += Math.max(0, new Date().getTime() - stopTime - 1);

  while (true) {
    const result = step();
    if (result === -1) {
      isSolving = true;
      isResume = false;
      isRunning = false;
      els.btns.solve.classList.add("disabled");
      els.btns.resume.classList.add("disabled");
      els.btns.reset.classList.remove("disabled");
      return;
    }
    const [coverCount, nodes, iterCount] = result;
    els.status.iteration.innerText = `#${iterCount}`;
    els.status.elapsedTime.innerText = `${new Date().getTime() - startTime}ms`;
    els.status.maximumCover.innerText = `${maxCover} / ${gridCellCount}`;
    stopTime = new Date().getTime();
    await new Promise((res) => setTimeout(() => res()));
    startTime += Math.max(0, new Date().getTime() - stopTime - 1);
    if (!isSolving) {
      isRunning = false;
      return;
    }
    if (maxCover >= coverCount && gridCellCount !== coverCount) continue;

    maxCover = coverCount;
    stopTime = new Date().getTime();
    display(nodes);
    startTime += Math.max(0, new Date().getTime() - stopTime - 1);
    stopTime = new Date().getTime();
    if (isResume || gridCellCount === coverCount) break;
  }

  isResume = true;
  els.btns.solve.classList.add("disabled");
  els.btns.resume.classList.remove("disabled");
  els.btns.reset.classList.remove("disabled");
  stopTime = new Date().getTime();
  isRunning = false;
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
  } else if (!isRunning) {
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
