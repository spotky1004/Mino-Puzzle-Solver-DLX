/**
 * @param {import("./Grid.js").default} grid 
 * @param {import("./PieceList.js").default} pieces 
 */
export default function solver(grid, pieces) {
  /** @type {[import("./Piece.js").default, number[][]][]} */
  const pieceDatas = [];
  for (const piece of pieces) {
    pieceDatas.push([piece, piece.grid.toMatrix()]);
  }
  const { sets, setsData, boardPoses, posComp } = initSets(grid.toMatrix(), pieceDatas);
  const pieceCountSum = pieces.pieces.reduce((a, b) => a + b.count, 0);

  const dlxStep = dlx(sets, pieceCountSum);
  function step() {
    return dlxStep.next().value;
  }

  function display(nodes) {
    const setIdxes = nodes.map(v => v.setIdx);
    const [minX, minY] = grid.getMinXY();

    for (const cell of grid.cells) {
      grid.addCell(cell.x, cell.y, grid.defaultColor);
    }

    for (const idx of setIdxes) {
      const points = sets[idx]
        .slice(pieceCountSum)
        .map((v, i) => [v, i])
        .filter(v => v[0] === 1)
        .map(v => boardPoses[v[1]]);
      const [piece, pieceIdx] = setsData[idx];
      for (const [x, y] of points) {
        grid.addCell(x + minX, y + minY, piece.color, pieceIdx);
      }
    }
  }

  return [step, display];
}



/**
 * @param {number[][]} board 
 * @param {[import("./Piece.js").default, number[][]][]} pieceDatas 
 */
function initSets(board, pieceDatas) {
  /**
   * @param {number} x 
   * @param {number} y 
   */
  function checkOOB(x, y) {
    if (
      0 > x || x >= boardW ||
      0 > y || y >= boardH
    ) return true;
    return false;
  }

  function getMatSize(shape) {
    return [shape[0].length, shape.length];
  }
  function rotatePiece(piece) {
    const [w, h] = getMatSize(piece);
    const rotated = Array.from({ length: w }, _ => Array(h).fill(0));
    for (let i = 0; i < w; i++) {
      for (let j = 0; j < h; j++) {
        rotated[i][j] = piece[h - j - 1][i];
      }
    }
    return rotated;
  }
  function flipPiece(piece) {
    const [w, h] = getMatSize(piece);
    const fliped = Array.from({ length: h }, _ => Array(w).fill(0));
    for (let i = 0; i < h; i++) {
      for (let j = 0; j < w; j++) {
        fliped[i][w - j - 1] = piece[i][j];
      }
    }
    return fliped;
  }
  function isSamePiece(a, b) {
    const [w, h] = getMatSize(a);
    const [w1, h1] = getMatSize(b);
    if (w !== w1 || h !== h1) return false;
    for (let i = 0; i < h; i++) {
      for (let j = 0; j < w; j++) {
        if (a[i][j] !== b[i][j]) return false;
      }
    }
    return true;
  }
  function canFitPiece(piece, x, y) {
    const [w, h] = getMatSize(piece);
    const poses = [];
    for (let i = 0; i < h; i++) {
      for (let j = 0; j < w; j++) {
        if (piece[i][j] === 0) continue;
  
        const [px, py] = [x + j, y + i];
        if (checkOOB(px, py) || board[py][px] !== 1) return false;
        poses.push([px, py]);
      }
    }
    return poses;
  }

  const [boardW, boardH] = getMatSize(board);

  const boardPoses = [];
  for (let y = 0; y < boardH; y++) {
    for (let x = 0; x < boardW; x++) {
      if (board[y][x] === 0) continue;
      boardPoses.push([x, y]);
    }
  }
  const posComp = new Map();
  for (let i = 0; i < boardPoses.length; i++) {
    const [x, y] = boardPoses[i];
    const key = y * boardW + x;
    posComp.set(key, i);
  }

  const sets = [];
  /** @type {[piece: import("./Piece.js").default, idx: number][]} */
  const setsData = [];
  const pieceCountSum = pieceDatas.reduce((a, b) => a + b[0].count, 0);
  const setSize = pieceCountSum + boardPoses.length;
  let pieceCountAcc = 0;
  for (const [piece, pieceMat] of pieceDatas) {
    const variants = [pieceMat];
    let cur = pieceMat;
    if (piece.isRotatable) {
      for (let i = 0; i < 3; i++) {
        cur = rotatePiece(cur);
        if (!variants.some(s => isSamePiece(s, cur))) {
          variants.push(cur);
        }
      }
    }
    if (piece.isFlipable) {
      const origLen = variants.length;
      for (let i = 0; i < origLen; i++) {
        cur = flipPiece(variants[i]);
        if (!variants.some(s => isSamePiece(s, cur))) {
          variants.push(cur);
        }
      }
    }

    for (const variant of variants) {
      const [w, h] = getMatSize(variant);
      const seenSets = new Set();

      for (const [x, y] of boardPoses) {
        for (let xOff = 0; xOff < w; xOff++) {
          for (let yOff = 0; yOff < h; yOff++) {
            if (
              variant[yOff][xOff] === 0 ||
              x - xOff < 0 ||
              y - yOff < 0
            ) continue;
            const set = Array(setSize).fill(0);

            const result = canFitPiece(variant, x - xOff, y - yOff);
            if (!result) break;
            for (const [px, py] of result) {
              set[pieceCountSum + posComp.get(py * boardW + px)] = 1;
            }
            
            const setBin = set.reduce((a, b, i) => a + BigInt(b) * 2n**BigInt(i), 0n);
            if (seenSets.has(setBin)) continue;
            for (let i = 0; i < piece.count; i++) {
              set[pieceCountAcc + i] = 1;
              sets.push([...set]);
              setsData.push([piece, ["▲", "◆", "⬟", "⬢", "●", "△", "□", "⬠", "⬡", "◭", "🌲"][i]]);
              set[pieceCountAcc + i] = 0;
            }
            seenSets.add(setBin);
          }
        }
      }
    }

    pieceCountAcc += piece.count;
  }

  return { sets, setsData, boardPoses, posComp };
}

