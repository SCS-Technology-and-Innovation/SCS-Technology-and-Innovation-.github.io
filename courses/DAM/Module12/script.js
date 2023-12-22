function normal(m, s) {
    let r = Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random());
    return s * r + m;
}

let raw = [];
let data = [];
let errors = [ ];
let forecast = [ ];
var canvas = document.getElementById('timeseries');
var ctx = canvas.getContext('2d');

const margin = 30;
const capacity = 50;

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

let target = document.getElementById("autocor");

function diff(values) {
    let d = [];
    let n = values.length;
    for (let i = 1; i < n; i++) {
	d.push(values[i] - values[i - 1]);
    }
    return d;
}

function regression(yv, xv) {
    let n = xv.length;
    if (xv.length != yv.length) {
	console.log('Array length mismatch in regression:', xv, yv);
	n = Math.min(xv.length, yv.length);
    }
    // console.log(n + '-point regression with', yv, xv);
    let sx = 0;
    let sy = 0;
    let xsq = 0;
    let sxy = 0;
    for (let i = 0; i < n; i++) {
	let x = xv[i];
	let y = yv[i];
	sx += x;
	sy += y;
	xsq += x * x;
	sxy += x * y;
    }
    let slope = (n * sxy - sx * sy) / (n * xsq - sx * sx);
    let intercept = (sy - slope * sx) / n; // y = slope * x + intercept
    return [ slope, intercept ];
}

let count = 0;

// Source https://bit.ly/2neWfJ2 
const every_nth = (arr, nth) => arr.filter((e, i) => i % nth === nth - 1);

function arima() { // as simplified as possible, nothing fancy
    let p = parseInt(document.getElementById("p").value); // for AR
    let d = parseInt(document.getElementById("d").value); // for I
    let q = parseInt(document.getElementById("q").value); // for MA
    let ew = parseFloat(document.getElementById("weight").value); // for MA
    let k = data.length;
    let v = data;
    let f = 0;
    // console.log('tail', data.slice(k - p));
    if (d == 1) { // the I part to make the data stationary
	v = diff(v);
    }
    ac(v);
    let last = v.length;
    if (p > 1 && last > p) { // able to do AR
	let pos = [];
	for (let i = last - p; i < last; i++) {
	    pos.push(i);
	}
	let intoAR = v.slice(last - p); // delay of length p
	let AR = regression(intoAR, pos);
	let arpart = AR[0] * last + AR[1]; // the AR part
	// console.log('AR gave', arpart, AR);
	f += arpart;
    } else if (p == 1) {
	f = v[last - 1]; // use the last difference
    }
    last = errors.length;
    if (q > 1 && last >= q && count >= q) { // able to do the MA part
	pos = [];
	for (let i = last - q; i < last; i++) {
	    pos.push(i - 1);
	}
	// errors are positive if the forecast has been too small the whole time
	// so the regression will give a positive number 
	let MA = regression(errors.slice(last - pos.length), pos);
	mapart = (MA[0] * last + MA[1]); // include the MA part
	// console.log('MA gave', mapart, MA);
	// we add the regression result to the new forecast
	f += ew * mapart;
    } else if (q == 1 && errors[last - 1] != null) {
	f += ew * errors[last - 1]; // adjust to the previous error
    }
    if (d == 1) { // that was a difference and not the value itself
	let prev = data[k - 1];
	// console.log('undiff from', prev);
	f += data[k - 1];
    }
    forecast.push(f); // store the forecast
    // console.log(data[k - 1], 'versus', f);
}

const maxac = 5;

