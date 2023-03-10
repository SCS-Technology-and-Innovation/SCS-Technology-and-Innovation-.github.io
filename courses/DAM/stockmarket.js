const verbose = false;
const colors = palette('cb-Pastel1', 7); // http://google.github.io/palette.js/
if (verbose) {
    console.log('Color palette:', colors);
}
let next = 0;
const file = document.getElementById("data");
const loadbutton = document.getElementById("load");
const drawbutton = document.getElementById("draw");

file.onchange = e => {
    if (verbose) {
	console.log('A file has been chosen');
    }
    var r = new FileReader();
    var label = file.files[0].name;
    label = label.substring(0, label.length - 4);
    console.log('Loading', label);
    r.readAsText(file.files[0] ,'UTF-8');
    r.onload = ev => {
	if (verbose) {
	    console.log('Parsing the CSV file for', label);
	}
	const rows = ev.target.result.split('\n');
	let cols = (rows.shift()).split(',');
	let cc = cols.length;
	let rc = rows.length;
	rowcount[label] = rc;
	let data = {};
	for (let i = 0; i < cc; i++) {
	    let cn = cols[i].replaceAll(' ', '');
	    data[cn] = []; // blank to begin with
	    cols[i] = cn;
	}
	for (let row of rows) { 
	    let cv = row.split(',');
	    for (let i = 0; i < cc; i++) {
		let v = cv[i];
		if (i == 0) {
		    v = Date.parse(v);
		} else {
		    v = parseFloat(v);
		}
		data[cols[i]].push(v);
	    }
	}
	columns[label] = cols;
	dataset[label] = data;
	controls(label);
    }
}

let dataset = {};
let columns = {};
let rowcount = {};

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
ctx.textBaseline = 'middle';

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

function format(v, date) {
    if (date) {
	let d = new Date(Math.round(v));
	let f = d.toString().split(' ');
	f = f.slice(1, 4);
	// console.log(f);	
	return f.join(' ');
    } else {
	v = parseFloat(v);
	if (verbose) {
	    console.log('Rounding', v, 'which is a', typeof v);
	}
	if (v < 1) {
	    return v.toFixed(2);
	} else if (v > 10) {
	    return v.toFixed(0);
	}
	return v.toFixed(1);
    }
}

function ticks(range, count, fontcolor, vertical, dates) {
    let start = range[0];
    let end = range[1];
    let span = end - start;
    ctx.fillStyle = fontcolor;
    
    console.log('Placing', count, 'tickmarks');
    if (dates) {
	console.log('The values are dates');
    }
    if (vertical) { // vertical ticks
	ctx.textAlign = 'center';
	y = hr[1];
	dy = (hr[1] - hr[0]) / (count - 1);
	for (let p = 0; p < count; p++) {
	    let value = (start + (p / count) * span);
	    value = format(value, dates);
	    ctx.fillText(value, margin, y);
	    y -= dy;
	}
    } else { // horizontal
	ctx.textAlign = 'right';	
	let y = canvas.height - margin;
	x = wr[0];
	dx = (wr[1] - wr[0]) / (count - 1);
	for (let p = 0; p < count; p++) {
	    let value = (start + (p / count) * span).toFixed(2);
	    value = format(value, dates);
	    ctx.fillText(value, x, y);
	    x += dx;
	}	
    }
}

