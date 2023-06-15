document.addEventListener("keydown", keyDownTextField, false);

let previous = null;
let timestamp = null;
let data = null;
let matches = null;

function dump() {
    matches = [];
}

dump();

function status() {
    document.getElementById("method").disabled = !training();
    document.getElementById("ab").disabled = training();    
}

status();


function reset() {
    document.getElementById("veredict").innerHTML = '';
    document.getElementById("input").value = '';
    console.log('Cleared');
}

function erase() {
    data = {};
    var methods = document.getElementById('method');
    for (let m = 0; m < methods.length; m++) {
	let method = methods[m].value;
	data[method] = {}; // empty object
    }
    document.getElementById("stage").value = 'train';
    reset();
    status();
}

erase();

function currentStage() {
    return document.getElementById("stage").value;
}

function currentMethod() {
    return document.getElementById("method").value;
}

function training() {
    return (currentStage() == "train");
}

function analyze() {
    let counts = {};
    let n = matches.length;
    let highscore = 0;
    for (let m = 0; m < n; m++) {
	let d = matches[m];
	if (!counts.hasOwnProperty(d)) {
	    counts[d] = 0;
	}
	counts[d]++;
	if (counts[d] > highscore) {
	    highscore = counts[d];
	}
    }
    var result = '[ ';
    var methods = document.getElementById('method');
    for (let m = 0; m < methods.length; m++) {
	let method = methods[m].value;
	if (counts.hasOwnProperty(method) && counts[method] == highscore) {
	    result += method + ' ';
	}
    }
    result += ']';
    document.getElementById("veredict").innerHTML = 'Based on ' + n + ' keystrokes, the typing method is ' + result;
}

// sume of squared differences
function ssqd(stored, observed) {
    let total = 0;
    let n = stored.length;
    if (n == 0) {
	return Infinity;
    }
    for (let s = 0; s < n; s++) {
	let d = stored[s] - observed;
	total += (d * d);
    }
    return total;
}

function keyDownTextField(e) {
    let current = e.keyCode;
    if (previous != null) {
	let diff = Date.now() - timestamp;
	if (training()) {
	    let m = currentMethod();
	    if (!(data[m].hasOwnProperty(previous))) {
		data[m][previous] = {};
	    }
	    if (!(data[m][previous].hasOwnProperty(current))) {
		data[m][previous][current] = [];
	    }
	    data[m][previous][current].push(diff);
	} else { // comparing 
	    var methods = document.getElementById('method');
	    let smallest = null;
	    let match = null;
	    for (let m = 0; m < methods.length; m++) {
		let method = methods[m].value;
		let err = 0;
		let present = false;
		let samples = data[method];
		if (samples.hasOwnProperty(previous)) {
		    let timings = samples[previous];
		    if (timings.hasOwnProperty(current)) {
			err += ssqd(timings[current], diff);
			present = true;
		    }
		}
		if (present && (smallest == null || err < smallest)) {
		    smallest = err;
		    match = method;
		}
	    }
	    if (match != null) {
		matches.push(match);
	    }
	}
    }
    previous = current;
    timestamp = Date.now();
}