function ac(values) {
    let n = values.length;
    let threshold = parseFloat(document.getElementById("thr").value);
    target.innerHTML = ''; // reset
    let pending = true;
    let printouts = 0;
    for (let l = 1; l <= n / 2; l++) { // lag
	let xm = 0;
	let ym = 0;
	for (let i = l; i < n; i++) {
	    xm += values[i];
	    ym += values[i - l];
	}
	xm /= n;
	ym /= n;
	let xd = 0;
	let yd = 0;
	let xy = 0;    
	for (let i = l; i < n; i++) {
	    let dx = values[i] - xm;	
	    let dy = values[i - l] - ym;
	    xd += (dx * dx);	
	    yd += (dy * dy);
	    xy += (dx * dy);
	}
	let c = xy / Math.sqrt(xd * yd);
	if (c >= threshold) {
	    target.innerHTML += 'Lag ' + l + ' has an autocorrelation of ' + c.toFixed(2) + '<br>';
	    printouts++;
	    if (printouts >= maxac) { // too many
		target.innerHTML += 'Autocorrelation report truncated at ' + (l - 1);
		return; // only the initial ones interest us		
	    }
	    pending = false;
	} else if (!pending) {
	    target.innerHTML += 'Autocorrelation falls below threshold after lag ' + (l - 1);
	    return; // only the initial ones interest us
	}
    }
}

function draw() {
    ctx.clearRect(0, 0, w, h);
    let px = null;
    let py = null;
    let n = data.length;
    let start = n - capacity; // show the tail
    if (start < 0) {
	start = 0;
    }
    let low = null;
    let high = null;
    for (let i = start; i < n; i++) {
	if (low == null || data[i] < low) {
	    low = data[i];
	}
	if (low == null || (forecast[i] != null && forecast[i] < low)) {
	    low = forecast[i];
	}
	if (high == null || data[i] > high) {
	    high = data[i];
	}
	if (high == null || (forecast[i] != null && forecast[i] > high)) {
	    high = forecast[i];
	}
    }
    for (let i = start; i < n; i++) {
	// draw the data
	ctx.lineWidth = 2;
	let x = scale(i, start, n, w, false);
	let y = scale(data[i], low, high, h, true);
	if (px != null) {
	    ctx.strokeStyle = 'green';
	    ctx.beginPath();
	    ctx.moveTo(px, py);
	    ctx.lineTo(x, y);
	    ctx.stroke();
	}
	px = x;	
	py = y;
	// draw the forecast
	if (forecast[i] != null) {
	    x = scale(i + 1, start, n, w, false); 
	    y = scale(forecast[i], low, high, h, true);
	    ctx.lineWidth = 1;
	    ctx.strokeStyle = 'orange';
	    ctx.fillStyle = 'yellow';
	    ctx.beginPath();
	    ctx.arc(x, y, 3, 0, 2 * Math.PI);
	    ctx.stroke();
	    ctx.fill();
	}
    }
}

document.addEventListener('keypress', generate);

let level = 0;
let change = 0;
let t = parseFloat(document.getElementById("trend").value); 

function setlevel() {
    let newt = parseFloat(document.getElementById("trend").value);
    if (newt != t) {
	let i = data.length;
	if (i > 0) {
	    level = data[i - 1]; 
	    change = i;
	}
	if (newt * t == -1) { // opposite signs
	    level *= -1;
	} else if (newt > t) {
	    level /= 2; // a smoothness hack
	}
	t = newt;
	// console.log('Level now at', level);
    }
}

function generate() {
    let p = null;
    if (document.getElementById("season").checked) {
	p = parseFloat(document.getElementById("period").value);
    }
    let i = data.length;
    let m = parseFloat(document.getElementById("mean").value);
    let s = parseFloat(document.getElementById("sd").value);    
    let r = normal(m, s); // add the noise        
    if (p != null) { // season
	if (i > p) {
	    let old = raw[i - p];
	    r += old; // as simple as possible: repeat history
	}
    }
    raw.push(r);
    r += ((i - change) * t) + level; // add the trend
    data.push(r);
    // now, forecast the next point
    arima();
    let n = forecast.length;
    // determine the error
    let latest = forecast[n - 1];
    if (latest != null) {
	let e = r - latest; // positive if the forecast is too small
	errors.push(e);
	count++;
    } else {
	errors.push(null);
	if (count > 0) {
	    console.log('Forecasting interruption');
	    count = 0;
	}
    }	
    draw();
}
