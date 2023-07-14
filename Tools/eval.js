var AXISLEN = 320;
var TEXTSEP = 50;
var COLORS = {"0": "#7b241c" , "25": "#a04000", "50": "#f1c40f", "75": "#1e8449", "100": "#2471a3", "hl": "#ff00ff"};

var terms = []
var courses = [];
var instructors = [];
var questions = [];
var scores = {};

const cc = 9; // term code instructor question 1 2 3 4 5 
const maxscore = 5;
const minscore = 1;

const file = document.getElementById("data");
const ilist = document.getElementById("instructor");
const tlist = document.getElementById("term");
const clist = document.getElementById("course");
const qlist = document.getElementById("questions");

function data(t, c, i, q, p, k) {
    for (let j = 0; j < k; j++) {
	let d = {};
	d.term = t;
	d.course = c;
	d.instructor = i;    
	d.score = p; 
	scores[q].push(d);
    }
}

function selected(value, listing) {
    let chosen =  Array.from(listing.selectedOptions);
    if (chosen.length == 0) { // selecting nothing means selecting everything
	return true;
    }
    for (let i = 0; i < chosen.length; i++) {
	let op = chosen[i];
	if (op.value == value) {
	    return true;
	}
    }
    return false;
}

function active(d) {
    if (!selected(d.term, tlist)) {
	return false;
    }
    if (!selected(d.instructor, ilist)) {
	return false;
    }
    if (!selected(d.term, tlist)) {
	return false;
    }
    return true;
}
    

file.onchange = e => {
    var r = new FileReader();
    r.readAsText(file.files[0] ,'UTF-8');
    r.onload = ev => {
	const rows = ev.target.result.split('\n');
	for (const row of rows) {
	    let col = row.split(';');
	    if (col.length != 9) {
		continue;
	    }
	    let t = col[0]; // term
	    if (!terms.includes(t)) {
		terms.push(t);
	    }
	    let c = col[1]; // course code
	    if (!courses.includes(c)) {
		courses.push(c);
	    }
	    let i = col[2];
	    if (!instructors.includes(i)) {
		instructors.push(i);
	    }
	    let q = col[3];
	    if (!questions.includes(q)) {
		scores[q] = []; // prepare data storage
		questions.push(q);
		const li = document.createElement('li');
		const t = document.createTextNode(q);
		li.appendChild(t);
		qlist.appendChild(li);
	    }
	    data(t, c, i, q, 1, parseInt(col[4]));
	    data(t, c, i, q, 2, parseInt(col[5]));
	    data(t, c, i, q, 3, parseInt(col[6]));
	    data(t, c, i, q, 4, parseInt(col[7]));
	    data(t, c, i, q, 5, parseInt(col[8]));
	}
	for (let i = 0; i < terms.length; i++) {
	    let o = document.createElement('option');
	    o.value = terms[i];
	    o.innerHTML = terms[i];
	    tlist.appendChild(o);
	}
	tlist.size = terms.length;
	courses.sort();
	for (let i = 0; i < courses.length; i++) {
	    let o = document.createElement('option');
	    o.value = courses[i];
	    o.innerHTML = courses[i];
	    clist.appendChild(o);
	}
	clist.size = courses.length;
	instructors.sort();
	for (let i = 0; i < instructors.length; i++) {
	    let o = document.createElement('option');
	    o.value = instructors[i];
	    o.innerHTML = instructors[i];
	    ilist.appendChild(o);
	}
	ilist.size = instructors.length;	
    }
}

var quartiles = {};
function prep() { 
    quartiles = {}; // prepare according to filters
    for (const q of questions) {
	let n = scores[q].length;
	var values = [];	
	for (let i = 0; i < n; i++) {
	    let d = scores[q][i];
	    if (active(d)) {
		values.push(d.score);
	    }
	}
	values.sort();
	console.log(values);
	var k = values.length;
	quartiles[q] = {"0": values[0],
			"25": values[Math.floor(k / 4)],
			"50": values[Math.floor(k / 2)],
			"75": values[Math.floor(3 * k / 4)],
			"100": values[k - 1]};
    }
    redraw();
}

let hl = null; 
function redraw() {
    var c = document.getElementById("draw");
    var ctx = c.getContext("2d");
    c.width = 800;
    c.height = 800;
    var MIDPT = 400;
    ctx.clearRect(0, 0, c.width, c.height);
    var n = questions.length; // number of regular questions    
    var increment = 2 * Math.PI / n;
    for (var qua = 100; qua >= 0; qua -= 25) { // quartiles
	ctx.fillStyle = COLORS[qua];
	ctx.beginPath();
	for (var i = 0; i < n; i++) {		    
	    var angle = i * increment;
	    var value = quartiles[questions[i]][qua];
	    var dist = (value / maxscore) * AXISLEN;
	    var x = MIDPT + Math.cos(angle) * dist;
	    var y = MIDPT + Math.sin(angle) * dist;
	    if (i == 0) { 
		ctx.moveTo(x, y);
	    } else { 
		ctx.lineTo(x, y);
	    }
	}
	ctx.closePath();
	ctx.fill();
    }
    for (var s = 1; s <= 5; s++) { // score levels
	ctx.beginPath();
	ctx.strokeStyle = '#000000';	
	var x = MIDPT;
	var y = MIDPT;
	var dist = (s / maxscore) * AXISLEN;	    
	ctx.arc(x, y, dist, 0, 2 * Math.PI);
	ctx.closePath();
	ctx.stroke();
    }
    ctx.font="15px Verdana";
    for (var i = 0; i < n; i++) { // axis on top
	var angle = i * increment;
	ctx.beginPath();
	ctx.moveTo(MIDPT, MIDPT);
	var x = MIDPT + Math.cos(angle) * AXISLEN;
	var y = MIDPT + Math.sin(angle) * AXISLEN;
	ctx.strokeStyle = '#000000';
	ctx.lineWidth = 3;
	ctx.lineTo(x, y);
	ctx.stroke();
	var tx = MIDPT + Math.cos(angle) * (AXISLEN + TEXTSEP);
	var ty = MIDPT + Math.sin(angle) * (AXISLEN + TEXTSEP);
	ctx.fillStyle = "#000000";
	ctx.fillText("Q" + (i + 1), tx, ty);		
    }
    
    if (hl === null) {
	return; // nothing more to draw
    }
    /* PENDING ctx.strokeStyle = COLORS["hl"];
    ctx.lineWidth = 5;
    ctx.beginPath();
    var fields = results[selected];
    for (var i = 0; i < n; i++) {
	var angle = i * increment;
	var value = 0;
	if (!(fields[i] === "NA")) {
	    value = parseFloat(fields[i]);
	}
	var dist = (value / maxscore) * AXISLEN;
	var x = MIDPT + Math.cos(angle) * dist;
	var y = MIDPT + Math.sin(angle) * dist;
	if (i == 0) { 
	    ctx.moveTo(x, y);
	} else {
	    ctx.lineTo(x, y);	    
	} 
    }
    ctx.closePath();
    ctx.stroke();
    */
}

function highlight() {
    selected = document.getElementById("instructors").options[document.getElementById("instructors").selectedIndex].value;
    redraw();
}