function* dlx(sets, pieceCountSum) {
  class Node {
    /** @type {number} */
    setIdx = -1;
  
    /** @type {number} */
    size = 0;
    /** @type {Node} */
    top;
    
    /** @type {Node} */
    l;
    /** @type {Node} */
    r;
    /** @type {Node} */
    u;
    /** @type {Node} */
    d;

    constructor() {}
  }

  const setLen = sets[0].length;
  const setCount = sets.length;
  /** @type {(Node | null)[][]} */
  const setsTable = Array.from({ length: setCount + 1 }, _ => Array(setLen + 1).fill(null));
  for (let i = 0; i <= setLen; i++) {
    const node = new Node();
    node.setIdx = i;
    node.size = 0;
    node.top = node;

    setsTable[0][i] = node;
  }
  for (let i = 0; i < setCount; i++) {
    const set = sets[i];
    for (let j = 0; j < setLen; j++) {
      if (set[j] === 0) continue;
      const node = new Node();
      node.setIdx = i;
      node.top = setsTable[0][j + 1];
      node.top.size++;

      setsTable[i + 1][j + 1] = node;
    }
  }

  for (let i = 0; i <= setLen; i++) {
    /** @type {Node | null} */
    let firstNode = null;
    /** @type {Node | null} */
    let prevNode = null;
    for (let j = 0; j <= setCount; j++) {
      const curNode = setsTable[j][i];
      if (curNode === null) continue;
      if (prevNode !== null) {
        prevNode.d = curNode;
        curNode.u = prevNode;
      }
      prevNode = curNode;
      if (firstNode === null) firstNode = curNode;
    }
    if (firstNode !== null && prevNode !== null) {
      firstNode.u = prevNode;
      prevNode.d = firstNode;
    }
  }
  for (let i = 0; i <= setCount; i++) {
    /** @type {Node | null} */
    let firstNode = null;
    /** @type {Node | null} */
    let prevNode = null;
    for (let j = 0; j <= setLen; j++) {
      const curNode = setsTable[i][j];
      if (curNode === null) continue;
      if (prevNode !== null) {
        prevNode.r = curNode;
        curNode.l = prevNode;
      }
      prevNode = curNode;
      if (firstNode === null) firstNode = curNode;
    }
    if (firstNode !== null && prevNode !== null) {
      firstNode.l = prevNode;
      prevNode.r = firstNode;
    }
  }

  /** @type {Node} */
  const root = setsTable[0][0];
  function findMinHead() {
    /** @type {Node | -1} */
    let minHead = -1;
    let minHeadSize = Infinity;

    for (let head = root.r; head !== root; head = head.r) {
      if (head.size === 0) {
        if (head.setIdx > pieceCountSum) return -1;
        continue;
      }
      if (head.size >= minHeadSize) continue;
      minHead = head;
      minHeadSize = head.size;
    }

    return minHead;
  }

  /**
   * @param {Node} head 
   */
  function cover(head) {
    if (head.setIdx > pieceCountSum) coveredCount++;
    head.l.r = head.r;
    head.r.l = head.l;

    for (let a = head.d; a !== head; a = a.d) {
      for (let b = a.r; b !== a; b = b.r) {
        b.top.size--;
        b.u.d = b.d;
        b.d.u = b.u;
      }
    }
  }

  /**
   * @param {Node} head 
   */
  function uncover(head) {
    if (head.setIdx > pieceCountSum) coveredCount--;
    head.l.r = head;
    head.r.l = head;

    for (let a = head.d; a !== head; a = a.d) {
      for (let b = a.r; b !== a; b = b.r) {
        b.top.size++;
        b.u.d = b;
        b.d.u = b;
      }
    }
  }

  let depth = -1;
  const minHeads = [];
  /** @type {Node[]} */
  const selectedNodes = [];
  const covered = [];
  let boardCellCount = setLen - pieceCountSum;
  let maxCoverCount = 0;
  let coveredCount = 0;
  let iterCount = 0;
  loop: while (true) {
    iterCount++;
    depth++;

    const minHead = findMinHead();
    if (minHead === -1) {
      depth--;
      if (depth === -1) {
        yield -1;
        break loop;
      }
      while (true) {
        if (depth === -1) {
          yield -1;
          break loop;
        }
        while (true) {
          const toUncover = covered.pop();
          if (toUncover === -1) break;
          uncover(toUncover);
        }

        selectedNodes[depth] = selectedNodes[depth].d;
        const moved = selectedNodes[depth];
        if (moved === moved.top) {
          depth--;
          minHeads.pop();
          selectedNodes.pop();
          continue;
        }

        const minHead = minHeads[depth];
        covered.push(-1);
        covered.push(minHead);
        cover(minHead);
        for (let node = moved.r; node !== moved; node = node.r) {
          covered.push(node.top);
          cover(node.top);
        }
        break;
      }
      continue;
    }

    minHeads.push(minHead);
    const selected = minHead.d;
    selectedNodes.push(selected);
    covered.push(-1);
    covered.push(minHead);
    cover(minHead);
    for (let node = selected.r; node !== selected; node = node.r) {
      covered.push(node.top);
      cover(node.top);
    }

    if (
      setCount % 100000 === 0 ||
      maxCoverCount < coveredCount ||
      coveredCount === boardCellCount
    ) {
      yield [coveredCount, selectedNodes, iterCount];
    }
  }

  yield -1;
  return -1;
}
