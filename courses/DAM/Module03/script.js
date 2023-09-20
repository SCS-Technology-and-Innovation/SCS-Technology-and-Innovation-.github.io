let pt = document.getElementById("dpat");
let dt = document.getElementById("ddoc");
let rt = document.getElementById("result");

function randint(low, high) {
    let span = (high + 1) - low;
    return Math.min(Math.floor(low + span * Math.random()), high);
}

function tabulate() {
    // update counter values
    npat = parseInt(document.getElementById('npat').value);
    ndoc = parseInt(document.getElementById('ndoc').value);
    nopt = parseInt(document.getElementById('nopt').value);
    let f = document.getElementById('fill').checked;
    let pp = parseInt(document.getElementById('prate').value) / 100;
    let dp = parseInt(document.getElementById('drate').value) / 100;    
    // patient table header
    let s = pt.getElementsByTagName('thead')[0];
    s.textContent = '';    
    let r = s.insertRow(0);
    let c = r.insertCell(0);
    c.innerHTML = 'P/M';
    for (let j = 1; j <= nopt; j++) {
	c = r.insertCell(j);
	c.innerHTML = 'M' + j;
    }
    // patient table body    
    s = pt.getElementsByTagName('tbody')[0];
    s.textContent = '';    
    for (let i = 0; i < npat; i++) {
	r = s.insertRow(i);
	c = r.insertCell(0);
	c.innerHTML = 'P' + (i + 1);
	for (let j = 1; j <= nopt; j++) {
	    c = r.insertCell(j);
	    var box = document.createElement('input');
	    box.id = 'P' + (i + 1) + 'M' + j;
	    box.type = 'checkbox';
	    if (fill && Math.random() < pp) {
		box.checked = true;
	    }
	    c.appendChild(box);
	}
    }
    let cmin = parseInt(document.getElementById('cmin').value);
    let cmax = parseInt(document.getElementById('cmax').value);
    if (cmax < cmin) {
	cmin = cmax;
	document.getElementById('cmin').value = cmax;
    }
    // doctor table header
    s = dt.getElementsByTagName('thead')[0];
    s.textContent = '';    
    r = s.insertRow(0);
    c = r.insertCell(0);
    c.innerHTML = 'D/M';
    for (let j = 1; j <= nopt; j++) {
	c = r.insertCell(j);
	c.innerHTML = 'M' + j;
    }
    c = r.insertCell(nopt + 1);
    c.innerHTML = 'Cap';
    // doctor table body    
    s = dt.getElementsByTagName('tbody')[0];
    s.textContent = '';    
    for (let i = 0; i < ndoc; i++) {
	r = s.insertRow(i);
	c = r.insertCell(0);
	let dl = 'D' + (i + 1);
	c.innerHTML = dl;
	for (let j = 1; j <= nopt; j++) {
	    c = r.insertCell(j);
	    var box = document.createElement('input');
	    box.id = dl + 'M' + j;
	    box.type = 'checkbox';
	    if (fill && Math.random() < dp) {
		box.checked = true;
	    }
	    c.appendChild(box);
	}
	c = r.insertCell(nopt + 1);
	var k = document.createElement('input');
	k.id = dl;
	if (fill) {
	    k.value = randint(cmin, cmax);
	}
	c.appendChild(k);
	
    }
}

let pb = document.getElementById('prep');
let db = document.getElementById('vis');	
let mb = document.getElementById('match');	

let vl = null;
let il = null;

function vertexlabels() {
    let v = 0;
    vl = {};
    vl['s'] = '' + v++;
    for (let i = 0; i < npat; i++) {
	let pl = 'P' + (i + 1);	
	vl[pl] = '' + v++;
    }
    for (let j = 0; j < nopt; j++) {
	let ml = 'M' + (j + 1);	
	vl[ml] = '' + v++;
    }
    for (let i = 0; i < ndoc; i++) {
	let dl = 'D' + (i + 1);
	vl[dl] = '' + v++;
    }
    vl['t'] = '' + v++;

    il = {};
    for (let l in vl) { // inverse lookup
	let value = vl[l];
	il[value] = l;
    }
}

