const canvas = document.getElementById("tree");
const ctx = canvas.getContext("2d");
const SIZE = 5; // node radius

// factorial
function fact(n) {
    if (n < 2) {
	return n;
    } else {
	return n * fact(n - 1);
    }
}    

// algorithm from  https://www.johndcook.com/blog/2010/06/14/generating-poisson-random-values/
// tweaked to function with low rates
function poisson(truerate) {
    let factor = 1;
    let rate = truerate;
    do {
	factor *= 2;
	rate = truerate * factor;
    } while (rate < 10);
    let c = 0.767 - 3.36 / rate;
    let beta = Math.PI / Math.sqrt(3.0 * rate);
    let alpha = beta * rate;
    let k = Math.log(c) - rate - Math.log(beta);
    while (true) {
	let u = Math.random();
	let x = (alpha - Math.log((1.0 - u) / u)) / beta;
	let n = Math.floor(x + 0.5);
	if (n < 0) {
	    continue;
	}
	let v = Math.random();
	let y = alpha - beta * x;
	let i = (1.0 + Math.exp(y));
	let l = y + Math.log(v / (i * i));
	let nf = fact(n);
	let r = k + n * Math.log(rate) - Math.log(nf);
	if (l <= r) {
	    return Math.round(n / factor);
	}
    }
}

function branch(n, l, c, m) {
    if (n.depth >= m) {
	return; // max depth
    }
    let k = poisson(l);
    // console.log(l, k);
    let d = n.depth + 1;
    for (let i = 0; i < k; i++) {
	let newborn = { 'children': [], 'depth': d, 'width': 1 };
	quota--; // node created
	if (quota == 0) {
	    document.getElementById("note").innerHTML =
		'Maximum total size reached.';
	}
	n.children.push(newborn);
	if (quota >= 0) { // room to grow
	    branch(newborn, l * c, c, m);
	}
    }
}

let quota = 0;
function grow() {
    document.getElementById("note").innerHTML = '';
    let root = { 'height': 1, 'children': [], 'width': 1, 'depth': 0 };
    let l = parseFloat(document.getElementById("rate").value);
    let c = parseFloat(document.getElementById("cool").value);
    let m = parseInt(document.getElementById("maxdepth").value);
    quota = parseInt(document.getElementById("maxsize").value) - 1; // we already have a root node        
    branch(root, l, c, m);
    update(root);
    draw(root);
}

function node(n) {
    let k = n.children.length;
    for (let i = 0; i < k; i++) {
	node(n.children[i]);
    }
    if (k == 0) { // no children
	ctx.fillStyle = "#27ae60";
    } else {
	ctx.fillStyle = "#5499c7";    
    }
    ctx.beginPath();
    ctx.arc(n.x, n.y, SIZE, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();
    // ctx.fillText(n.width, n.x + SIZE, n.y + SIZE);
}

function position(n, sx, sy, aw, ah) {
    n.x = Math.round(sx + (aw / 2));
    n.y = Math.round(sy + (ah / 2));
    sy += ah;
    let k = n.children.length;
    var dw = aw / n.width;
    for (let i = 0; i < k; i++) {
	let c = n.children[i];
	let cw = dw * c.width;
	position(c, sx, sy, cw, ah);
	sx += cw;
    }
}

ctx.lineWidth = 3;		

function connect(n) {
    let k = n.children.length;
    for (let i = 0; i < k; i++) {
	let c = n.children[i];
	ctx.strokeStyle = 'white';
	ctx.beginPath();
	ctx.moveTo(n.x, n.y);
	ctx.lineTo(c.x, c.y);
	ctx.closePath();
	ctx.stroke();
	connect(c);
    }
}

function update(n) {
    n.height = 0;
    let k = n.children.length;
    if (k > 0) {
	var h = 0;
	var t = 0;
	for (let i = 0; i < k; i++) {
	    let c = n.children[i];
	    update(c);
	    h = Math.max(h, c.height);
	    t += c.width;
	}
	n.width = t;
	n.height = h + 1;
    }
}

const GOLDEN = 1.618;

function draw(root) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var tall = root.height;
    var wide = root.width;
    var MARGIN = 6 * SIZE;
    var unit = 3 * SIZE;
    var w = unit * wide + 2 * MARGIN;
    var h = 2 * unit * tall + 2 * MARGIN;
    canvas.width = w;
    canvas.height = h;
    ctx.lineWidth = 3;
    // compute coordinates
    position(root, MARGIN, MARGIN / 2, w - 2 * MARGIN, 2 * unit);
    connect(root); // lines
    node(root); // nodes
}    
