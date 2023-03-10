function randint(low, high) {
    let span = (high + 1) - low;
    return Math.min(Math.floor(low + span * Math.random()), high);
}

// counters
let np = 0; // patients
let nd = 0; // doctors
let ne = 0; // equipment
let nr = 0; // rooms
let ns = 0; // time slots
let pc = 0; // priority categories
let colors = null; 

function counters() {
    np = parseInt(document.getElementById('npat').value);
    nd = parseInt(document.getElementById('ndoc').value);
    colors = palette('tol-rainbow', nd);    
    ne = parseInt(document.getElementById('nopt').value);
    nr = parseInt(document.getElementById('nroom').value);
    ns = parseInt(document.getElementById('nslot').value);
    pc = parseInt(document.getElementById('pc').value);
}

// tables
let rt = document.getElementById("drooms");
let nt = document.getElementById("dneeds");
let da = document.getElementById("adoc");
let outcome = document.getElementById("result");
let sh = document.getElementById("shortage");

// data storage
let requests = null;
let bookings = {};
let rooms = [];
let lacking = {};

function prep() {
    counters();
    lacking = {}; // reset
    
    // ROOM EQUIPMENT TABLE
    let pa = parseInt(document.getElementById('pa').value) / 100;    
    let rmin = parseInt(document.getElementById('rmin').value);
    let rmax = parseInt(document.getElementById('rmax').value);
    if (rmax < rmin) {
	rmin = rmax;
	document.getElementById('rmin').value = rmax;
    }    
    // room table header
    let s = rt.getElementsByTagName('thead')[0];
    s.textContent = '';
    let r = s.insertRow(0);
    let c = r.insertCell(0);
    c.innerHTML = 'R/E';
    for (let j = 1; j <= ne; j++) {
	c = r.insertCell(j);
	let ml = 'E' + j;
	c.innerHTML = ml;
	lacking[ml] = 0;
    }
    c = r.insertCell(ne + 1);
    c.innerHTML = 'Count';    
    // room table body    
    s = rt.getElementsByTagName('tbody')[0];
    s.textContent = '';    
    for (let i = 0; i < nr; i++) {
	r = s.insertRow(i);
	c = r.insertCell(0);
	c.innerHTML = 'R' + (i + 1);
	for (let j = 1; j <= ne; j++) {
	    c = r.insertCell(j);
	    var box = document.createElement('input');
	    box.id = 'R' + (i + 1) + 'E' + j;
	    box.type = 'checkbox';
	    if (Math.random() < pa) {
		box.checked = true;
	    }
	    c.appendChild(box);
	}
	c = r.insertCell(ne + 1);
	var k = document.createElement('input');
	k.id = 'RC' + (i + 1);
	k.value = randint(rmin, rmax);
	c.appendChild(k);	    
    }

    // PATIENT NEED TABLE
    requests = []; // store requested appointments    
    let pe = parseInt(document.getElementById('pe').value) / 100;    
    let pmin = parseInt(document.getElementById('pmin').value);
    let pmax = parseInt(document.getElementById('pmax').value);
    if (pmax < pmin) {
	pmin = pmax;
	document.getElementById('pmin').value = pmax;
    }    
    // header
    s = nt.getElementsByTagName('thead')[0];
    s.textContent = '';
    r = s.insertRow(0);
    c = r.insertCell(0);
    c.innerHTML = 'Appt';
    for (let j = 1; j <= ne; j++) {
	c = r.insertCell(j);
	c.innerHTML = 'E' + j;
    }
    c = r.insertCell(ne + 1);
    c.innerHTML = 'Patient';    
    c = r.insertCell(ne + 2);
    c.innerHTML = 'Doctor';
    c = r.insertCell(ne + 3);
    c.innerHTML = 'Priority';

    // body    
    s = nt.getElementsByTagName('tbody')[0];
    s.textContent = '';

    let rc = 1;
    let al = 'A' + rc;	
    for (let i = 1; i <= np; i++) {
	let pl = 'P' + i;
	let count = randint(pmin, pmax); // how many appointments
	for (let j = 0; j < count; j++) {
	    r = s.insertRow(rc - 1);
	    c = r.insertCell(0);
	    c.innerHTML = al;
	    for (let k = 1; k <= ne; k++) {
		c = r.insertCell(k);
		var box = document.createElement('input');
		box.id = al + 'E' + k;
		box.type = 'checkbox';
		if (Math.random() < pe) {
		    box.checked = true;
		}
		c.appendChild(box);
	    }
	    // which patient
	    c = r.insertCell(ne + 1);
	    c.innerHTML = 'P' + (i + 1);		    
	    // which doctor
	    c = r.insertCell(ne + 2);
	    let dl = 'D' + randint(1, nd);
	    c.innerHTML = dl;
	    // what priority
	    c = r.insertCell(ne + 3);
	    let p = randint(1, pc);
	    c.innerHTML = p;
	    let a = {}
	    a.label = al;
	    a.patient = pl;
	    a.doctor = dl;
	    a.priority = p;
	    requests.push(a);
	    al = 'A' + (++rc);	
	}
    }

    // DOCTOR AVAILABILITY TABLE
    let pd = parseInt(document.getElementById('pd').value) / 100;    
    // header
    s = da.getElementsByTagName('thead')[0];
    s.textContent = '';
    r = s.insertRow(0);
    c = r.insertCell(0);
    c.innerHTML = 'D/T';
    for (let j = 1; j <= ns; j++) {
	c = r.insertCell(j);
	c.innerHTML = 'T' + j;
    }
    // body    
    s = da.getElementsByTagName('tbody')[0];
    s.textContent = '';    
    for (let i = 0; i < nd; i++) {
	r = s.insertRow(i);
	c = r.insertCell(0);
	let dl = 'D' + (i + 1);
	lacking[dl] = 0;
	c.innerHTML = dl;
	for (let j = 1; j <= ns; j++) {
	    c = r.insertCell(j);
	    var box = document.createElement('input');
	    box.id = 'D' + (i + 1) + 'T' + j;
	    box.type = 'checkbox';
	    if (Math.random() < pd) {
		box.checked = true;
	    }
	    c.appendChild(box);
	}
    }
}

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
const free = '#888888';

