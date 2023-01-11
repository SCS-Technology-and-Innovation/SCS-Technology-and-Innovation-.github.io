// data source
let loc = "https://SCS-Technology-and-Innovation.github.io/casestudy/demo/dataset.csv";

// default rng setup
const a = 7;
const c = 5;
const m = 1097;
let s = 8;
let n = 12; 

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

let x = s;
let selection = [];

for (let i = 0; i < n; i++) {
    x = (a * x + c) % m;
    selection.push(x);
}

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
		if (selection.includes(i)) {
		    output = output + '\n' +  line; // include this data point
		}
		i++; // increment the counter
	    }
	    var link = document.createElement('a');
	    link.style.display = 'none'; // nightblade mode (hiding)	    
	    link.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(output));
	    link.setAttribute('download', 'casestudy.csv'); // output file name
	    document.body.appendChild(link);
	    link.click(); // download
	} 
    }
}
