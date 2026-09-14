/**
 * NEXORA — Minimal Canvas Sparkline Charts
 * No external dependencies.
 */

class Sparkline {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {object} opts
   */
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.ctx    = canvas.getContext("2d");
    this.opts   = Object.assign({
      color:     "#3b82f6",
      fill:      "rgba(59,130,246,0.12)",
      lineWidth: 1.8,
      dotRadius: 3,
      min:       null,
      max:       null,
      gridLines: 3,
      gridColor: "rgba(255,255,255,0.06)",
    }, opts);
    this.data = [];
  }

  update(data) {
    this.data = data;
    this._draw();
  }

  _draw() {
    const { canvas, ctx, data, opts } = this;
    const W = canvas.offsetWidth  || canvas.width;
    const H = canvas.offsetHeight || canvas.height;
    canvas.width  = W;
    canvas.height = H;

    if (!data || data.length < 2) return;

    const min = opts.min !== null ? opts.min : Math.min(...data);
    const max = opts.max !== null ? opts.max : Math.max(...data);
    const range = max - min || 1;

    const pad = { top: 6, bottom: 6, left: 4, right: 4 };
    const iW = W - pad.left - pad.right;
    const iH = H - pad.top  - pad.bottom;

    const xOf = (i) => pad.left + (i / (data.length - 1)) * iW;
    const yOf = (v) => pad.top  + iH - ((v - min) / range) * iH;

    ctx.clearRect(0, 0, W, H);

    // Grid lines
    ctx.strokeStyle = opts.gridColor;
    ctx.lineWidth   = 1;
    for (let g = 0; g <= opts.gridLines; g++) {
      const y = pad.top + (g / opts.gridLines) * iH;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(W - pad.right, y);
      ctx.stroke();
    }

    // Fill area
    ctx.beginPath();
    ctx.moveTo(xOf(0), yOf(data[0]));
    for (let i = 1; i < data.length; i++) ctx.lineTo(xOf(i), yOf(data[i]));
    ctx.lineTo(xOf(data.length - 1), H - pad.bottom);
    ctx.lineTo(xOf(0), H - pad.bottom);
    ctx.closePath();
    ctx.fillStyle = opts.fill;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.moveTo(xOf(0), yOf(data[0]));
    for (let i = 1; i < data.length; i++) ctx.lineTo(xOf(i), yOf(data[i]));
    ctx.strokeStyle = opts.color;
    ctx.lineWidth   = opts.lineWidth;
    ctx.lineJoin    = "round";
    ctx.stroke();

    // Last dot
    const last = data.length - 1;
    ctx.beginPath();
    ctx.arc(xOf(last), yOf(data[last]), opts.dotRadius, 0, Math.PI * 2);
    ctx.fillStyle = opts.color;
    ctx.fill();
  }
}
