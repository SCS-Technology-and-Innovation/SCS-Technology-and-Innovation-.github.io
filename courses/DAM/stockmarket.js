const verbose = false;
const colors = palette('cb-Pastel1', 7); // http://google.github.io/palette.js/
if (verbose) {
    console.log('Color palette:', colors);
}
let next = 0;
const file = document.getElementById("data");
const loadbutton = document.getElementById("load");
const drawbutton = document.getElementById("draw");

const lha = 'HeikenAshi';

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
	heikenashi(label);
	controls(label);
    }
}

function heikenashi(l) {
    let data = dataset[l];
    let k = data['Date'].length;
    let ha = [];
    let HAO = null;
    let HAC = null;
    let HAH = null;
    let HAL = null;
    for (let i = 0; i < k; i++) {
        let opening = parseFloat(data['Open'][i]);
	let low = parseFloat(data['Low'][i]);
	let high = parseFloat(data['High'][i]);
	let closing = parseFloat(data['Close'][i]);        
        if (HAO == null) {
            HAO = opening;
	}
        if (HAC == null) {
            HAC = closing;
	}
        HAC = (opening + high + low + closing) / 4;
        HAO = (HAO + HAC) / 2;
        HAH = Math.max(high, Math.max(HAO, HAC));
        HAL = Math.min(low, Math.min(HAO, HAC));
        ha.push([HAO, HAL, HAH, HAC]);
    }
    dataset[l][lha] = ha;
    columns[l].push(lha);
}

function zigzag(t, v, ps, top, flip) {
    let threshold = {};
    threshold[3] = top;
    threshold[2] = threshold[3] / 2;
    threshold[1] = threshold[3] / 10;
    if (verbose) {
	console.log('Placing semaphores...');
    }
    let n = v.length;
    let curr = null;
    let hist = {};
    let when = {};
    let labels = {};
    let peak = {};
    let positions = {};    
    for (let k = 3; k > 0; k--) {
	hist[k] = [];
	when[k] = [];
    }
    let counter = 0;
    let prev = v[0];
    for (let i = 1; i < n; i++) {
	curr = v[i];
	if (verbose) {
	    console.log(prev, 'vs', curr);
	}
	if (prev > 0) {
            let d = Math.abs(curr - prev) / prev;
	    for (let k = 3; k > 0; k--) {
		if (d > threshold[k]) {
		    if (verbose) {
			console.log(d.toFixed(2), 'is above threshold for', k);
		    }
                    while (hist[k].length > 2) {
			hist[k].shift();
			when[k].shift();
		    }
                    hist[k].push(curr);
		    when[k].push(t[i]);
                    if (hist[k].length == 3) {
			if (verbose) {
			    console.log(d.toFixed(2), 'Enough backlog to place a semaphone for', k);
			}
			let loc = when[k][1];
			let value = hist[k][1];
			if ((hist[k][0] > hist[k][1]) && (hist[k][1] < hist[k][2])) {
                            if (!labels.hasOwnProperty(loc) || labels[loc] < k) {
				labels[loc] = k;
				peak[loc] = true; // y coord mirrored
				positions[loc] = value;
				counter++;
			    }
			}
			if ((hist[k][0] < hist[k][1]) && (hist[k][1] > hist[k][2])) {
                            if (!labels.hasOwnProperty(loc) || labels[loc] < k) {
				labels[loc] = k;
				peak[loc] = false;
				positions[loc] = value;
				counter++;				
			    }
			}
		    }
		}
	    }
	}
	prev = curr;
    }
    let fs = Math.min(15, Math.round(200 - 2 * Math.sqrt(counter)));
    let offset = 3 * ps + 2 * Math.round(Math.sqrt(fs));
    ctx.font = 'bold ' + fs + 'px Courier';
    console.log('Semaphone font size', fs, 'based on a count of', counter);
    for (let t in labels) {
	let k = labels[t];
	let p = positions[t];
	let o = offset;
	if (peak[t]) {
	    ctx.fillStyle = '#009900';
	    k += '+';
	} else {
	    ctx.fillStyle = '#ff0000';
	    k += '-';
	}
	t = parseFloat(t);
	ctx.textAlign = 'left';
	let x = null;
	let y = null;
	if (flip) {
	    if (peak[t]) {
		o *= 2; 
	    } else {
		o *= -1;
	    }	    
	    y = scale(t, yrange, hr, true);
	    x = scale(p, xrange, wr, false);
	    ctx.fillText(k, x - o, y);	    	    
	} else {
	    if (peak[t]) {
		o *= -1;	    
	    } else {
		o += 2 * ps;
	    }
	    x = scale(t, xrange, wr, false);
	    y = scale(p, yrange, hr, true);
	    ctx.fillText(k, x - ps, y + o);
	}
	if (verbose) {
	    console.log('Placed', k, 'at', x, y);
	}
    }
}

