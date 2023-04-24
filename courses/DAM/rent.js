let rc = 0;

function addRow() {
    let table = document.getElementById('data');
    let s = table.getElementsByTagName('tbody')[0];
    let r = s.insertRow(rc++);
    let c = r.insertCell();
    let i = document.createElement('input');
    i.id = 'sales.' + rc;
    i.type = 'number';
    i.width = 7;    
    c.appendChild(i);

    c = r.insertCell();
    i = document.createElement('input');
    i.id = 'rent.' + rc;
    i.type = 'number';
    i.width = 4;    
    c.appendChild(i);
}

for (let i = 0; i < 3; i++) {
    addRow();
}
