let rc = 0;

let sl = 300000;
let sh = 2000000;
let rs = sh - sl;
let nl = 0.9;
let nh = 1.2;
let ns = nh - nl;
let prop = 0.000022;

function addRow() {
    let table = document.getElementById('data');
    let s = table.getElementsByTagName('tbody')[0];
    let r = s.insertRow(rc);
    let c = r.insertCell();
    let i = document.createElement('input');
    i.id = 'x' + rc;
    i.type = 'number';
    i.width = 7;
    let sale = Math.floor(sl + rs * Math.random()); // fill with random data for the lazy
    i.value = sale;
    c.appendChild(i);

    c = r.insertCell();
    i = document.createElement('input');
    i.id = 'y' + rc;
    i.type = 'number';
    i.width = 4;
    let rent = Math.floor(prop * sale * (nl + ns * Math.random())) * 100; // add some noise
    i.value = rent;
    c.appendChild(i);
    rc++;
}

for (let i = 0; i < 3; i++) {
    addRow();
}

var canvas = document.getElementById('plot');
var ctx = canvas.getContext('2d');
let dotcolor = '#00ffff';
let linecolor = '#aaaaaa';
ctx.lineWidth =  5;
let radius = 10;

function scale(v, vmax, vmin, total, mirror) {
    let span = vmax - vmin;
    let prop = (v - vmin) / span;
    if (mirror) {
	prop = 1 - prop;
    }
    return total * prop;
}

function dot(x, y) {
    ctx.fillStyle = dotcolor;
    ctx.strokeStyle = dotcolor;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI); // circle
    ctx.closePath();
    ctx.fill();
    ctx.stroke();    
}

function line(sx, sy, ex, ey) {
    ctx.fillStyle = linecolor;
    ctx.strokeStyle = linecolor;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.stroke(); 	    
}

let a = null;
let b = null;

function query() {
    let x = parseFloat(document.getElementById("worth").value);
    let y = a * x + b;
    var result = "Recommended rent is " + y.toFixed(0);
    result += '<br><small>Model parameters: slope ' + a.toFixed(5)
	+ ' and intercept ' + b.toFixed(5) + '</small>';
    document.getElementById("result").innerHTML = result;
}
   

function prep() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);    
    // sums
    let xs = 0;
    let ys = 0;
    // sums of squares
    let xss = 0;
    let yss = 0;
    // sum of products
    let sxy = 0;
    // minimums
    let xl = null;
    let yl = null;
    // maximums
    let xh = null;
    let yh = null;
    // parse the data
    for (let i = 0; i < rc; i++) {
	let x = parseFloat(document.getElementById('x' + i).value);
	let y = parseFloat(document.getElementById('y' + i).value);
	// accumulate the sums
	xs += x;
	ys += y;
	xss += (x * x);
	yss += (y * y);
	sxy += x * y;
	// determine the range of x
	if (xl == null) {
	    xl = x;
	} else {
	    xl = Math.min(xl, x);
	}
	if (xh == null) {
	    xh = x;
	} else {
	    xh = Math.max(xh, x);
	}
	// determine the range of y
	if (yl == null) {
	    yl = y;
	} else {
	    yl = Math.min(yl, y);
	}
	if (yh == null) {
	    yh = y;
	} else {
	    yh = Math.max(yh, y);
	}
    }
    // add some margin to the ranges
    xl *= 0.85; // 15% of minimum beneath
    yl *= 0.85;
    xh *= 1.1; // 10% of maximum above
    yh *= 1.1;
    for (let i = 0; i < rc; i++) {
	let x = parseFloat(document.getElementById('x' + i).value);
	let y = parseFloat(document.getElementById('y' + i).value);
	let xp = scale(x, xl, xh, canvas.width, true);
	let yp = scale(y, yl, yh, canvas.height, false);
	dot(xp, yp);
    }
    // regression line
    // cf. https://www.cuemath.com/data/regression-coefficients/
    a = (rc * sxy - xs * ys) / (rc * xss - xs * xs); // slope
    b = (ys * xss - xs * sxy) / (rc * xss - xs * xs); // intercept
    console.log('regression line', a, b);
    // y = a * x + b
    let ystart = a * xl + b;
    let yend = a * xh + b;
    let x1 = scale(xl, xl, xh, canvas.width, true);
    let y1 = scale(ystart, yl, yh, canvas.height, false);
    let x2 = scale(xh, xl, xh, canvas.width, true);
    let y2 = scale(yend, yl, yh, canvas.height, false);
    line(x1, y1, x2, y2); // line from (x1, y1) to (x2, y2)
    document.getElementById('consult').disabled = false;
}