var canvas = document.getElementById('network');
var ctx = canvas.getContext('2d');
ctx.textAlign = 'center';
const M = 30; // margin
const LW = 2; // min linewidth 

const cpat = '#669900'; // patient
const copt = '#999999'; // diagnostic 
const cdoc = '#0000ff'; // doctor 
const ce = '#dddddd'; // edge (req)
const cf = '#ff9900'; // edge (used but not maxed)
const cm = '#ff0000'; // edge (maxed out)
const cs = '#999900'; // source node
const ct = '#009999'; // sink node

let pos = {};
let w = 0;
let h = 0;

function nodes() {
    w = 0.7 * window.innerWidth;
    h = Math.round(3 * w / 4);
    let dx = Math.floor((w - 2 * M) / 4);
    // position the source node
    pos['s'] = {};
    pos['s'].x = dx / 4;
    pos['s'].y = h / 2;
    pos['s'].size = dx / 4;
    pos['s'].offset = dx / 7;
    pos['s'].font = dx / 7;
    // position the target node
    pos['t'] = {};
    pos['t'].x = w - (dx / 2);
    pos['t'].y = h / 2;
    pos['t'].size = dx / 4;    
    pos['t'].offset = dx / 7;
    pos['t'].font = dx / 7;
    // place patients
    let dy = Math.floor((h - 2 * M) / npat);
    let rad = Math.floor(dy / 4);
    let fs = Math.floor(2 * rad / 3);
    let offset = Math.floor(fs / 2);
    let x = dx;
    let y = M + rad;
    for (let i = 0; i < npat; i++) {
	let label = 'P' + (i + 1);
	pos[label] = {};
	pos[label].x = x;
	pos[label].y = y;
	pos[label].font = fs;		
	pos[label].size = rad;
	pos[label].offset = offset;
	y += dy;
    }
    // place diagnostics    
    dy = Math.floor((h - 2 * M) / nopt);
    let dim = Math.floor(dy / 3);
    let half = Math.floor(dim / 2);
    fs = Math.floor(2 * dim / 5);
    x += dx 
    y = M + rad;
    for (let i = 0; i < nopt; i++) {
	let label = 'M' + (i + 1);
	pos[label] = {};
	pos[label].x = x + half;
	pos[label].y = y + half;
	pos[label].font = fs;	
	pos[label].size = dim;
	pos[label].offset = fs;	
	y += dy;
    }
    // place doctors
    dy = Math.floor((h - 2 * M) / ndoc);
    rad = Math.floor(dy / 4);
    fs = Math.floor(2 * rad / 3);
    offset = Math.floor(fs / 2);
    x += dx;
    y = M + rad;
    for (let i = 0; i < ndoc; i++) {
	let label = 'D' + (i + 1);
	pos[label] = {};
	pos[label].x = x;
	pos[label].y = y;
	pos[label].font = fs;	
	pos[label].size = rad;
	pos[label].offset = offset;
	y += dy;
    }
}

let network = null; // edge capacities
let flow = null;
reset();

// assign zero flow in both directions
function reset() {
    flow = {};
    for (let edge in network) {
	let vertices = edge.split(',');
	let from = vertices[0];
	let to = vertices[1];
	let redge = to + ',' + from;
	flow[edge] = 0;
	flow[redge] = network[edge];	
    }
}

function line(start, end, sl, el, w) {
    ctx.lineWidth = w * LW;    
    let edge = sl + ',' + el;
    let amount = flow[edge];
    let limit = network[edge];
    if (amount > 0) {
	if (amount == limit) {
	    ctx.fillStyle = cm;
	    ctx.strokeStyle = cm;
	} else {
	    ctx.fillStyle = cf;
	    ctx.strokeStyle = cf;
	}
    } else {
	ctx.fillStyle = ce;
	ctx.strokeStyle = ce;
    }
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke(); 	
}

