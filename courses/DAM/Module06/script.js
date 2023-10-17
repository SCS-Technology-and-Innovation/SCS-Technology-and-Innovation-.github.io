const verbose = false;

const file = document.getElementById("data");
const loadbutton = document.getElementById("load");
const stepbutton = document.getElementById("step");

const lha = 'HeikenAshi';
var label = null;
var data = null;
let columns = null;
let rowcount = null;

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
ctx.textBaseline = 'middle';

file.onchange = e => {
    if (verbose) {
	console.log('A file has been chosen');
    }
    var r = new FileReader();
    label = (file.files[0].name);
    label = label.substring(0, label.length - 4);
    console.log('Loading', label);
    r.readAsText(file.files[0] ,'UTF-8');
    r.onload = ev => {
	if (verbose) {
	    console.log('Parsing the CSV file for', label);
	}
	data = {};
	columns = [];
	const rows = ev.target.result.split('\n');
	let cols = (rows.shift()).split(',');
	let cc = cols.length;
	let rc = rows.length;
	rowcount = rc;
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
	columns = cols;
	heikenashi();
	prep();
    }
}

function heikenashi() {
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
    data[lha] = ha;
    columns.push(lha);
}

let labels = null;
let peak = null;

function zigzag(t, v) {
    let top = parseFloat(document.getElementById('threshold').value);        	    
    let threshold = {};
    threshold[3] = top;
    threshold[2] = threshold[3] / 2;
    threshold[1] = threshold[3] / 10;
    let n = v.length;
    let curr = null;
    let hist = {};
    let when = {};
    labels = {};
    peak = {};
    for (let k = 3; k > 0; k--) {
	hist[k] = [];
	when[k] = [];
    }
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
			hist[k].shift(); // pop the first
			when[k].shift(); // pop the first
		    }
                    hist[k].push(curr);
		    when[k].push(t[i]);
                    if (hist[k].length == 3) {
			if (verbose) {
			    console.log(d.toFixed(2),
					'Enough backlog to place a semaphone for', k);
			}
			let loc = when[k][1];
			let value = hist[k][1];
			if ((hist[k][0] > hist[k][1]) && (hist[k][1] < hist[k][2])) {
                            if (!labels.hasOwnProperty(loc) || labels[loc] < k) {
				labels[loc] = k;
				peak[loc] = true; // y coord mirrored
			    }
			}
			if ((hist[k][0] < hist[k][1]) && (hist[k][1] > hist[k][2])) {
                            if (!labels.hasOwnProperty(loc) || labels[loc] < k) {
				labels[loc] = k;
				peak[loc] = false;
			    }
			}
		    }
		}
	    }
	}
	prev = curr;
    }
}

function range(values, from, to) {
    let low = null;
    let high = null;
    for (let i = from; i <= to; i++) {
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
	if (v < 0.1) {
	    return v.toFixed(3);	
	} else if (v < 1) {
	    return v.toFixed(2);
	} else if (v > 10) {
	    return v.toFixed(0);
	}
	return v.toFixed(1);
    }
}

function ticks(range, count, fontcolor, vertical) {
    let start = range[0];
    let end = range[1];
    let span = end - start;
    ctx.fillStyle = fontcolor;
    if (vertical) { // vertical ticks
	ctx.textAlign = 'center';
	y = hr[1];
	dy = (hr[1] - hr[0]) / (count - 1);
	for (let p = 0; p < count; p++) {
	    let value = (start + (p / count) * span);
	    value = format(value, false);
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
	    value = format(value, true);
	    ctx.fillText(value, x, y);
	    x += dx;
	}	
    }
}

function random(low, high) {
    let span = high - low;
    return low + span * Math.random();
}

function transaction(purchase, moment) {
    console.log(data['Low'][moment], data['High'][moment]);
    let price = random(data['Low'][moment], data['High'][moment]);
    console.log(price);
    if (purchase) {
	if (holdings > 0) {
	    alert('You can only sell, you already hold stocks.');
	} else {
	    let count = Math.floor(budget / price); // how many can we afford
	    budget -= count * price; // we might have some pennies left over
	    holdings = count;
	}
    } else {
	if (holdings < 1) {
	    alert('You can only buy, you hold no stocks at present.');	    
	} else {
	    budget += holdings * price;
	    holdings = 0;
	}
    }
    let former = record.innerHTML;
    let added = 'On ' + format(data['Date'][moment], true) 
	+ ', you have ' + budget.toFixed(0) + ' dollars and ' 
	+ holdings + ' stocks; the unit price of your transaction was ' + price + '.';
    record.innerHTML = added + '<br>' + former;
}

let current = 0;

function reset() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);      
    current = 0;
    budget = 10000;
    holdings = 0;
    document.getElementById('track').innerHTML = 'You have reset the simulation.';
    document.getElementById('current').innerHTML = '';
}

