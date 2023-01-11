// data source
let loc = "https://SCS-Technology-and-Innovation.github.io/casestudy/demo/dataset.csv";

// default rng setup
let a = 7;
let c = 5;
let m = 1097;
let s = 10; // default for debugging
let n = 10; // note: may be smaller if the LCG is not set up right

const url = window.location.href;
const params = url.split('?')[1];
console.log(params);
let values = new URLSearchParams(params);
if (values.has('s')) {
    s = values.get('s');
}
if (values.has('n')) {
    n = values.get('n');
}
if (values.has('a')) {
    a = values.get('a');
}
if (values.has('c')) {
    c = values.get('c');
}
if (values.has('m')) {
    m = values.get('m');
}


let x = s;
let selection = [];

for (let i = 0; i < n; i++) {
    x = (a * x + c) % m;
    selection.push(x + 1); // line 0 is header
}
console.log(selection);

let output = 'x,y'; // header row
var data = new XMLHttpRequest();
data.open('GET', loc, true);
data.send(null);
data.onreadystatechange = function() {
    if (data.readyState === 4) { 
        if (data.status === 200) { 
            const lines = data.responseText.split('\n');
	    let i = 0;
	    for (const line of lines) {
		// first line is header line
		if (i > 0) {
		    if (selection.includes(i)) {
			console.log('using ' + i + ' ' + line); 			
			output = output + '\n' +  line; // include this data point
		    }
		}
		i++; // increment the counter
	    }
	    var link = document.createElement('a');
	    link.style.display = 'none'; // nightblade mode (hiding)	    
	    link.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(output));	  
	    link.setAttribute('download', 'casestudy' + s + '.csv'); // output file name needs to contain the seed to avoid cache problems
	    document.body.appendChild(link);
	    link.click(); // download
	} 
    }
}