function edges() {
    network = {};
    ctx.lineWidth = LW;
    let sp = pos['s'];
    for (let i = 0; i < npat; i++) {
	let pl = 'P' + (i + 1);
	let ip = pos[pl]
	let count = 0;
	for (let j = 0; j < nopt; j++) {
	    let ml = 'M' + (j + 1);
	    let jp = pos[ml];
	    let req = document.getElementById('P' + (i + 1) + 'M' + (j + 1));
	    if (req.checked) { // edge present
		let el = vl[pl] + ',' + vl[ml];
		network[el] = 1;
		line(ip, jp, vl[pl], vl[ml], 1);
		count++;
	    }
	}
	network[vl['s'] + ',' + vl[pl]] = count; // source to pl	
	line(sp, ip, vl['s'], vl[pl], count);
    }
    let tp = pos['t'];
    for (let i = 0; i < ndoc; i++) {
	let dl = 'D' + (i + 1);	
	let ip = pos[dl];
	let cap = document.getElementById(dl);
	let ic =  parseInt(cap.value);
	let el = vl[dl] + ',' + vl['t'];
	network[el] = ic; // doctor to sink
	line(ip, tp, vl[dl], vl['t'], ic);
	for (let j = 0; j < nopt; j++) {
	    let ml = 'M' + (j + 1); // already in vl
	    let jp = pos[ml];
	    let req = document.getElementById('D' + (i + 1) + 'M' + (j + 1));
	    if (req.checked) { // edge present
		el = vl[ml] + ',' + vl[dl];
		network[el] = ic;
		line(ip, jp, vl[ml], vl[dl], ic);
	    }
	}
    }
}

function show() {
    // draw source
    ctx.fillStyle = cs;
    ctx.strokeStyle = cs;
    data = pos['s'];
    let half = data.size / 2;
    ctx.beginPath();
    ctx.rect(data.x - half, data.y - half, data.size, data.size);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold ' + data.font + 'px Courier';
    ctx.fillText('s', data.x - half + data.offset / 2, data.y - half + data.offset);
    // draw sink
    ctx.fillStyle = ct;
    ctx.strokeStyle = ct;
    data = pos['t'];
    ctx.beginPath();
    ctx.rect(data.x - half, data.y - half, data.size, data.size);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold ' + data.font + 'px Courier';
    ctx.fillText('t', data.x - half + data.offset / 2, data.y - half + data.offset);    
    // draw patients
    for (let i = 0; i < npat; i++) {
	let label = 'P' + (i + 1);
	let data = pos[label];
	ctx.fillStyle = cpat;
	ctx.strokeStyle = cpat;
	ctx.beginPath();
	ctx.arc(data.x, data.y, data.size, 0, 2 * Math.PI); 
	ctx.closePath();
	ctx.fill();
	ctx.stroke();
	ctx.fillStyle = '#ffffff'
	ctx.font = 'bold ' + data.font + 'px Courier';
	ctx.fillText(label, data.x - data.offset, data.y);
    }
    // draw diagnostics
    for (let i = 0; i < nopt; i++) {
	let label = 'M' + (i + 1);
	let data = pos[label];	
	ctx.fillStyle = copt;
	ctx.strokeStyle = copt;    
	ctx.beginPath();
	let half = data.size / 2;
	ctx.rect(data.x - half, data.y - half, data.size, data.size);
	ctx.closePath();
	ctx.fill();
	ctx.stroke();
	ctx.fillStyle = '#ffffff'
	ctx.font = 'bold ' + data.font + 'px Courier';
	ctx.fillText(label, data.x - data.offset, data.y);
    }
    // draw doctors
    for (let i = 0; i < ndoc; i++) {
	let label = 'D' + (i + 1);
	let data = pos[label];	
	ctx.fillStyle = cdoc;
	ctx.strokeStyle = cdoc;
	ctx.beginPath();
	ctx.arc(data.x, data.y, data.size, 0, 2 * Math.PI); 
	ctx.closePath();
	ctx.fill();
	ctx.stroke();
	ctx.fillStyle = '#ffffff'
	ctx.font = 'bold ' + data.font + 'px Courier';	    
	ctx.fillText(label, data.x - data.offset, data.y);
    }
}

