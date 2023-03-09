

const file = document.getElementById("data");
const loadbutton = document.getElementById("load");
const drawbutton = document.getElementById("draw");

file.onchange = e => {
    console.log('A file has been chosen');
    loadbutton.disabled = false;
}

let data = null;
let fields = null;
let rc = null;
let cc = null;

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var xv = document.getElementById('x');
var yv = document.getElementById('y');
var skip = document.getElementById('every');

function range(values) {
    let low = values[0];
    let high = low;
    for (let i = 0; i < values.length; i++) {
	let v = values[i];
	if (v < low) {
	    low = v;
	} else if (v > high) {
	    high = v;
	}
    }
    return [ low, high ];
}

function scale(value, valuerange, pixelrange, mirror) {
    let vmin = valuerange[0];
    let vmax = valuerange[1];
    let vspan = vmax - vmin;
    let pmin = pixelrange[0];
    let pmax = pixelrange[1];
    let pspan = pmax - pmin;    
    let prop = (value - vmin) / vspan;
    if (mirror) {
	prop = 1 - prop;
    }
    return pmin + prop * (pspan);
}

function draw() {
    let h = 0.6 * window.innerHeight;
    let w = Math.round(h * 1.618);    
    canvas.width = w;
    canvas.height = h;
    ctx.clearRect(0, 0, w, h);
    m = Math.ceil(0.05 * h);
    let wr = [m, w - m];
    let hr = [m, h - m];
    let xlabel = xv.value;
    let ylabel = yv.value;
    console.log('Plotting', xlabel, 'versus', ylabel);
    let xrange = range(data[xlabel]);
    let yrange = range(data[ylabel]);
    let pointsize = parseInt(document.getElementById('size').value);
    let linesize = parseInt(document.getElementById('thick').value);
    let pointcolor = document.getElementById('color').value;
    let connect = document.getElementById('lines').checked;    
    ctx.fillStyle = pointcolor;
    ctx.strokeStyle = pointcolor;
    let px = null;
    let py = null;
    let s = parseInt(skip.value);
    for (let i = 0; i < rc; i += s) {
	let xv = data[xlabel][i];
	let yv = data[ylabel][i];
	let x = scale(xv, xrange, wr, false);
	let y = scale(yv, yrange, hr, true);
	if (connect && px != null) {
	    ctx.lineWidth = linesize;
	    ctx.beginPath();
	    ctx.moveTo(px, py);
	    ctx.lineTo(x, y);
	    ctx.stroke(); 	
	}
	ctx.beginPath();
	ctx.arc(x, y, pointsize, 0, 2 * Math.PI);
	ctx.closePath();
	ctx.fill();
	ctx.stroke();
	px = x;
	py = y;
    }
}

function load() {
    var r = new FileReader();
    r.readAsText(file.files[0] ,'UTF-8');
    r.onload = ev => {
	console.log('Parsing the CSV file');
	const rows = ev.target.result.split('\n');
	fields = (rows.shift()).split(',');
	rc = rows.length;
	cc = fields.length;
	data = { };
	let e = 1;
	while (e < rc) {
	    var o = document.createElement('option');
	    o.value = e;
	    o.innerHTML = e;
	    skip.appendChild(o);
	    e *= 5;
	}
	for (let i = 0; i < cc; i++) {
	    let fo = fields[i];
	    let fn = fo.replaceAll(' ', '');
	    fields[i] = fn;
	    var xo = document.createElement('option');
	    var yo = document.createElement('option');
	    xo.value = fn;
	    yo.value = fn;
	    xo.innerHTML = fo;
	    yo.innerHTML = fo;
	    xv.appendChild(xo);
	    yv.appendChild(yo);
	    data[fn] = []; // blank it out
	}
	yv.value = fields[1]; // the second one
	for (let row of rows) { 
	    let cols = row.split(',');
	    for (let i = 0; i < cc; i++) {
		let v = cols[i];
		if (i == 0) {
		    v = Date.parse(v);
		} else {
		    v = parseFloat(v);
		}
		data[fields[i]].push(v);
	    }
	}
    }
    drawbutton.disabled = false;
}
