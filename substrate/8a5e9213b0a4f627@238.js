// https://observablehq.com/@mbostock/substrate@238
function _1(md){return(
md`# Substrate

A port of Jared Tarbell’s [*Substrate* (2003)](http://www.complexification.net/gallery/machines/substrate/).`
)}

function _restart(html){return(
html`<button>Restart`
)}

function _context(restart,DOM,dimx,dimy)
{
  restart;
  const context = DOM.context2d(dimx, dimy);
  context.canvas.style.maxWidth = "100%";
  context.canvas.value = context;
  return context.canvas;
}


function _dimx(){return(
954
)}

function _dimy(dimx){return(
dimx
)}

function _maxnum(){return(
200
)}

function _grains(){return(
64
)}

function _color(d3){return(
() => d3.rgb(d3.interpolateWarm(Math.random()))
)}

function _cracks(context)
{
  context;
  return [];
}


function _cgrid(context,dimx,dimy)
{
  context;
  const cgrid = new Array(dimx * dimy);
  for (let y = 0; y < dimy; ++y) {
    for (let x = 0; x < dimx; ++x) {
      cgrid[y * dimx + x] = 10001;
    }
  }
  return cgrid;
}


function _setup(dimx,dimy,cgrid,cracks,Crack)
{
  for (let k = 0; k < 16; ++k) {
    let i = Math.floor(Math.random() * (dimx * dimy - 1));
    cgrid[i] = Math.floor(Math.random() * 360);
  }
  cracks.length = 0;
  for (let k = 0; k < 3; ++k) {
    Crack.makeCrack();
  }
}


function* _draw(cracks)
{
  for (let i = 1600; i >= 0; --i) {
    for (const crack of cracks) {
      crack.move();
    }
    yield i;
  }
}


function _Crack(SandPainter,cracks,maxnum,dimx,dimy,cgrid,context){return(
class Crack {
  constructor() {
    this.findStart();
    this.sp = new SandPainter();
  }
  static makeCrack() {
    if (cracks.length < maxnum) {
      cracks.push(new Crack());
    }
  }
  findStart() {
    let px = 0, py = 0;
    let found = false;
    let timeout = 0;
    while (!found || (timeout++ > 1000)) {
      px = Math.floor(Math.random() * dimx);
      py = Math.floor(Math.random() * dimy);
      if (cgrid[py * dimx + px] < 10000) {
        found = true;
      }
    }
    if (found) {
      let a = cgrid[py * dimx + px];
      if (Math.random() < 0.5) {
        a -= 90 + Math.floor(Math.random() * 4.1 - 2);
      } else {
        a += 90 + Math.floor(Math.random() * 4.1 - 2);
      }
      this.startCrack(px, py, a);
    }
  }
  startCrack(X, Y, T) {
    this.x = X;
    this.y = Y;
    this.t = T;
    this.x += 0.61 * Math.cos(this.t * Math.PI / 180);
    this.y += 0.61 * Math.sin(this.t * Math.PI / 180);
  }
  move() {
    this.x += 0.42 * Math.cos(this.t * Math.PI / 180);
    this.y += 0.42 * Math.sin(this.t * Math.PI / 180);
    let z = 0.33;
    let cx = Math.floor(this.x + Math.random() * 2 * z - z);
    let cy = Math.floor(this.y + Math.random() * 2 * z - z);
    this.regionColor();
    context.globalAlpha = 0.85;
    context.fillStyle = "#000";
    context.fillRect(
      this.x + Math.random() * 2 * z - z,
      this.y + Math.random() * 2 * z - z,
      1, 1
    );
    if ((cx >= 0) && (cx < dimx) && (cy >= 0) && (cy < dimy)) {
      if ((cgrid[cy * dimx + cx] > 10000) || (Math.abs(cgrid[cy * dimx + cx] - this.t) < 5)) {
        cgrid[cy * dimx + cx] = Math.floor(this.t);
      } else if (Math.abs(cgrid[cy * dimx + cx] - this.t) > 2) {
        this.findStart();
        Crack.makeCrack();
      }
    } else {
      this.findStart();
      Crack.makeCrack();
    }
  }
  regionColor() {
    let rx = this.x;
    let ry = this.y;
    let openspace = true;
    while (openspace) {
      rx += 0.81 * Math.sin(this.t * Math.PI / 180);
      ry -= 0.81 * Math.cos(this.t * Math.PI / 180);
      let cx = Math.floor(rx);
      let cy = Math.floor(ry);
      if ((cx >= 0) && (cx < dimx) && (cy >= 0) && (cy < dimy)) {
        if (cgrid[cy * dimx + cx] <= 10000) {
          openspace = false;
        }
      } else {
        openspace = false;
      }
    }
    this.sp.render(rx, ry, this.x, this.y);
  }
}
)}

function _SandPainter(color,grains,context){return(
class SandPainter {
  constructor() {
    this.c = color();
    this.g = Math.random() * (0.1 - 0.01) + 0.01;
  }
  render(x, y, ox, oy) {
    this.g = Math.max(0, Math.min(1, this.g + Math.random() * 0.1 - 0.05));
    let w = this.g / (grains - 1);
    for (let i = 0; i < grains; ++i) {
      context.globalAlpha = 0.1 - i / (grains * 10);
      context.fillStyle = this.c;
      context.fillRect(
        ox + (x - ox) * Math.sin(Math.sin(i * w)), 
        oy + (y - oy) * Math.sin(Math.sin(i * w)),
        1, 1
      );
    }
  }
}
)}

function _d3(require){return(
require("d3-color@1", "d3-scale-chromatic@1")
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], _1);
  main.variable(observer("viewof restart")).define("viewof restart", ["html"], _restart);
  main.variable(observer("restart")).define("restart", ["Generators", "viewof restart"], (G, _) => G.input(_));
  main.variable(observer("viewof context")).define("viewof context", ["restart","DOM","dimx","dimy"], _context);
  main.variable(observer("context")).define("context", ["Generators", "viewof context"], (G, _) => G.input(_));
  main.variable(observer("dimx")).define("dimx", _dimx);
  main.variable(observer("dimy")).define("dimy", ["dimx"], _dimy);
  main.variable(observer("maxnum")).define("maxnum", _maxnum);
  main.variable(observer("grains")).define("grains", _grains);
  main.variable(observer("color")).define("color", ["d3"], _color);
  main.variable(observer("cracks")).define("cracks", ["context"], _cracks);
  main.variable(observer("cgrid")).define("cgrid", ["context","dimx","dimy"], _cgrid);
  main.variable(observer("setup")).define("setup", ["dimx","dimy","cgrid","cracks","Crack"], _setup);
  main.variable(observer("draw")).define("draw", ["cracks"], _draw);
  main.variable(observer("Crack")).define("Crack", ["SandPainter","cracks","maxnum","dimx","dimy","cgrid","context"], _Crack);
  main.variable(observer("SandPainter")).define("SandPainter", ["color","grains","context"], _SandPainter);
  main.variable(observer("d3")).define("d3", ["require"], _d3);
  return main;
}
