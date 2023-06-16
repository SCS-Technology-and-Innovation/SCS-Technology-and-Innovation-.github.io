var canvas = document.getElementById('draw');
var ctx = canvas.getContext('2d');
let bb = canvas.getBoundingClientRect();

// size
let sl = null;
let sh = null;

// red channel
let rl = null;
let rh = null;

// green channel
let gl = null;
let gh = null;

// blue channel
let bl = null;
let bh = null;

function randint(low, high) {
    let span = high - low;
    let r = Math.random();
    return Math.round(low + span * r);
}

const SDS = 4; // size standard deviation
const SDC = 20; // color standard deviation

function normal(m, s) {
    let r = Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random());
    return s * r + m;
}

function pad(s, l) {
    if (s.length < l) {
	s = '0' + s;
    }
    return s;
}

const SIZELOW = 5;
const SIZEHIGH = 25;
const COLORLOW = 64;
const COLORHIGH = 180;
const FIRSTSEP = 20;
const SECONDSEP = 10;
const MAXTRIES = 30;

function next() {
    s = randint(SIZELOW, SIZEHIGH);
    r = randint(COLORLOW, COLORHIGH);
    let tries = MAXTRIES;
    do {
	g = randint(COLORLOW, COLORHIGH);
	tries--;
    } while (tries > 0 && Math.abs(r - g) < FIRSTSEP);
    tries = MAXTRIES;
    do {
	b = randint(COLORLOW, COLORHIGH);
	tries--;
    } while (tries > 0 && (Math.abs(r - b) < SECONDSEP || Math.abs(g - b) < SECONDSEP));
    
    document.getElementById("sample").style.color = '#' + pad(r, 2) + pad(g, 2) + pad(b, 2);
}

next(); // initiatilize

function ranged(mean, sd, low, high) {
    let value = normal(mean, sd);
    if (value < low) {
	value = low;
    }
    if (value > high) {
	value = high;
    }
    return Math.round(value);
}

function hex(value) {
    return pad(Math.round(value).toString(16), 2);
}
    
function hexrng(mean) {
    return hex(ranged(mean, SDC, 0, 255));
}

function color() {
    return '#' + hexrng(r) + hexrng(g) + hexrng(b);
}

function radius() {
    return ranged(s, SDS, 0, Infinity);
}

let points = [];

function connect(p) {
    if (p.a != null) {
	ctx.lineWidth = 1;
	ctx.strokeStyle = 'white';
	ctx.beginPath();
	ctx.moveTo(p.x, p.y);
	ctx.lineTo(p.a.x, p.a.y);
	ctx.stroke();
    }
}