function step(event) {
    var name = event.key;
    var code = event.code;
    if (code == 'Space') {
	if (current < rowcount - 1) {
	    upto(++current);
	} else {
	    alert('There is no more data available.');
	}
    } else {
	if (code == 'KeyB') {
	    transaction(true, current);
	} else if (code == 'KeyS') {
	    transaction(false, current);
	} else if (code == 'KeyR') {
	    reset();
	} else {
	    console.log('Keypress', name, code);
	}
    }
}

document.addEventListener('keypress', step);

const SPAN = 50;

function upto(last) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);  
    let start = Math.max(0, last - SPAN);
    let xd = data['Date'];
    let xrange = range(xd, start, last);
    ticks(xrange, tcx, col, false, true);    
    ylrange = range(data['Low'], start, last);
    yhrange = range(data['High'], start, last);
    let yrange = [ylrange[0], yhrange[1]];
    ticks(yrange, tcy, col, true, false);
    for (let time = start; time <= last; time++) {    
	let xr = data['Date'][time];
	let yr = (data['Low'][time] + data['High'][time]) / 2; // midpointish
	if (time == last) {
	    curr.innerHTML = 'Current price from ' + data['Low'][time] + '  to ' + data['High'][time] + " (low and high).";
	}
	let x = scale(xr, xrange, wr, false);
	let y = scale(yr, yrange, hr, true);
	let xb = null;
	let yb = null;
	let ha = scale(data[lha][time], yrange, hr, true);
	let yh = ha[3];
	let yl = ha[0];
	let bh = yh - yl;
	ctx.fillStyle = col;	
	if (bh > 0) {
	    ctx.strokeStyle = '#ff0000'; // red
	    stick(x, ha[1], x, ha[2]);
	    ctx.beginPath();
	    ctx.rect(x - hw, yl, bw, bh);
	    ctx.closePath();
	} else {
	    ctx.strokeStyle = '#00ff00'; // green
	    stick(x, ha[1], x, ha[2]);	    
	    ctx.beginPath();
	    ctx.rect(x - hw, yh, bw, -bh);
	    ctx.closePath();
	}
	ctx.fill();
	ctx.lineWidth = lw;
	ctx.stroke();
	if (labels.hasOwnProperty(xr)) {
	    let k = labels[xr];
	    if (peak[xr]) {
		ctx.strokeStyle = '#009900';
		ctx.fillStyle = '#009900';
		k += '+';
	    } else {
		ctx.strokeStyle = '#ff0000';
		ctx.fillStyle = '#ff0000';
		k += '-';
	    }
	    ctx.textAlign = 'left';
	    let x = null;
	    let yc = null;
	    if (peak[xr]) {
		yc = data['High'][time];
	    } else {
		yc = data['Low'][time];
	    }
	    x = scale(xr, xrange, wr, false); 
	    y = scale(yc, yrange, hr, true);
	    if (peak[xr]) {
		y -= offset;
	    } else {
		y += offset;
	    }
		ctx.textAlign = 'center';	    
	    ctx.fillText(k, x, y);
	}
    }
}

function stick(xs, ys, xe, ye) {
    ctx.beginPath();
    ctx.moveTo(xs, ys);
    ctx.lineTo(xe, ye);
    ctx.lineWidth = lw;    
    ctx.stroke(); 	
}

const lw = 3;
const bw = 4 * lw;
const hw = bw / 2;
const fs = 14;
const col = '#00ffff'; // cyan

let offset = 15;

let w = null;
let h = null;
let tcx = null; 
const tcy = 5; 
let budget = 10000;
let holdings = 0;

let record = document.getElementById('track');
let curr = document.getElementById('current');

function prep() {
    record.innerHTML += 'At the beginning, you have ' + budget + ' dollars and ' + holdings + ' stocks.';        
    w = SPAN * 3 * bw;
    h = 0.6 * window.innerHeight;
    canvas.width = w;
    canvas.height = h;
    margin = Math.ceil(0.07 * h); // margin
    let t = 2 * margin; // space for ticks
    tcx = Math.floor(w / t / 2);
    let fontsize = Math.ceil(t / 7); // tick font size
    ctx.font = 'bold ' + fontsize + 'px Courier';	    
    wr = [margin + t, w - margin - t];
    hr = [margin + t, h - margin - t];    
    let xs = [];
    let ys = [];
    for (let i = 0; i < rowcount; i++) {
	let xr = data['Date'][i];
	xs.push(xr);	
	let yr = (data['Close'][i] + data['Open'][i]) / 2; // midpointish
	ys.push(data['Close'][i]); // use the closing price for zz
    }
    zigzag(xs, ys); // compute them
    ctx.font = 'bold ' + fs + 'px Courier';
}


let wr = null;
let hr = null;
let margin = null;
    
