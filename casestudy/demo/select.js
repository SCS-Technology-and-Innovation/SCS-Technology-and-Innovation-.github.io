// data source
let loc = "https://SCS-Technology-and-Innovation.github.io/casestudy/demo/dataset.csv";

// rng setup
const a = 7;
const c = 5;
const m = 1097;
const s = 8;
const n = 100; 

let x = s;
let selection = [];

for (let i = 0; i < n; i++) {
    x = (a * x + c) % m;
    selection.push(x);
}

// parse and filter
var data = new XMLHttpRequest();
data.open("GET", loc, true);
data.onreadystatechange = function() {
    if (data.readyState === 4) { 
        if (data.status === 200) { 
            let content = content.responseText;
            const lines = content.responseText.split("\n");
	    let i = 0;
	    for (const line of lines) { 
		if (selection.includes(i)) {
		    console.log(line);
		}
	    }
	} else {
	    alert(data.status);
	}
    } else {
	alert(data.readyState);
    }
}