function draw(p) {
    ctx.fillStyle = p.c;
    ctx.strokeStyle = p.c;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.s, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

function place(x, y) {
    let c = color();
    let s = radius();
    let point = {};
    point.x = x;
    point.y = y;
    point.s = s;
    point.c = c;
    point.a = null; // no assigned center
    points.push(point);
    let n = points.length;
    draw(points[n - 1]);
}

function click(event) {
    let x = Math.round(event.pageX - bb.left);
    let y = Math.round(event.pageY - bb.top);
    place(x, y);
}

canvas.addEventListener('mouseup', click, false);

function channel(color, num) {
    let start = 1 + num * 2;
    let comp = color.substring(start, start + 2);
    return parseInt(comp, 16);
}

function normalize(value, low, high) {
    return (value - low) / (high - low);
}

let xlow = null;
let xhigh = null;
let ylow = null;
let yhigh = null;
let slow = null;
let shigh = null;
let rlow = null;
let rhigh = null;
let glow = null;
let ghigh = null;
let blow = null;
let bhigh = null;

function reset() {
    xlow = canvas.width;
    xhigh = 0;
    ylow = canvas.height;
    yhigh = 0;
    slow = Infinity;
    shigh = 0;
    rlow = 255;
    rhigh = 0;
    glow = 255;
    ghigh = 0;
    blow = 255;
    bhigh = 0;
}

function spans() {
    reset();
    for (let i = 0; i < points.length; i++) {
	let p = points[i];
	let x = p.x;
	let y = p.y;
	let s = p.s;
	let r = channel(p.c, 0);
	let g = channel(p.c, 1);
	let b = channel(p.c, 2);
	xlow = Math.min(xlow, x);
	xhigh = Math.max(xhigh, x);
	ylow = Math.min(ylow, y);
	yhigh = Math.max(yhigh, y);
	slow = Math.min(slow, s);
	shigh = Math.max(shigh, s);
	rlow = Math.min(rlow, r);
	rhigh = Math.max(rhigh, r);
	glow = Math.min(glow, g);
	ghigh = Math.max(ghigh, g);
	blow = Math.min(blow, b);
	bhigh = Math.max(bhigh, b);
    }
}

function distance(p1, p2) {
    let r1 = channel(p1.c, 0);
    let g1 = channel(p1.c, 1);
    let b1 = channel(p1.c, 2);

    let r2 = channel(p2.c, 0);
    let g2 = channel(p2.c, 1);
    let b2 = channel(p2.c, 2);

    let dx = normalize(p1.x, xlow, xhigh) - normalize(p2.x, xlow, xhigh);
    let dy = normalize(p1.y, ylow, yhigh) - normalize(p2.y, ylow, yhigh);
    let ds = normalize(p1.s, slow, shigh) - normalize(p2.s, slow, shigh);
    let dr = normalize(r1, rlow, rhigh) - normalize(r2, rlow, rhigh);
    let dg = normalize(g1, glow, ghigh) - normalize(g2, glow, ghigh);
    let db = normalize(b1, blow, bhigh) - normalize(b2, blow, bhigh);        

    return dx*dx + dy * dy + ds * ds + dr * dr + dg * dg + db * db;
}

function rng() {
    let p = {};
    p.x = randint(xlow, xhigh);
    p.y = randint(ylow, yhigh);
    p.s = randint(slow, shigh);
    p.c = '#' + hex(randint(rlow, rhigh)) + hex(randint(glow, ghigh)) + hex(randint(blow, bhigh));
    return p;
}

let centers = [];

function rectangle(p) {
    ctx.lineWidth = 3;    
    ctx.fillStyle = p.c;
    ctx.strokeStyle = 'white';
    ctx.beginPath();
    ctx.rect(p.x - p.s, p.y - p.s, p.s * 2, p.s * 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

function repaint() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < points.length; i++) {
	let p = points[i];
	connect(p);
    }
    for (let i = 0; i < centers.length; i++) {
	rectangle(centers[i]);

    }    
    for (let i = 0; i < points.length; i++) {
	let p = points[i];
	draw(p);
    }
}

function assign() {
    let changes = 0;
    for (let i = 0; i < points.length; i++) {
	let p = points[i];
	let chosen = null;
	let lowest = Infinity;
	for (let j = 0; j < centers.length; j++) {
	    let c = centers[j];
	    let d = distance(p, c);
	    if (d < lowest) {
		lowest = d;
		chosen = c;
	    }
	}
	if (p.a != chosen) {
	    changes++;
	}
	p.a = chosen; // assign
    }
    document.getElementById("changes").innerHTML = changes + ' points altered their affiliation'
}

function kmeans() {
    let k = parseInt(document.getElementById("k").value);
    spans();
    if (centers.length != k) { // adjust centers
	while (centers.length < k) {
	    centers.push(rng());
	}
	while (centers.length > k) {
	    centers.pop();
	}
    } else { // update centers
	for (let i = 0; i < k; i++) {
	    let c = centers[i];
	    let count = 0;
	    let xs = 0;
	    let ys = 0;
	    let ss = 0;
	    let rs = 0;
	    let gs = 0;
	    let bs = 0;
	    for (let j = 0; j < points.length; j++) {
		let p = points[j];
		if (p.a == c) { // associated to this center
		    count++;
		    xs += p.x;
		    ys += p.y;
		    ss += p.s;
		    rs += channel(p.c, 0);
		    gs += channel(p.c, 1);
		    bs += channel(p.c, 2);
		}
	    }
	    if (count > 0) {
		c.x = Math.round(xs / count);
		c.y = Math.round(ys / count);
		c.s = Math.round(ss / count);
		c.c = '#' + hex(rs / count) + hex(gs / count) + hex(bs / count);
	    } else {
		console.log('Center', i, 'reset');
		centers[i] = rng(); //reset
	    }
	}
    }
    assign();
    repaint();
}
