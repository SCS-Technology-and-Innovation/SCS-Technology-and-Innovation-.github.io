const canvas = document.getElementById("tree");
const ctx = canvas.getContext("2d");
const SIZE = 10; // node radius
const XOFFSET = -5;
const YOFFSET = 3;

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
	flag = true;
	return; // max depth
    }
    let k = poisson(l);
    // console.log(l, k);
    let d = n.depth + 1;
    for (let i = 0; i < k; i++) {
	if (quota == 0) {
	    document.getElementById("tnote").innerHTML =
		'Total size limit enforced.';
	    break;
	}
	let newborn = { 'children': [], 'depth': d, 'width': 1, 'height' : 1 };
	quota--; // node created
	n.children.push(newborn);
	if (quota >= 0) { // room to grow
	    branch(newborn, l * c, c, m);
	}
    }
}

let quota = 0;
let flag = false;
let root = null;

function grow() {
    document.getElementById("hnote").innerHTML = '';
    document.getElementById("tnote").innerHTML = '';    
    root = { 'height': 1, 'children': [], 'width': 1, 'depth': 0 };
    let l = parseFloat(document.getElementById("rate").value);
    let c = parseFloat(document.getElementById("cool").value);
    let m = parseInt(document.getElementById("maxdepth").value);
    // we already have a root node            
    quota = parseInt(document.getElementById("maxsize").value) - 1;
    flag = false;
    branch(root, l, c, m);
    show();
}

function show() {
    if (flag) {
	document.getElementById("hnote").innerHTML += 'Height limit enforced.';
    } else {
	document.getElementById("hnote").innerHTML += '';
    }
    leaves = 0;
    internal = 0;
    update(root);
    document.getElementById("height").innerHTML =
	'Height is ' + root.height + '.';
    document.getElementById("width").innerHTML =
	'Total width is ' + root.width + '.';
    document.getElementById("total").innerHTML =
	'' + (leaves + internal) + ' nodes.';    
    document.getElementById("leaves").innerHTML =
	'' + leaves + ' leaves.';
    document.getElementById("internal").innerHTML =
	'' + internal + ' internal (router) nodes.';
    draw(root);
}

let display = "N";

function node(n) {
    let k = n.children.length;
    for (let i = 0; i < k; i++) {
	node(n.children[i]);
    }
    if (k == 0) { // no children
	ctx.fillStyle = "#CD5C5C";
    } else {
	ctx.fillStyle = "#5499c7";    
    }
    ctx.beginPath();
    ctx.arc(n.x, n.y, SIZE, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#ffffff";        
    switch (display) {
    case "W":
	ctx.fillText(n.width, n.x + XOFFSET, n.y + YOFFSET);
	break;
    case "H":
	ctx.fillText(n.height, n.x + XOFFSET, n.y + YOFFSET);
	break;
    case "D":
	ctx.fillText(n.depth, n.x + XOFFSET, n.y + YOFFSET);
	break;
    case "C":
	ctx.fillText(n.children.length, n.x + XOFFSET, n.y + YOFFSET);
	break;		
    default:
	break;
    } 
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

let leaves = 0;
let internal = 0;

function update(n) {
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
	internal++;
    } else {
	leaves++;
    }
}

const GOLDEN = 1.618;

function draw(root) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var tall = root.height;
    var wide = root.width;
    var MARGIN = 2 * SIZE;
    var unit = 3 * SIZE;
    var w = unit * wide + 2 * MARGIN;
    var h = 2 * unit * tall + 4 * MARGIN;
    canvas.width = w;
    canvas.height = h;
    ctx.lineWidth = 3;
    // compute coordinates
    position(root, MARGIN, MARGIN / 2, w - 2 * MARGIN, 2 * unit);
    connect(root); // lines
    display = document.getElementById("label").value;
    node(root); // nodes
}    
