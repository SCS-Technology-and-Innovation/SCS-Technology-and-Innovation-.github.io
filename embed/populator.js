const url = "https://scs-technology-and-innovation.github.io/embed/content.html";
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


