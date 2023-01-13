function fibo() {
    console.log('On it, boss');
    let pp = 0;
    let p = 1;
    let temp;
    const n = parseInt(document.getElementById('count').value);
    const target = document.getElementById('fibo');
    for (let i = 0; i < n; i++) {
	temp = p;
	p = pp + p;
	pp = temp;
	target.innerHTML += p + '<br>';
    }
    console.log('Did ' + n);   
}

const url = "https://scs-technology-and-innovation.github.io/embed/content2.html";
async function populate() {
    content.innerHTML = await (await fetch(url)).text();
    console.log('Yep')
}

var link = document.createElement('a');
link.style.display = 'none'; // nightblade mode (hiding)        
link.setAttribute('href', '#');
link.setAttribute('onclick', 'populate()'); // make the call
document.body.appendChild(link);
link.click(); // activate
console.log('Click')
