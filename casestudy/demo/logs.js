let c = 0;
let n = 100000;
let p = 0.15;
let l = '';

function randint(l, h) {
    let s = h - l;
    return l + Math.floor(Math.random() * s);
}

let output = 'author,upvotes,label'; // header row
while (c < n) {
    let a = randint(10000, 99999); // user id
    // probability of posting depends on the mod 13 of the user
    let m = a % 13;
    let k = randint(1, 100) + Math.pow(2, m);
    console.log(a, m, k);
    // upvotes correlate inversely with m
    let low = Math.ceil(50 / (m + 1));
    let high = Math.ceil(300 / (m + 1));
    for (let i = 0; i < k; i++) {
	let u = randint(low, high);
	l = 'none';
	if (Math.random() < p) {
	    if (k > 150 && u < 20) {
		l = 'spam';
	    } else if (k < 30 && u > 40) {
		l = 'good';
	    }
	}
	output = output + '\n' + a + ',' + u + ',' + l;
	c++;
    }
}

var link = document.createElement('a');
link.style.display = 'none'; // nightblade mode (hiding)
console.log(output);
link.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(output));
var now  = new Date();
let ts = now.toLocaleDateString();
ts = ts.replace('/', '-')
ts = ts.replace('"', '')
ts = ts.replace(' ', '')
link.setAttribute('download', 'forumlog-' + ts + '.csv'); 
document.body.appendChild(link);
link.click(); // download
