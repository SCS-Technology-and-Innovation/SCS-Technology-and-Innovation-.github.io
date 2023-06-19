async function grab() {
    console.log('request:', term, course, module, element);
    const url = "https://scs-technology-and-innovation.github.io/Content/" + term + "/CCCS" + course + '/M' + module + '/' + element + '.html';
    console.log('Populating from ' + url);
    const content = document.getElementById("content");
    content.innerHTML = await (await fetch(url)).text();
    if (element == 'interact') {
	const surl = "https://scs-technology-and-innovation.github.io/Content/" + term + "/CCCS" + course + '/M' + module + '/code.js';
	var script= document.createElement("script");
	let code = await (await fetch(surl)).text();
	script.innerHTML = code; 
	document.body.appendChild(script);
	// console.log('Script loaded from ' + surl + " : " + code);
    }
}
var link = document.createElement('a');
link.style.display = 'none'; 
link.setAttribute('href', '#');
link.setAttribute('onclick', 'grab()'); 
document.body.appendChild(link);
link.click(); 
console.log('Reload requested');


