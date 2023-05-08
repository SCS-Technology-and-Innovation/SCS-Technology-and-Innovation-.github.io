const g = "https://scs-technology-and-innovation.github.io/Glossary/TI.html";
async function grab() {
    console.log('Populating glossary from ' + g);
    const content = document.getElementById("content");
    content.innerHTML = await (await fetch(g)).text();
}
var link = document.createElement('a');
link.style.display = 'none'; 
link.setAttribute('href', '#');
link.setAttribute('onclick', 'grab()'); 
document.body.appendChild(link);
link.click(); 


