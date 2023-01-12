console.log('Loaded');

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
