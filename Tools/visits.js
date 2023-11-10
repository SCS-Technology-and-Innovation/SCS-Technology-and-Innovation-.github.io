var values = null;
var contents = {};

const prefix = '/continuingstudies/'
let pl = prefix.length;
const input = document.getElementById('data');

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
ctx.textBaseline = 'middle';
ctx.font = '9 px Courier';
const margin = 60;

ctx.lineWidth = 4;

const mn = { 'jan' : 0,
	     'feb' : 1,
	     'mar' : 2,
	     'apr' : 3,
	     'may' : 4,
	     'jun' : 5,
	     'jul' : 6,
	     'aug' : 7,
	     'sep' : 8,
	     'oct' : 9,
	     'nov' : 10,
	     'dec' : 11 };

const nm = { 0 : 'jan',
	     1 : 'feb',
	     2 : 'mar',
	     3 : 'apr',
	     4 : 'may',
	     5 : 'jun',
	     6 : 'jul',
	     7 : 'aug',
	     8 : 'sep',
	     9 : 'oct',
	     10 : 'nov',
	     11 : 'dec' };


let first = null;
let last = null;
let span = null;

function process(label, text) {
    contents[label] = []; // reset
    const rows = text.split('\n');
    let count = 0;
    for (const row of rows) {
	let col = row.split(',');
	// Page path,Views,Total users,Average session duration		
	let path = col[0].substring(pl, col[0].length).trim();
	if (path == 'Page path') {
	    continue; // header row
	} else if (path.length == 0) { // empty
	    continue;
	} else if (path.includes('403.html')) {
	    continue; // skip the "forbidden" error code listings
	} else if (path.includes('404.html')) {
	    continue; // skip the "not found" error code listings
	} else {
	    let views = parseInt(col[1]);
	    let users = parseInt(col[2]);
	    let duration = parseFloat(col[3]);
	    let item = { 'path': path, 
			 'views' : views,
			 'users' : users,
			 'duration' : duration };
	    contents[label].push(item);
	    count++;
	}
    }
    return count;
}

function combine() {
    first = null;
    last = null;
    values = {}; // reset
    let count = 0;
    for (const label in contents) {
	let data = contents[label];

	var month = mn[label.substring(0, 3)]; // 0 to 11
	var year = parseInt('20' + label.substring(3, 5));
	
	t = time(month, year);
	console.log(label, t);
	if (first == null || t.getTime() < first.getTime()) {
	    first = t;
	}
	if (last == null || t.getTime() > last.getTime()) {
	    last = t;
	}
	for (let i = 0; i < data.length; i++) {
	    let v = data[i];
	    let p = v['path'];
	    if (!values.hasOwnProperty(p)) {
		values[p] = [];
	    }
	    let item = { 'year' : year,
			 'month' : month,
			 'views' : v['views'],
			 'users' : v['users'],
			 'duration' : v['duration']};
	    values[p].push(item);
	    count++;
	}
    }
    span = last.getMonth() - first.getMonth() + (12 * (last.getFullYear() - first.getFullYear())) + 1;
    console.log('Combined', count, 'data points over', span, 'months');
}

function parse() {
    values = null; // erase
    contents = {}; // reset
    const f = document.getElementById('files').files;    
    Array.from(f).forEach(file => {
	var label = file.name;
	var r = new FileReader();
	r.addEventListener('load', (event) => {
	    count = process(label, event.target.result);
	    console.log('Parsed', count, 'data points from', label);
	});
	r.readAsText(file, 'UTF-8');
    });
}

let sets = {} ;
let high = 0;


function time(m, y) {
    return new Date(y, m, 1);
}

function vticks(count) {
    ctx.fillStyle = 'black';
    ctx.textAlign = 'right';
    let y = 0
    let dy = high / (count - 1);
    for (let p = 0; p < count; p++) {
	let value = (p / count) * high;
	yp = scale(value, 0, high, margin, canvas.height - margin, true);
	ctx.fillText(value.toFixed(0), margin / 2, yp);
	y += dy;
    }
}

function advance(t) { // one month later
    return new Date(t.setMonth(t.getMonth() + 1));
}

function repr(t) {
    return nm[t.getMonth()] + (t.getFullYear() - 2000);
}

function hticks() {
    ctx.textAlign = 'center';	
    let y = canvas.height - margin / 2;
    let t = new Date(first.getTime());
    for (let p = 0; p < span; p++) {
	x = scale(t.getTime(), first.getTime(), last.getTime(), margin, canvas.width - margin, false);
	ctx.fillText(repr(t), x, y);
	t = advance(t);
    }	
}

function filter(a) {
    high = 0; // reset
    let plots = [];
    for (const set in sets) {
	let s = sets[set];
	let ts = {};
	let c = s['color'];
	let pp = s['paths'];
	for (let i = 0; i < pp.length; i++) {
	    let p = pp[i]; // the path in the set
	    let info = values[pp[i]];
	    for (let j = 0; j < info.length; j++) {
		let t = new Date(info[j]['year'], info[j]['month']);
		let v = info[j][a];
		if (!ts.hasOwnProperty(t)) {		
		    ts[t] = v;
		} else {
		    ts[t] += v;
		}
		if (ts[t] > high) {
		    high = ts[t];
		}
	    }	    
	}
	plots.push({ 'timeseries': ts, 'color': c });
    }
    return plots;
}

function scale(value, low, high, min, max, flip) {
    let v = (value - low) / (high - low); // normalize from source range
    if (flip) {
	v = 1 - v;
    }
    return v * (max - min) + min; // normalize to target range
}

function plot(ts, c) {
    ctx.strokeStyle = c;
    ctx.beginPath();
    let started = false;
    let t = new Date(first.getTime());
    for (let p = 0; p < span; p++) {    
	v = 0; // default
	if (ts.hasOwnProperty(t)) {
	    v = ts[t];
	}
	x = scale(t.getTime(), first.getTime(), last.getTime(), margin, canvas.width - margin, false);
	y = scale(v, 0, high, margin, canvas.height - margin, true);
	if (!started) {
	    ctx.moveTo(x, y); // start position
	    started = true;
	} else {
	    ctx.lineTo(x, y); // connect to next data
	}
	t = advance(t);
    }
    ctx.stroke(); 	
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let curves = filter(document.getElementById('attr').value);
    vticks(10);
    hticks(); // all month-years present
    for (let i = 0; i < curves.length; i++) {
	let color = curves[i]['color'];
	let ts = curves[i]['timeseries'];
	plot(ts, color);
    }
}

function add() {
    if (values == null) {
	combine();
    }
    let selection = [];
    let color = document.getElementById('tone').value;
    var p = document.getElementById("pattern").value;
    let legend = '<p style="color:' + color + '"><strong>' + p + '</strong><br>';
    for (const path in values) {
	if (path.includes(p)) {
	    selection.push(path);
	    legend += path + '<br>';
	}
    }
    if (selection.length > 0) {
	let selected = { 'paths': selection,
			 'color': color };
	sets[p] = selected;
	legend += '</p>';
	document.getElementById('matches').innerHTML += legend;
	draw();
    } else {
	alert('No matches found');
    }
}

function clear() {
    document.getElementById('matches').innerHTML = 'Clear requested. All selections have been cleared.';
    sets = {};
    draw();
}