function draw(event) {
    let chosen = event.target.id.substring(4);
    let col = document.getElementById('color' + chosen).value;
    console.log('Drawing', chosen, 'in', col);
    
    let data = dataset[chosen];
    let h = canvas.height;
    let w = canvas.width;

    let xv = document.getElementById('x' + chosen);
    let yv = document.getElementById('y' + chosen);
    let skip = document.getElementById('every' + chosen);
    
    let xlabel = xv.value;
    let ylabel = yv.value;
    console.log('Plotting', xlabel, 'versus', ylabel, 'for', chosen);

    let xrange = range(data[xlabel]);
    if (verbose) {
	console.log('Horizontal range is', xrange);
    }
    let k = parseInt(document.getElementById('xticks' + chosen).value);    
    ticks(xrange, k, col, false, xlabel == 'Date');
    
    let yrange = range(data[ylabel]);
    if (verbose) {
	console.log('Vertical range is', yrange);
    }
    k = parseInt(document.getElementById('yticks' + chosen).value);        
    ticks(yrange, k, col, true, ylabel == 'Date');
    
    let pointsize = parseInt(document.getElementById('size' + chosen).value);
    let linesize = parseInt(document.getElementById('thick' + chosen).value);
    let connect = document.getElementById('lines' + chosen).checked;    
    ctx.fillStyle = col;
    ctx.strokeStyle = col;
    let px = null;
    let py = null;
    let s = parseInt(skip.value);
    let sh = parseInt(document.getElementById('shift' + chosen).value);
    let n = rowcount[chosen];
    if (verbose) {
	console.log('Plotting every', s, 'points');
    }
    console.log('Shifting by', sh, 'points');
    for (let i = 0; i < n; i += s) {
	let p = i + sh;
	if (p >= 0 && p < n) {
	    let xv = data[xlabel][p]; 
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
}

var ctrl = document.getElementById('controls');
function controls(label) {
    console.log('Creating controls for', label);
    var d = document.createElement('div');
    d.className = 'controlbox';
    d.id = 'label';
    // d.appendChild(document.createElement('hr'));
			    
    var h = document.createElement('h3');
    h.innerHTML = 'Plot options for ' + label;
    d.appendChild(h);
    let n = rowcount[label];
    d.appendChild(document.createTextNode(n + ' data points available'));

    var p = document.createElement('p');
    var xv = document.createElement('select');
    xv.id = 'x' + label;
    var l = document.createElement('label');
    l.htmlFor = xv.id;
    l.innerHTML = ' Horizontal ';
    p.appendChild(l);        
    p.appendChild(xv);    
    var yv = document.createElement('select');
    yv.id = 'y' + label;
    l = document.createElement('label');
    l.htmlFor = yv.id;
    l.innerHTML = ' &nbsp;Vertical ';    
    p.appendChild(l);            
    p.appendChild(yv);
    d.appendChild(p);

    p = document.createElement('p');
    let i = document.createElement('input');
    i.type = 'number';
    i.value = 0;
    i.min = 5;
    i.max = 20;        
    i.step = 5;
    i.id = 'xticks' + label;
    l = document.createElement('label');
    l.htmlFor = i.id;
    l.innerHTML = 'Horizontal tick count ';
    p.appendChild(l);
    p.appendChild(i);

    i = document.createElement('input');
    i.type = 'number';
    i.value = 0;
    i.min = 5;
    i.max = 20;        
    i.step = 5;
    i.id = 'yticks' + label;
    l = document.createElement('label');
    l.htmlFor = i.id;
    l.innerHTML = ' &nbsp;Vertical tick count ';
    p.appendChild(l);
    p.appendChild(i);
    d.appendChild(p);
    
    p = document.createElement('p');

    i = document.createElement('input');
    i.type = 'number';
    i.value = 0;
    i.min = Math.round(n / 2);
    i.max = -1 * i.min;        
    i.step = 5;
    i.id = 'shift' + label;
    l = document.createElement('label');
    l.htmlFor = i.id;
    l.innerHTML = 'Horizontal shift ';
    p.appendChild(l);
    p.appendChild(i);
    
    d.appendChild(p);

    l = document.createElement('label');
    let skip = document.createElement('select');
    skip.id = 'every' + label;
    d.appendChild(p);
    l.innerHTML = ' &nbsp;Plot every ';    
    p.appendChild(l);
    p.appendChild(skip);
    p.append(document.createTextNode(' point(s)'));
    d.appendChild(p);

    let e = 1;
    while (e < rowcount[label]) {
	var o = document.createElement('option');
	o.value = e;
	o.innerHTML = e;
	skip.appendChild(o);
	e *= 5;
    }
    
    p = document.createElement('p');	     
    i = document.createElement('input');
    i.type = 'color';
    i.value = '#' + colors[next++];
    console.log('Color default for', label, 'is', i.value);
    if (next >= colors.length) {
	next = 0; // cycle back
    }
    i.id = 'color' + label;
    l = document.createElement('label');
    l.htmlFor = i.id;
    l.innerHTML = ' Color ';
    p.appendChild(l);
    p.appendChild(i);

    i = document.createElement('input');
    i.type = 'range';
    i.min = 1;
    i.max = 30;
    i.value = 3
    i.step = 1;;    
    i.id = 'size' + label;
    l = document.createElement('label');
    l.htmlFor = i.id;
    l.innerHTML = ' &nbsp;Marker size ';
    p.appendChild(l);
    p.appendChild(i);
    d.appendChild(p);

    p = document.createElement('p');	         
    l = document.createElement('label');
    i = document.createElement('input');
    i.type = 'checkbox';
    i.id = 'lines' + label;
    l.htmlFor = i.id;
    l.innerHTML = ' Lines ';
    p.appendChild(l);
    p.appendChild(i);

    i = document.createElement('input');
    i.type = 'range';
    i.min = 1;
    i.max = 10;
    i.value = 2
    i.step = 1;;    
    i.id = 'thick' + label;
    l = document.createElement('label');
    l.htmlFor = i.id;
    l.innerHTML = ' Thickness ';
    p.appendChild(l);
    p.appendChild(i);
    d.appendChild(p);

    p = document.createElement('p');	         
    let b = document.createElement('button');
    b.innerHTML = 'Plot ' + label;
    b.id = 'draw' + label;
    b.addEventListener("click", draw);
    p.appendChild(b);
    d.appendChild(p);
    
    ctrl.appendChild(d);

    let cols = columns[label];
    let cc = cols.length;
    for (let i = 0; i < cc; i++) {
	let fo = cols[i];
	let fn = fo.replaceAll(' ', '');
	var xo = document.createElement('option');
	var yo = document.createElement('option');
	xo.value = fn;
	yo.value = fn;
	xo.innerHTML = fo;
	yo.innerHTML = fo;
	xv.appendChild(xo);
	yv.appendChild(yo);
    }
    yv.value = cols[1]; 
}

function erase() {
    console.log('Erasing the canvas');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

let wr = null;
let hr = null;
let margin = null;

function resize() {
    let h = 0.6 * window.innerHeight;
    let w = Math.round(h * 1.618);    
    canvas.width = w;
    canvas.height = h;
    margin = Math.ceil(0.05 * h); // margin
    let t = 2 * margin; // space for ticks
    let fontsize = Math.ceil(t / 7); // tick font size
    ctx.font = 'bold ' + fontsize + 'px Courier';	    
    wr = [margin + t, w - margin];
    hr = [margin, h - margin - t];    
}

resize();