function visualize() {
    nodes();
    canvas.width = w;
    canvas.height = h;
    ctx.clearRect(0, 0, w, h);
    edges();
    show();
}

const verbose = false;

function augpath() {
    let queue = [ vl['s'] ]; // start at the source
    let used = [];
    let path = [];
    while (queue.length > 0) {
        let current = queue.shift(); // pop the first
        used.push(current);
	if (verbose) {
	    console.log('Advancing at', current);
	}
        for (let edge in network) {
	    let vertices = edge.split(',');
	    let from = vertices[0];
	    let to = vertices[1];
            if (from == current && queue.indexOf(to) == -1 && used.indexOf(to) == -1) {
		if (verbose) {
		    console.log('Contemplating edge (' + from + ',' + to + ')');
		}
                let available = network[edge] - flow[edge];
                if (available > 0) {
		    if (verbose) {
			console.log(edge, 'has',  available, ' units left');
		    }
                    queue.push(to);
		    let step = {};
		    step.from = from;
		    step.to = to;
		    step.quantity = available;
                    path.push(step); 
		}
	    }
	}
    }
    if (verbose) {
	console.log('Augmenting path of', path.length, 'edges');
    }
    if (used.indexOf(vl['t']) >= 0) {
	if (verbose) {
	    console.log('Contains the sink');
	}
	return path;
    } else {
	return null;
    }
}

function minimum(path) {
    let smallest = path[0].quantity;
    for (let i = 1; i < path.length; i++) {
	let v = path[i].quantity;
	if (v < smallest) {
	    smallest = v;
	}
    }
    return smallest;
}

function match() {
    while (true) {
        let path = augpath();
	if (path == null) {
	    if (verbose) {
		console.log('No augmenting path available');
	    }
            break;
	}
        let incr = minimum(path);
	// console.log('Bottleneck is', incr);
	// backtrack from t
        let curr = vl['t'];
        while (true) { // inefficient, yes, this is javascript :(
	    if (verbose) {
		console.log('Ford-Fulkerson at',  curr);
	    }
	    let found = false;
	    for (let i = 0; i < path.length; i++) {
		let step = path[i];
		if (step.to == curr) {
		    found = true;
		    let prev = step.from;		    
		    let e = prev + ',' + curr;
		    let edge = prev + ',' + curr;
		    let redge = curr + ',' + prev;		    
		    flow[edge] += incr;
		    flow[redge] -= incr;		    
		    curr = prev; // keep going backwards
		}
	    }
	    if (!found) {
		break;
	    }
	}
    }
}

let assignment = {};

function backtrack() {
    assignment = {};
    let consumed = {};
    let check = {};
    for (let edge in network) {
	let vertices = edge.split(',');
	let from = vertices[0];
	let to = vertices[1];
	let redge = to + ',' + from;
	consumed[edge] = 0;
	consumed[redge] = 0;
    }

    let s = [ vl['s'] ];
    let t = vl['t'];

    // adjacency tables
    check = {};
    let p = [];
    for (let i = 0; i < npat; i++) {
	let pl = 'P' + (i + 1);
	let pv = vl[pl];
	p.push(pv);
	check[pv] = s;
    }
    let m = [];
    for (let i = 0; i < nopt; i++) {
	let ml = 'M' + (i + 1);
	let mv = vl[ml];
	m.push(mv);
	check[mv] = p;
    }
    let d = [];
    let left = 0;
    for (let i = 0; i < ndoc; i++) {
	let dl = 'D' + (i + 1);
	let dv = vl[dl];
	d.push(dv);
	check[dv] = m;
	left += flow[dv + ',' + t];
	// console.log(dv, t, left);
    }
    check[t] = d;

    while (left > 0) {
	// console.log('Assigning', left, 'doctor-patient pairs');
	let curr = vl['t'];
	let pat = null;
	let method = null;
	let doc = null;
	let done = false;
	while (!done) {
	    let moved = false;
	    // console.log('Backtracking at', curr);
	    for (let i = 0; i < check[curr].length; i++) {
		let prev = check[curr][i];
		let edge = prev + ',' + curr;
		let f = flow[edge];
		let c = consumed[edge];
		let ito = il[curr];
		let ifrom = il[prev];		    
		// console.log('Examining', edge, ifrom, ito, 'with flow of', f, 'of which', c, 'is taken');		
		if (f > c) {
		    consumed[edge]++;
		    // console.log('Proceeding along', edge, ito, ifrom);
		    if (ito.includes('D')) { // doctor
			if (verbose) {
			    console.log('Connecting a doctor', ito, '...');
			}
			doc = ito;
		    } else if (ito.includes('M')) { // method
			if (verbose) {
			    console.log('...for method', ito, '...');
			}			
			method = ito;
		    } else if (ito.includes('P')) { // patient
			if (verbose) {
			    console.log('... to patient', ito);
			}
			pat = ito;
			let pair = pat + ',' + doc;
			if (assignment.hasOwnProperty(pair)) {
			    assignment[pair]++;
			} else {
			    assignment[pair] = 1;
			}
			assignment[pat + ',' + method] = true;
			left--; // consumed one
			done = true;
			break; // at the source now
		    }
		    if (done) {
			console.log('Arrived at the source');
			break;
		    }
		    curr = prev;
		    moved = true;
		}
	    }
	    if (done) {
		break;
	    } else if (!moved) {
		console.log('Nowhere to go. Giving up.');
		return;
	    }
	}
    }
}

