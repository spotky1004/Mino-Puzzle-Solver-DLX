export default class GridCanvas {
  static dotStyle = [15, 5];
  
  #x = 0; // center x
  #y = 0; // center y
  #zoom = 5; // minimum cells to display in a row/column
  /** @type {import("./Grid").default} */
  parent = null;
  el = document.createElement("canvas");
  /** @type {CanvasRenderingContext2D} */
  ctx = this.el.getContext("2d");
  /** @type {0 | 1 | 2 | 3} 0: none, 1: left, 2: wheel, 3: right */
  mouseDownBtn = 0;
  prevMouseX = 0;
  prevMouseY = 0;

  /**
   * @param {import("./Grid").default} parent 
   */
  constructor(parent) {
    this.parent = parent;

    // init canvas element
    this.el.classList.add = "grid-canvas";
    this.el.width = this.parent.screen.clientWidth;
    this.el.height = this.parent.screen.clientHeight;
    this.el.style.display = "flex";
    this.el.addEventListener("mousedown", (e) => {
      e.preventDefault();
      if (e.button === 1 || e.which === 2) this.#evClickW(e); // allow move even locked!
      if (this.parent.locked) return;

      if (e.button === 0 || e.which === 1) this.#evClickL(e);
      if (e.button === 2 || e.which === 3) this.#evClickR(e);
    });
    this.el.addEventListener("mouseup", (e) => {
      e.preventDefault();
      if (e.button === 1 || e.which === 2) this.#evReleaseW(e);
      if (this.parent.locked) return;
      
      if (e.button === 0 || e.which === 1) this.#evReleaseL(e);
      if (e.button === 2 || e.which === 3) this.#evReleaseR(e);
    });
    this.el.addEventListener("contextmenu", (e) => {
      e.preventDefault();
    });
    this.el.addEventListener("mousemove", (e) => {
      this.#evMouseMove(e);
    });
    this.el.addEventListener("mouseleave", (e) => {
      this.#evMouseOut(e);
    });
    this.el.addEventListener("blur", (e) => {
      this.#evBlur(e);
    });
    this.parent.screen.appendChild(this.el);
    new ResizeObserver(() => {
      this.el.width = this.parent.screen.clientWidth;
      this.el.height = this.parent.screen.clientHeight;
      this.render();
    }).observe(this.parent.screen);
  }

  get x() {
    return this.#x;
  }

  set x(value) {
    this.#x = value;
    this.render();
  }

  get y() {
    return this.#y;
  }

  set y(value) {
    this.#y = value;
    this.render();
  }

  get zoom() {
    return this.#zoom;
  }

  set zoom(value) {
    this.#zoom = value;
    this.render();
  }

  getElMetric() {
    const domRect = this.el.getBoundingClientRect();
    return {
      width: domRect.width,
      height: domRect.height,
      pixelRatio: this.#zoom / Math.min(domRect.width, domRect.height),
    };
  }

  getScreenRange() {
    const { width, height, pixelRatio } = this.getElMetric();
    const xLen = width * pixelRatio;
    const yLen = height * pixelRatio;
    return {
      x0: this.#x - xLen / 2,
      x1: this.#x + xLen / 2,
      y0: this.#y - yLen / 2,
      y1: this.#y + yLen / 2
    };
  }

  /**
   * @param {number} x 
   * @param {number} y 
   */
  canvasPos2GridPos(x, y) {
    const { width, height, pixelRatio } = this.getElMetric();
    return {
      x: this.#x + (x - width / 2) * pixelRatio,
      y: this.#y + (y - height / 2) * pixelRatio,
    };
  }

  /**
   * @param {number} x 
   * @param {number} y 
   */
  gridPos2CanvasPos(x, y) {
    const { width, height, pixelRatio } = this.getElMetric();
    return {
      x: (x - this.#x) / pixelRatio + width / 2,
      y: (y - this.#y) / pixelRatio + height / 2,
    };
  }

  /**
   * @param {number} x 
   * @param {number} y 
   */
  gridPos2CellPos(x, y) {
    return {
      x: Math.round(x),
      y: Math.round(y)
    };
  }

  render() {
    const ctx = this.ctx;
    const { width, height, pixelRatio } = this.getElMetric();
    const { x0, x1, y0, y1 } = this.getScreenRange();

    
    ctx.clearRect(0, 0, width, height);
    
    ctx.strokeStyle = "#000";
    ctx.globalAlpha = 0.15;
    if (this.parent.locked) {
      ctx.setLineDash(GridCanvas.dotStyle);
    } else {
      ctx.setLineDash([]);
    }
    ctx.lineWidth = Math.max(2, Math.min(width, height) / this.#zoom / 15);
    ctx.beginPath();
    let canvasX = this.gridPos2CanvasPos(Math.floor(x0) - 0.5, 0).x;
    for (let x = Math.floor(x0) - 1; x < x1; x++) {
      ctx.moveTo(canvasX, 0);
      ctx.lineTo(canvasX, height);
      canvasX += 1 / pixelRatio;
    }
    let canvasY = this.gridPos2CanvasPos(0, Math.floor(y0) - 0.5).y;
    for (let y = Math.floor(y0) - 1; y < y1; y++) {
      ctx.moveTo(0, canvasY);
      ctx.lineTo(width, canvasY);
      canvasY += 1 / pixelRatio;
    }
    ctx.stroke();
    ctx.globalAlpha = 1;

    const cellScreenRange = {
      x0: Math.floor(x0),
      x1: Math.ceil(x1),
      y0: Math.floor(y0),
      y1: Math.ceil(y1)
    };
    
    ctx.globalAlpha = 0.3;
    ctx.strokeStyle = "#000";
    ctx.lineWidth = Math.max(2, Math.min(width, height) / this.#zoom / 3);
    ctx.beginPath();
    for (const cell of this.parent.cells) {
      if (
        cellScreenRange.x0 > cell.x ||
        cellScreenRange.x1 < cell.x ||
        cellScreenRange.y0 > cell.y ||
        cellScreenRange.y1 < cell.y
      ) continue;
      
      const { x, y } = cell;
      const { x: l, y: u } = this.gridPos2CanvasPos(x - 0.5, y - 0.5);
      const { x: r, y: d } = this.gridPos2CanvasPos(x + 0.5, y + 0.5);
      
      ctx.rect(l, u, r - l, d - u);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;

    const fontSize = 0.2 / pixelRatio;
    ctx.font = `bold ${Math.ceil(fontSize)}px "Roboto Mono"`;
    for (const cell of this.parent.cells) {
      if (
        cellScreenRange.x0 > cell.x ||
        cellScreenRange.x1 < cell.x ||
        cellScreenRange.y0 > cell.y ||
        cellScreenRange.y1 < cell.y
      ) continue;
      
      const { x, y, color } = cell;
      const { x: l, y: u } = this.gridPos2CanvasPos(x - 0.5, y - 0.5);
      const { x: r, y: d } = this.gridPos2CanvasPos(x + 0.5, y + 0.5);

      ctx.fillStyle = color;
      ctx.fillRect(l - 1, u - 1, r - l + 1, d - u + 1);
      if (cell.text !== "") {
        ctx.fillStyle = "#2228";
        ctx.fillText(cell.text, l + fontSize / 2, d - fontSize / 2);
      }
    }

    ctx.globalAlpha = 0.03;
    ctx.strokeStyle = "#000";
    ctx.lineWidth = Math.max(2, Math.min(width, height) / this.#zoom / 15);
    ctx.beginPath();
    for (const cell of this.parent.cells) {
      if (
        cellScreenRange.x0 > cell.x ||
        cellScreenRange.x1 < cell.x ||
        cellScreenRange.y0 > cell.y ||
        cellScreenRange.y1 < cell.y
      ) continue;
      
      const { x, y } = cell;
      const { x: l, y: u } = this.gridPos2CanvasPos(x - 0.5, y - 0.5);
      const { x: r, y: d } = this.gridPos2CanvasPos(x + 0.5, y + 0.5);
      
      ctx.rect(l, u, r - l, d - u);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  /** @param {MouseEvent} e  */
  #evClickL(e) {
    this.mouseDownBtn = 1;
    
    const { x: gx, y: gy } = this.canvasPos2GridPos(e.offsetX, e.offsetY);
    const { x: cx, y: cy } = this.gridPos2CellPos(gx, gy);
    this.parent.addCell(cx, cy);
  }

  /** @param {MouseEvent} e  */
  #evClickW(e) {
    this.mouseDownBtn = 2;
  }

  /** @param {MouseEvent} e  */
  #evClickR(e) {
    this.mouseDownBtn = 3;

    const { x: gx, y: gy } = this.canvasPos2GridPos(e.offsetX, e.offsetY);
    const { x: cx, y: cy } = this.gridPos2CellPos(gx, gy);
    this.parent.removeCell(cx, cy);
  }

  /** @param {MouseEvent} e  */
  #evReleaseL(e) {
    if (this.mouseDownBtn === 1) {
      this.mouseDownBtn = 0;
    }
  }

  /** @param {MouseEvent} e  */
  #evReleaseW(e) {
    if (this.mouseDownBtn === 2) {
      this.mouseDownBtn = 0;
    }
  }

  /** @param {MouseEvent} e  */
  #evReleaseR(e) {
    if (this.mouseDownBtn === 3) {
      this.mouseDownBtn = 0;
    }
  }

  /** @param {MouseEvent} e  */
  #evMouseMove(e) {
    const { pixelRatio } = this.getElMetric();
    const { x: gx, y: gy } = this.canvasPos2GridPos(e.offsetX, e.offsetY);
    const { x: cx, y: cy } = this.gridPos2CellPos(gx, gy);

    const dx = e.offsetX - this.prevMouseX;
    const dy = e.offsetY - this.prevMouseY;

    if (this.mouseDownBtn === 1) {
      this.parent.addCell(cx, cy);
    } else if (this.mouseDownBtn === 2) {
      this.#x -= pixelRatio * dx;
      this.#y -= pixelRatio * dy;
      this.render();
    } else if (this.mouseDownBtn === 3) {
      this.parent.removeCell(cx, cy);
    }

    this.prevMouseX = e.offsetX;
    this.prevMouseY = e.offsetY;
  }

  /** @param {MouseEvent} e  */
  #evMouseOut(e) {
    this.mouseDownBtn = 0;
  }

  /** @param {FocusEvent} e  */
  #evBlur(e) {
    this.clickDownBtn = 0;
  }
}
