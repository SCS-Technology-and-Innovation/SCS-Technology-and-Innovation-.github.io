var values = {};
var contents = {};

const prefix = '/continuingstudies/'
let pl = prefix.length;
const input = document.getElementById('data');

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
ctx.textBaseline = 'middle';
ctx.font = '9 px Courier';
const margin = 100;

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


let first = 3000;
let last = 0;

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
	    if (!contents.hasOwnProperty(path)) {
		contents[path] = [];
	    }
	    let views = parseInt(col[1]);
	    let users = parseInt(col[2]);
	    let duration = parseFloat(col[3]);
	    let item = { 'views' : views,
			 'users' : users,
			 'duration' : duration };
	    contents[label].push(item);
	    count++;
	}
    }
    return count;
}

function combine() {
    values = {}; // reset
    for (const label in contents) {
	let data = contents[label];
	var month = label.substring(0, 3);
	var year = parseInt('20' + label.substring(3, 5));
	if (year < first) {
	    first = year;
	}
	if (year > last) {
	    last = year;
	}
	let count = 0;
	for (const path in data) {
	    values[path] = { 'year' : year,
			     'month' : month,
			     'views' : data['views'],
			     'users' : data['users'],
			     'duration' : data['duration']};
	}
    }
}

function parse() {
    console.log('Reading files...');
    contents = {}; // reset
    const f = document.getElementById('files').files;    
    Array.from(f).forEach(file => {
	var label = file.name;
	console.log('Processing', label);
	var r = new FileReader();
	r.addEventListener('load', (event) => {
	    count = process(label, event.target.result);
	    console.log('Parsed', count, 'data points from', label);
	});
	r.readAsText(file, 'UTF-8');
    });
    combine();
}

let sets = {} ;
let high = 0;

function time(year, month) {
    return 12 * (year - first) + mn[month]; 
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

function hticks(st, et, y, m) {
    ctx.textAlign = 'left';	
    let yp = canvas.height - margin / 2;
    let xp = margin;
    let dx = canvas.width / (et - st + 1);
    for (let p = st; p <= et; p++) {
	let value = nm[m] + ' ' + (y - 2000); // just two digits
	ctx.fillText(value, xp, yp);
	xp += dx;
	if (m == 11) {
	    y += 1; // next year
	}
	m = (m + 1) % 12; // next month
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
		let t = time(info[j]['year'], info[j]['month']);
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
    let v = (value - low) / high;
    if (flip) {
	v = 1 - v;
    }
    return v * (max - min) + min;
}

function plot(ts, c, xs, xe, ys, ye) {
    ctx.strokeStyle = c;
    ctx.beginPath();
    let enable = false;
    for (let x = xs; x <= xe; x++) {
	y = 0;
	if (ts.hasOwnProperty(x)) {
	    y = ts[x];
	}
	px = scale(x, xs, xe, margin, canvas.width - margin, false);
	py = scale(y, 0, high, margin, canvas.height - margin, true);
	if (x == xs) {
	    ctx.moveTo(px, py); // start position
	} else {
	    ctx.lineTo(px, py); // connect to next data
	}
    }
    ctx.stroke(); 	
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let st = time(first, 'jan');
    let et = time(last, 'dec');
    let curves = filter(document.getElementById('attr').value);
    vticks(10);
    hticks(st, et, first, 0)
    for (let i = 0; i < curves.length; i++) {
	let color = curves[i]['color'];
	let ts = curves[i]['timeseries'];
	plot(ts, color, st, et, 0, high);
    }
}

function add() {
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
    } else {
	alert('No matches found');
    }
}

function clear() {
    document.getElementById('matches').innerHTML = '';
    sets = {};
    draw();
}

