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

solver(mainGrid, pieceList);

let isSolving = false;
els.btns.solve.addEventListener("click", () => {
  isSolving = true;
  mainGrid.locked = true;
  pieceList.locked = true;

  let maxCover = 0;
  const gridCellCount = [...mainGrid.cells.entries()].length;

  const [step, display] = solver(mainGrid, pieceList);
  while (true) {
    const result = step();
    if (result === -1) break;
    const [coverCount, nodes, iterCount] = result;
    if (maxCover >= coverCount) continue;

    maxCover = coverCount;
    display(nodes);
  }
});