function report() {
    reset();
    console.log('Computing the maximum flow');
    match();
    console.log('Visualizating the flow');        
    visualize();
    console.log('Recovering the assignment');    
    backtrack();
    // result table header
    let s = rt.getElementsByTagName('thead')[0];
    s.textContent = '';
    let r = s.insertRow(0);
    let c = r.insertCell(0);
    c.innerHTML = 'P/D';
    for (let j = 1; j <= ndoc; j++) {
	c = r.insertCell(j);
	c.innerHTML = 'D' + j;
    }
    c = r.insertCell(ndoc + 1);
    c.innerHTML = 'Coverage';
    c = r.insertCell(ndoc + 2);
    c.innerHTML = 'Missing';    
    
    // result table body    
    s = rt.getElementsByTagName('tbody')[0];
    s.textContent = '';    
    for (let i = 0; i < npat; i++) {
	r = s.insertRow(i);
	c = r.insertCell(0);
	let pl = 'P' + (i + 1);	
	c.innerHTML = pl;
	for (let j = 1; j <= ndoc; j++) {
	    let dl = 'D' + j;		    	    
	    let el = pl + ',' + dl;
	    c = r.insertCell(j);
	    if (assignment.hasOwnProperty(el)) {
		let count = assignment[el];
		if (count > 1) {
		    c.innerHTML = count;
		} else {
		    c.innerHTML = '&#x2713;';
		}
	    } else {
		c.innerHTML = '&ndash;';
	    }
	}
	let received = 0;
	let requested = 0;
	let missing = '';
	for (let j = 1; j <= nopt; j++) {
	    let ml = 'M' + j;
	    let wants = false;
	    if (network.hasOwnProperty(vl[pl] + ',' + vl[ml])) {
		requested++;
		wants = true;
	    }	    
	    if (assignment.hasOwnProperty(pl + ',' + ml)) {
		if (verbose) {
		    console.log(pl, ml, assignment[pl + ',' + ml]);
		}
		received++;
	    } else if (wants) {
		missing += ml + ' ';
	    }
	}
	c = r.insertCell(ndoc + 1);
	if (requested > 0) {
	    if (verbose) {
		console.log(pl, 'received', received, 'of the', requested, 'methods');
	    }
	    c.innerHTML = (100 * received / requested).toFixed(0) + '%';
	} else {
	    c.innerHTML = 'nothing was requested';
	}
	c = r.insertCell(ndoc + 2);
	c.innerHTML = missing;
    }
}

function prep() {
    network = {};
    tabulate(); // prep the tables
    vertexlabels();
    visualize();
}

function everything() {
    prep();
    report();
}

everything();