function draw() {
    let w = 0.9 * window.innerWidth;
    let h = Math.round(3 * w / 4);
    canvas.width = w;
    canvas.height = h;
    ctx.clearRect(0, 0, w, h);

    let t = rooms.length;
    let dx = w / (ns + 3);
    let dy = h / (t + 2);
    let y = dy;
    let s = 0.8 * Math.min(dx, dy);
    let fs = Math.floor(0.7 * s);
    let offset = 2 * s / 3;

    for (let i = 0; i < t; i++) {
	let x = dx / 2;
	let rl = rooms[i];
	ctx.fillStyle = '#ffffff'
	ctx.font = 'bold ' + fs + 'px Courier';
	ctx.fillText(rl, x, y + offset);
	x = 2 * dx;
	for (let t = 1; t <= ns; t++) {
	    let cl = rl + 'T' + t;
	    if (bookings.hasOwnProperty(cl)) {
		let al = bookings[cl];
		let doctor = '#' + appts[al].color;
		ctx.fillStyle = doctor;
		ctx.strokeStyle = doctor;		
	    } else {
		ctx.fillStyle = free;
		ctx.strokeStyle = free;
	    }
	    ctx.beginPath();
	    ctx.rect(x, y, s, s);
	    ctx.closePath();
	    ctx.fill();
	    ctx.stroke();	    
	    x += dx;
	}
	y += dy;
    }
}

const verbose = false;

function reset() {
    appts = {};
    bookings = {};

    for (let j = 1; j <= ne; j++) {
	lacking['E' + j] = 0;
    }

    for (let j = 1; j <= nd; j++) {
	lacking['D' + j] = 0;
    }
}

function visualize() {
    reset();
    rooms = [];
    let total = 0;
    for (let r = 1; r <= nr; r++) {
	let cap = document.getElementById('RC' + r);
	let rc =  parseInt(cap.value);
	for (let i = 1; i <= rc; i++) { // replicas of the room
	    rooms.push('R' + r + '.' + i);
	}
	total += rc;
    }
    draw();
}


