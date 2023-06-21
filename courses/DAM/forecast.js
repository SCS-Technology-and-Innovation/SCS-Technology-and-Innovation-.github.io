function normal(m, s) {
    let r = Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random());
    return s * r + m;
}

let raw = [];
let data = [];
let errors = [ null ];
let forecast = [ null ];

let low = null;
let high = null;

var canvas = document.getElementById('timeseries');
var ctx = canvas.getContext('2d');

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
    if (v.length >= p) { // able to do both AR
	let pos = [];
	for (let i = v.length - p; i < v.length; i++) {
	    pos.push(i);
	}
	let AR = regression(v.slice(v.length - pos.length), pos);
	let arpart = AR[0] * v.length + AR[1]; // the AR part
	// console.log('AR gave', arpart);
	f += arpart;
	if (errors.length >= q && count >= q) { // able to do the MA part
	    pos = [];
	    for (let i = errors.length - q; i < errors.length; i++) {
		pos.push(i - 1);
	    }	    
	    let MA = regression(errors.slice(errors.length - pos.length), pos);
	    mapart = (MA[0] * errors.length + MA[1]); // include the MA part
	    // console.log('MA gave', mapart);	    
	    f -= ew * mapart;
	}
    }
    if (d == 1) { // that was a difference and not the value itself
	let prev = data[k - 1];
	// console.log('undiff from', prev);
	f += data[k - 1];
    }
    if (f < low) {
	low = f;
    }
    if (f > high) {
	high = f;
    }
    forecast.push(f); // store the forecast
    // console.log(data[k - 1], 'versus', f);
}

function ac(values) {
    let n = values.length;
    let threshold = parseFloat(document.getElementById("thr").value);
    target.innerHTML = ''; // reset
    let pending = true;
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
    for (let i = 0; i < n; i++) {
	// draw the data
	ctx.lineWidth = 2;
	let x = scale(i, 0, n, w, false);
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
	    x = scale(i, 0, n, w, false); 
	    y = scale(forecast[i], low, high, h, true);
	    ctx.lineWidth = 1;
	    ctx.strokeStyle = 'orange';
	    ctx.beginPath();
	    ctx.arc(x, y, 3, 0, 2 * Math.PI);
	    ctx.stroke();
	}
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
    let n = forecast.length;
    let latest = forecast[n - 1];
    if (latest != null) {
	let e = r - latest;
	// console.log('Error', e);
	errors.push(e);
	count++;
    } else {
	errors.push(null);
    }	
    arima();
    draw();
}
