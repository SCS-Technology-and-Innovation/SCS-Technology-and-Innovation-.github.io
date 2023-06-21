function normal(m, s) {
    let r = Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random());
    return s * r + m;
}

let raw = [];
let data = [];
let low = null;
let high = null;

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
ctx.lineWidth = 1;
let color = 'yellow';
ctx.strokeStyle = color;

let margin = 30;

function scale(v, vmin, vmax, pixels, flip) {
    let vspan = vmax - vmin;
    let pmin = margin;
    let pmax = pixels - margin;
    let pspan = pmax - pmin;    
    let prop = (v - vmin) / vspan;
    if (flip) {
	prop = 1 - prop;
    }
    return Math.round(pmin + prop * pspan);
}

let w = canvas.width;
let h = canvas.height;

function draw() {
    ctx.clearRect(0, 0, w, h);
    let px = null;
    let py = null;
    let n = data.length;
    for (let i = 0; i < n; i++) {    
	let x = scale(i, 0, n, w, false);
	// add trend
	let y = scale(data[i], low, high, h, true);
	if (px != null) {
	    ctx.beginPath();
	    ctx.moveTo(px, py);
	    ctx.lineTo(x, y);
	    ctx.stroke();
	}
	px = x;
	py = y;
    }
}

document.addEventListener('keypress', generate);

function generate() {
    let p = null;
    if (document.getElementById("season").checked) {
	p = parseFloat(document.getElementById("period").value);
    }
    let t = parseFloat(document.getElementById("trend").value); // dy / dx
    let m = parseFloat(document.getElementById("mean").value);
    let s = parseFloat(document.getElementById("sd").value);

    let i = data.length;
    let r = null;
     if (p != null) { // season
	if (i > p) {
	    let old = raw[i - p];
	    r = old; // oversimplification
	}
     }
    r += normal(m, s); // add the noise        
    raw.push(r);
    r += t * i; // add the trend
    if (low == null || r < low) {
	low = r;
    }
    if (high == null || r > high) {
	high = r;
    }
    data.push(r);
    draw();
}