function allocate() {
    reset();
    let success = 0;
    // result table header
    let s = outcome.getElementsByTagName('thead')[0];
    s.textContent = '';
    let r = s.insertRow(0);
    let c = r.insertCell(0);
    c.innerHTML = 'Appt';
    c = r.insertCell(1);
    c.innerHTML = 'Room';        
    c = r.insertCell(2);
    c.innerHTML = 'Time';

    // in order of priority
    for (let p = 1; p <= pc; p++) {
	if (verbose) {
	    console.log('Processing priority category', p);
	}
	for (const r of requests) {
	    let missing = {};
	    let al = r.label;
	    if (r.priority == p) { // right priority category
		if (!appts.hasOwnProperty(al)) { // still pending
		    if (verbose) {
			console.log('Allocating time for', al);
		    }
		    let attempted = false;
		    let found = false;
		    for (let t = 1; t <= ns && !found; t++) { // find the earliest time
			let tl = 'T' + t;			
			let dt = r.doctor + tl;
			let pt = r.patient + tl;
			let busy = bookings.hasOwnProperty(pt);
			if (!busy) { // patient available
			    let available = document.getElementById(dt).checked;
			    let taken = bookings.hasOwnProperty(dt);						    
			    if (available && !taken) { // doctor available and not yet booked
				attempted = true;
				if (verbose) {			    
				    console.log(r.doctor, 'and', r.patient, 'are both free at', tl);
				}
				for (let room = 0; room < rooms.length; room++) { // find a room
				    let rl = rooms[room];
				    let rt = rl.split('.')[0];
				    let cl = rl + tl;				
				    if (!bookings.hasOwnProperty(cl)) { // not yet taken
					let match = true; // will it have all the gear
					if (verbose) {
					    console.log('Checking if', rt, 'is ok for', al);
					}
					for (let e = 1; e <= ne; e++) {
					    let ml = 'E' + e;
					    let needs = document.getElementById(al + ml).checked;
					    let has = document.getElementById(rt + ml).checked;
					    if (needs && !has) { // an equipment is lacking in this room
						if (verbose) {
						    console.log('No, it lacks', ml);
						}
						missing[ml] = true;
						match = false;
						break;
					    }
					}
					if (match) {
					    if (verbose) {
						console.log('Making a reservation of', rl, 'for', al, 'at', tl);
					    }
					    let reservation = {};
					    reservation.room = rl;
					    reservation.time = tl;
					    reservation.color = colors[parseInt((r.doctor).substring(1)) - 1];
					    appts[al] = reservation;
					    bookings[cl] = al; // room no longer available at this time
					    bookings[dt] = al; // doctor no longer available at this time
					    bookings[pt] = al; // patient no longer available at this time
					    found = true;
					    success++;
					    break;
					}
				    }
				}
			    }
			}
		    }
		    if (!found) {
			if (verbose) {
			    console.log('Nothing available for', al);
			}
			let sorry = {};
			sorry.room = 'N/A';
			sorry.time = 'N/A';
			appts[al] = sorry;
			for (let e = 1; e <= ne; e++) {
			    let el = 'E' + e;
			    if (missing.hasOwnProperty(el)) {
				lacking[el]++;
			    }
			}
			if (!attempted) {
			    lacking[r.doctor]++;
			}
		    }		   
		}
	    }
	}
    }

    let perc = 100 * success / requests.length;
    document.getElementById('perc').innerHTML = perc.toFixed(0) + '% of appointments were successfully scheduled.';
    
    draw();
    // result table body    
    s = outcome.getElementsByTagName('tbody')[0];
    s.textContent = '';
    let rc = 0;
    for (const re of requests) {
	let a = re.label;
	if (appts.hasOwnProperty(a)) {
	    r = s.insertRow(rc++);
	    c = r.insertCell(0);
	    c.innerHTML = a;
	    c = r.insertCell(1);
	    c.innerHTML = appts[a].room;	    
	    c = r.insertCell(2);
	    c.innerHTML = appts[a].time;	    
	}
    }

    // report limitations
    s = sh.getElementsByTagName('thead')[0];
    s.textContent = '';
    r = s.insertRow(0);
    c = r.insertCell(0);
    c.innerHTML = 'Resource';
    c = r.insertCell(1);
    c.innerHTML = 'Shortage';
    s = sh.getElementsByTagName('tbody')[0];
    s.textContent = '';
    for (let d = 0; d < nd; d++) {
	r = s.insertRow(d);
	let dl = 'D' + (d + 1);
	c = r.insertCell(0);
	c.innerHTML = dl;
	c = r.insertCell(1);
	c.innerHTML = lacking[dl];	
    }
    for (let e = 0; e < ne; e++) {
	r = s.insertRow(nd + e);
	let el = 'E' + (e + 1);
	c = r.insertCell(0);
	c.innerHTML = el;
	c = r.insertCell(1);
	c.innerHTML = lacking[el];	
    }
}

function everything() {
    prep();
    visualize();
    allocate();
}

everything();



