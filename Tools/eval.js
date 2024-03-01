var AXISLEN = 320;
var TEXTSEP = 50;
var COLORS = {"0": "#e0e1dd" , "25": "#778da9", "50": "#415a77", "75": "#a04668", "100": "#eba6a9"};

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

function active(d) {
    if (!selected(d.term, tchosen)) {
	return false;
    }
    if (!selected(d.instructor, ichosen)) {
	return false;
    }
    if (!selected(d.course, cchosen)) {
	return false;
    }
    return true;
}


function addQuestion(d, k, q) {
    let cb = document.createElement('input');
    let l = document.createElement('label');    
    cb.type = 'checkbox';
    cb.id = 'q' + k;
    cb.name = cb.id;
    l.htmlFor = cb.id;
    cb.checked = true;
    l.appendChild(document.createTextNode(q));
    d.appendChild(cb);
    d.appendChild(l);
    console.log(cb.id);
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
		let li = document.createElement('li');
		addQuestion(li, questions.length, q);		
		qlist.appendChild(li);		
		questions.push(q);
	    }
	    data(t, c, i, q, 1, parseInt(col[4]));
	    data(t, c, i, q, 2, parseInt(col[5]));
	    data(t, c, i, q, 3, parseInt(col[6]));
	    data(t, c, i, q, 4, parseInt(col[7]));
	    data(t, c, i, q, 5, parseInt(col[8]));
	}
	terms.sort();	
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

let cchosen = [];
let tchosen = [];
let ichosen = [];


function selected(value, chosen) {
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

function filter() {
    let choices = '';
    tchosen =  Array.from(tlist.selectedOptions);    
    if (tchosen.length == 0) {
	choices += 'Showing all terms.<br>';
    } else {
	let plural = 's';
	if (tchosen.length == 1) {
	    plural = '';
	}
	choices += 'Showing ' + tchosen.length + ' term' + plural + '.<br>';
    }
    cchosen =  Array.from(clist.selectedOptions);
    if (cchosen.length == 0) {
	choices += 'Showing all courses.<br>';
    } else {
	let plural = 's';
	if (cchosen.length == 1) {
	    plural = '';
	}	
	choices += 'Showing ' + cchosen.length + ' course' + plural + '.<br>';
    }    
    ichosen =  Array.from(ilist.selectedOptions);
    if (ichosen.length == 0) {
	choices += 'Showing all instructors.<br>';
    } else {
	let plural = 's';
	if (ichosen.length == 1) {
	    plural = '';
	}	
	choices += 'Showing ' + ichosen.length + ' instructor' + plural + '.<br>';
    }    

    var p = document.getElementById("shown");
    p.innerHTML = choices;
}

var quartiles = {};
function prep() {
    filter();
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
	var k = values.length;
	quartiles[q] = {"0": values[0],
			"25": values[Math.floor(k / 4)],
			"50": values[Math.floor(k / 2)],
			"75": values[Math.floor(3 * k / 4)],
			"100": values[k - 1]};
    }
    redraw();
}

function countActiveQuestions() {
    let k = 0;
    for (var i = 0; i < questions.length; i++) {
	k += document.getElementById('q' + i).checked;
    }
    var p = document.getElementById("drawn");
    p.innerHTML = 'Visualizing ' + k +  ' questions.';
    return k;
}

function redraw() {
    filter();
    var c = document.getElementById("draw");
    var ctx = c.getContext("2d");
    c.width = 800;
    c.height = 800;
    var MIDPT = 400;
    ctx.clearRect(0, 0, c.width, c.height);
    var n = countActiveQuestions();
    var increment = 2 * Math.PI / n;
    for (var qua = 100; qua >= 0; qua -= 25) { // quartiles
	ctx.fillStyle = COLORS[qua];
	ctx.beginPath();
	let angle = 0;
	for (var i = 0; i < questions.length; i++) {
	    if (document.getElementById('q' + i).checked) {
		angle += increment;
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
    var angle = 0;
    for (var i = 0; i < questions.length; i++) {
	if (document.getElementById('q' + i).checked) {
	    angle += increment;
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
    }
}