let dataset = {};
let columns = {};
let rowcount = {};

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
ctx.textBaseline = 'middle';

function range(values) {
    let low = null;
    let high = null;
    for (let i = 0; i < values.length; i++) {
	if (values[i].constructor === Array) {
	    let k = values[i].length;
	    for (let j = 0; j < k; j++) {
		let v = values[i][j];
		if (low == null || v < low) {
		    low = v;
		}
		if (high == null || v > high) {
		    high = v;
		}
	    }
	} else {
	    let v = values[i];
	    if (low == null || v < low) {
		low = v;
	    }
	    if (high == null || v > high) {
		high = v;
	    }
	}
    }
    return [ low, high ];
}

function scale(value, valuerange, pixelrange, flip) {
    let vmin = valuerange[0];
    let vmax = valuerange[1];
    let vspan = vmax - vmin;
    let pmin = pixelrange[0];
    let pmax = pixelrange[1];
    let pspan = pmax - pmin;    
    if (value.constructor === Array) {
	if (verbose) {
	    console.log('Scaling an array', value, 'from', valuerange, 'to', pixelrange);
	}
	let scaled = [];
	let k = value.length;
	for (let i = 0; i < k; i++) {
	    let v = parseFloat(value[i]);
	    let prop = (v - vmin) / vspan;
	    if (flip) {
		prop = 1 - prop;
	    }
	    if (verbose) {
		console.log('Proportion', prop);
	    }
	    scaled.push(Math.round(pmin + prop * pspan));
	}
	if (verbose) {
	    console.log('The result is', scaled);
	}
	return scaled;
    } else { // scalar
	if (verbose) {
	    console.log('Scaling a scalar', value);
	}
	let prop = (value - vmin) / vspan;
	if (flip) {
	    prop = 1 - prop;
	}
	return Math.round(pmin + prop * pspan);
    }
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

function stick(xs, ys, xe, ye) {
    ctx.beginPath();
    if (verbose) {
	console.log('line from', xs, ys, 'to', xe, ye);
    }
    ctx.moveTo(xs, ys);
    ctx.lineTo(xe, ye);
    ctx.stroke(); 	
}

function plotha(x, y, upright, ps, lw) {// y = open low high close
    let barwidth = 2 * ps;
    let half = ps;
    ctx.strokeStyle = '#00ff00'; // green
    let xb = null;
    let yb = null;
    let boxwidth = null;
    let boxheight = null;
    ctx.lineWidth = lw;
    if (!upright) { // fixed y, spanning x
	if (verbose) {
	    console.log('horizontal H-A', x, y);
	}
	if (x[3] > x[0]) {
	    ctx.strokeStyle = '#ff0000'; // red
	}
	stick(x[1], y - lw, x[2], y - lw);
	xb = x[0];
	yb = y - half;
	boxwidth = x[3] - xb;
	boxheight = barwidth;
    } else { // fixed x, spanning y
	if (y[3] > y[0]) {
	    ctx.strokeStyle = '#ff0000'; // red	    
	}
	if (verbose) {
	    console.log('vertical H-A', x, y);
	}
	stick(x - lw, y[1], x - lw, y[2]);
	xb = x - half;
	yb = y[0];
	boxwidth = barwidth;
	boxheight = y[3] - yb;
	
    }
    ctx.beginPath();
    ctx.rect(xb - lw, yb - lw, boxwidth + lw, boxheight + lw);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

let xrange = null;
let yrange = null;

function draw(event) {
    let chosen = event.target.id.substring(4);
    let col = document.getElementById('color' + chosen).value;
    console.log('Drawing', chosen, 'in', col);
    let h = canvas.height;
    let w = canvas.width;

    let xv = document.getElementById('x' + chosen);
    let yv = document.getElementById('y' + chosen);
    let skip = document.getElementById('every' + chosen);
    
    let xd = xv.value.split('-');
    let yd = yv.value.split('-');
    let xsrc = xd[1];
    let ysrc = yd[1];
    let xlabel = xd[0];
    let ylabel = yd[0];
    let ha = false;
    let ht = false; 
    if (xlabel == 'Date') {
	ht = true; // time is horizontal, data is vertical
    }    
    let timeseries = false;
    if ((xlabel == 'Date' && ylabel != 'Date') || (ylabel == 'Date' && xlabel != 'Date')) {
	timeseries = true;
    }
    if (xlabel == lha || ylabel == lha) {
	if ((xlabel == lha && ylabel != 'Date') || (ylabel == lha && xlabel != 'Date')) {
	    alert('Heiken-Ashi candles are only viable when the other axis is the date.');
	    if (xlabel == lha) {
		ylabel = 'Date';
		yv.value = 'Date-' + xsrc;
	    }
	    if (ylabel == lha) {
		xlabel = 'Date';
		xv.value = 'Date-' + ysrc;		
	    }
	}
	ha = true;
    }
    
    console.log('Plotting', xlabel, 'from', xsrc + '...');
    console.log('...versus', ylabel, 'from', ysrc);

    xrange = range(dataset[xsrc][xlabel]);
    if (verbose) {
	console.log('Horizontal range is', xrange);
    }
    let k = parseInt(document.getElementById('xticks' + chosen).value);    
    ticks(xrange, k, col, false, xlabel == 'Date');
    
    yrange = range(dataset[ysrc][ylabel]);
    if (verbose) {
	console.log('Vertical range is', yrange);
    }
    k = parseInt(document.getElementById('yticks' + chosen).value);        
    ticks(yrange, k, col, true, ylabel == 'Date');
    
    let pointsize = parseInt(document.getElementById('size' + chosen).value);
    let linesize = parseInt(document.getElementById('thick' + chosen).value);
    let connect = document.getElementById('lines' + chosen).checked;
    let zzs = document.getElementById('zigzag' + chosen).checked;

    if (zzs) {
	if ((ylabel == 'Date') && (xlabel == 'Date')) {
	    alert('Zig-zag semaphores are meaningful when only one axis is a date.');
	    zzs = false;
	}
	if ((ylabel != 'Date') && (xlabel != 'Date')) {
	    alert('Zig-zag semaphores are only meaningful when one axis is a date.');
	    zzs = false;
	}
    }
    ctx.fillStyle = col;
    let px = null;
    let py = null;
    let s = parseInt(skip.value);
    let sh = parseInt(document.getElementById('shift' + chosen).value);
    let n = rowcount[chosen];
    if (verbose) {
	console.log('Plotting every', s, 'points');
    }
    console.log('Shifting by', sh, 'points');
    let xs = [];
    let ys = [];
    for (let i = 0; i < n; i += s) {
	let p = i + sh;
	if (p >= 0 && p < n) {
	    let xr = dataset[xsrc][xlabel][p]; 
	    let yr = dataset[ysrc][ylabel][i];
	    if (zzs) { // use raw data for zigzags
		if (ha)  {
		    if (!ht) { // time is not horizontal
			xs.push((xr[1] + xr[2]) / 2);
			ys.push(yr);
		    } else {
			xs.push(xr);
			ys.push(yr[1] + yr[2]) / 2;
		    }
		} else {
		    xs.push(xr);
		    ys.push(yr);
		}
	    }	    
	    let x = scale(xr, xrange, wr, false);
	    // y needs to be always mirrored to have lower-left origin	    
	    let y = scale(yr, yrange, hr, true);
	    let xc = null;
	    let yc = null;
	    if (ha) {
		if (!ht) {
		    xc = (x[1] + x[2]) / 2;
		    yc = y;
		} else {
		    xc = x;
		    yc = (y[1] + y[2]) / 2;
		}
	    } else {
		xc = x;
		yc = y;
	    }
	    if (connect && px != null) {
		ctx.strokeStyle = col;		
		ctx.lineWidth = linesize;
		ctx.beginPath();
		ctx.moveTo(px, py);
		ctx.lineTo(xc, yc);
		ctx.stroke(); 	
	    }
	    if (!ha) {
		ctx.beginPath();
		ctx.strokeStyle = col;
		if (timeseries && py != null && y > py) {
		    ctx.rect(x - pointsize, y - pointsize, 2 * pointsize, 2 * pointsize);
		} else { 
		    ctx.arc(x, y, pointsize, 0, 2 * Math.PI);
		}
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
	    } else {
		plotha(x, y, ht, pointsize, linesize);
	    }
	    px = xc;
	    py = yc;
	}
    }
    if (zzs) {
	if (verbose) {
	    console.log(xlabel, xs);
	    console.log(ylabel, ys);
	}
	let thr = parseFloat(document.getElementById('threshold' + chosen).value);        	
	if (!ht) {
	    zigzag(ys, xs, pointsize, thr, true);
	    console.log('Flipped zigzags done');		
	} else {
	    zigzag(xs, ys, pointsize, thr, false);
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
    i.min = 5 * Math.round((n / 2) / 5);
    i.max = -1 * i.min;        
    i.id = 'shift' + label;
    i.value = 0;
    i.step = 10;
    p.appendChild(i);

    l = document.createElement('label');
    l.htmlFor = i.id;
    l.innerHTML = ' Horizontal shift ';
    p.appendChild(l);

    
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
    skip.value = 5;
    
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
    i.value = 3;
    i.step = 1;    
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
    i.value = 2;
    i.step = 1;
    i.id = 'thick' + label;
    l = document.createElement('label');
    l.htmlFor = i.id;
    l.innerHTML = ' Thickness ';
    p.appendChild(l);
    p.appendChild(i);
    d.appendChild(p);


    p = document.createElement('p');	         
    l = document.createElement('label');
    i = document.createElement('input');
    i.type = 'checkbox';
    i.id = 'zigzag' + label;
    l.htmlFor = i.id;
    l.innerHTML = ' Zig-zag semaphones ';
    p.appendChild(l);
    p.appendChild(i);
    i = document.createElement('input');
    i.type = 'number';
    i.value = 0.1;
    i.min = 0;
    i.step = 0.1;
    i.id = 'threshold' + label;
    l = document.createElement('label');
    l.htmlFor = i.id;
    l.innerHTML = ' using top threshold ';    
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

    for (let src in dataset) {
	let cols = columns[src];
	let k = cols.length;
	for (let i = 0; i < k; i++) {
	    let cn = cols[i];
	    var xo = document.createElement('option');
	    var yo = document.createElement('option');	    	    
	    xo.value = cn + '-' + src;
	    yo.value = cn + '-' + src;
	    xo.innerHTML = cn + ' for ' + src;
	    yo.innerHTML = cn + ' for ' + src;
	    xv.appendChild(xo);
	    yv.appendChild(yo);
	}
    }
    xv.value = columns[label][0] + '-' + label;    
    yv.value = columns[label][1] + '-' + label;
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
    wr = [margin + t, w - margin - t];
    hr = [margin + t, h - margin - t];    
}

resize();
