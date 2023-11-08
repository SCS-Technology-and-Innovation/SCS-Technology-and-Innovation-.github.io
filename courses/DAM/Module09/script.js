const seconds = 60 * 60; // seconds in an hour

// weather data
const file = document.getElementById('weather');

// data storage
let winter = []; // 1/0 to whether the month is between Nov-Feb or not
let output = []; 
let above = []; // how many degrees above the threshold the temperature is
let rainsnow = []; // 1/0 to whether is snows/rains or not
let snowcover = []; // 1/0 to whether there is a snow cover or no 

// column indices
const idxdate = 2;
const idxirr = 6; // direct normal irradiance as kJ per m2 
const idxshine = 18; // minutes of sunshine
const idxcond = 26; // present weather (flag)
const idxambient = 30; // dry bulb temperature
const idxcover = 42; // snow cover

let data = '';

function calculate(input) {
    let parse = false; // skip until column header is found
    
    data = input;
    // Number of panels
    let panelcount = parseInt(document.getElementById('count').value);
    
    // Surface area of each individual panel in m2
    let surface = parseFloat(document.getElementById('surface').value);
    let totalm2 = panelcount * surface;
    
    // Panel inclination as angle of elevation from horizontal in degrees
    let angle = parseFloat(document.getElementById('angle').value);
    let rad = (angle / 360.0) * 2.0 * Math.PI; // in radians
    let factor = Math.cos(rad);
    
    // Conversion effiency (given as perc, here as proportion)
    let efficiency = parseFloat(document.getElementById('eff').value) / 100.0;
    
    // Temperature threshold for the tempdecr activation
    let tempthr = parseInt(document.getElementById('temp').value);
    
    const rows = data.split('\n');
    for (let row of rows) {
	if (row.includes('ECCC station identifier')) {
	    parse = true;
	    let cols = row.split(',');
	    let cc = cols.length;
	    let rc = rows.length;
	    console.log(rc + ' rows and ' + cc + ' columns')
	    console.log(cols);
	    continue;
	}
	if (parse) {
	    let fields = row.split(',');
	    if (fields.length >= idxcover) {
		let date = fields[idxdate];
		let month = date.substring(4, 6);
		if (month == "11" || month == "12" || month == "01" || month == "02") {
		    winter.push(true);
		} else {
		    winter.push(false);
		}
		let r = parseFloat(fields[idxirr]); // in kJ/m2, 1kW = 1 kJ/s
		let s = parseInt(fields[idxshine]); // minutes of the hour
		if (s > 60) { // 99 is an error flag of sorts
		    s = 60; // assume complete sunshine when the minutes are not properly reported
		}
		let irradiance = (s / 60) * r * factor; // take into account the time proportion and the angle
		let kilojoules = totalm2 * irradiance; // take into account the number of panels and their surface
		let kWh = kilojoules / seconds;
		output.push(kWh); // this MIGHT be horribly wrong, I hope someone bothers to check this
		let t = fields[idxambient] / 10; // reported as 0.1 C
		if (t > tempthr) {
		    above.push(tempthr - t); // how much above the threshold the temperature is
		} else {
		    above.push(0); // not above the threshold
		}
		let w = fields[idxcond];
		let rain = (w.charAt(1) != "0"); // ignore drizzle
		let snow = (w.charAt(3) != "0");
		rainsnow.push(rain || snow);
		let c = fields[idxcover];
		snowcover.push(parseInt(c));
	    } 
	}
    }
    simulate(panelcount);
    document.getElementById("recalculate").disabled = false;
    console.log("Recalculation enabled");
}

function redo() {
    calculate(data);
}

file.onchange = e => {
    var r = new FileReader();
    var label = file.files[0].name;
    r.readAsText(file.files[0] ,'UTF-8');
    r.onload = ev => {
	console.log("Data loaded");
	calculate(ev.target.result);
    }
}

function normal(m, s) {
    let r = Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random());
    return s * r + m;
}

function energycost(amount, reg, high, threshold) {
    if (amount < 0) { // feeding into the grid
	console.log('feeding into the grid');
	return -1.0 * amount * reg; // negative cost since we sell energy
    }
    let cost = 0;
    let excess = amount - threshold;
    if (excess > 0) {
	cost += excess * high;
	amount -= excess;
    }
    cost += amount * reg;
    return cost;
}

let withPanels = null;
let withoutPanels = null;

function simulate(pc) {
    // reset
    withPanels = [];
    withoutPanels = [];
    
    let cWith = 0;
    let cWout = 0;
    
    // Threshold between regular and high consumption in kWh/day
    let highlow = parseFloat(document.getElementById('threshold').value);
    // Cost of regular consumption as Canadian cents per kWh (dollars from cents)
    let regcost = parseFloat(document.getElementById('regular').value) / 100.0;
    // Cost of excess consumption  as Canadian cents per kWh (dollars from cents)
    let exccost = parseFloat(document.getElementById('excess').value) / 100.0;

    // Panel lifetime (years to hours)
    let lifetime = parseInt(document.getElementById('lifetime').value) * 365 * 24;
    console.log(lifetime, 'hours will be simulated');
    let rowcount = winter.length; // number of data points parsed
    
    if (rowcount < lifetime) {
	alert('Dataset is shorter than the useful life of the panels so the data will be looped.');
    }
    
    // Purchase cost of each individual panel in CAD
    let price = parseFloat(document.getElementById('price').value);
    cWith += pc * price; // how much we pay for the panels

    // Initial installation cost in CAD, systemwide
    let installation = parseFloat(document.getElementById('install').value);
    cWith += installation; // we pay for the installation

    // System maintenance cost in CAD, systemwide
    let maintenance = parseFloat(document.getElementById('maintain').value);
    // System maintenance interval (hours from months)
    let interval = parseInt(document.getElementById('interval').value) * 30 * 24; // simplified
    let countdown = interval;

    // Probability of snow removal (perc to prop)
    let removal = parseFloat(document.getElementById('snow').value) / 100.0;
    // Reduction of consumption per celsius exceeding the reference temperature (perc to prop)
    let tempdecr = parseFloat(document.getElementById('xval').value) / 100.0;
    // Increase of consumption when it rains or snows (perc to prop)
    let rainincr = 1.0 + parseFloat(document.getElementById('yval').value) / 100.0;
    // Reduction in consumption when it is not Winter (perc to prop)
    let nonwinter = 1.0 - parseFloat(document.getElementById('zval').value) / 100.0;

    // Mean household consumption in kWh
    let mean = parseFloat(document.getElementById('cons').value);
    // Standard deviation for household consumption
    let stddev = parseFloat(document.getElementById('sd').value);

    let generation = 0;
    let consumption = 0;

    console.log('Initial costs are', cWith);
    
    for (let hour = 0; hour < lifetime; hour++) {
	let i = hour % rowcount; // loop if too short

	// how much energy gets consumed this hour
	let hourly = normal(mean, stddev);
	if (!winter[i]) {
	    hourly *= nonwinter; // lower in non-winter
	}
	hourly *= (1.0 - above[i] * tempdecr); // lower when warmer
	if (rainsnow[i]) {
	    hourly *= rainincr; // higher when raining or snowing
	}

	// how much energy gets created by the panels this hour
	let incoming = output[i];
	if (snowcover[i]) { // there is a snow cover
	    if (Math.random() > removal) { // it does NOT get removed
		incoming = 0; // we get nothing
	    }
	}
	if (countdown == 0) { // maintenance happens now
	    incoming = 0; // cannot generate while maintenance happens (very fast maintenance, just one hour)
	    cWith += maintenance; // we pay for the maintenance
	    countdown = interval; // reset the countdown
	} else {
	    countdown--; // tick away until the next maintenance
	}

	// accumulate daily totals
	consumption += hourly;
	generation += incoming;
	
	if (hour % 24 == 0) { // a day lapses, we pay or earn
	    cWout += energycost(consumption, regcost, exccost, highlow); // what we would pay if we had no panels
	    withoutPanels.push(cWout);
	    // what we pay/earn with panels
	    let diff = consumption - generation;
	    cWith += energycost(diff, regcost, exccost, highlow); 
	    withPanels.push(cWith);
	    // reset daily accumulators for the next day
	    consumption = 0;
	    generation = 0;
	}
    }
    visualize(cWith, cWout);
}

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

function visualize(maxWith, maxWout) {
    let h = canvas.height;
    let w = canvas.width;
    ctx.clearRect(0, 0, w, h);
    let high = Math.max(maxWith, maxWout);
    let daycount = withPanels.length;
    let dw = w / daycount;
    console.log('Highest cost at', high);

    // WITHOUT PANELS
    let cx = 0;
    let cy = h;
    let nx = 0;
    let ny = h;
    ctx.fillStyle = '#ff6600'; 
    ctx.strokeStyle = '#ff6600';
    for (let i = 0; i < daycount; i++) {
	let c = withoutPanels[i] / high; // scale
	nx = i * dw;
	ny = h - c * h;
	if (nx > cx || ny > cy) {
	    ctx.beginPath();
	    ctx.moveTo(cx, cy);	    
	    ctx.lineTo(nx, ny);
	    ctx.stroke();
	}
	cx = nx;
	cy = ny;
    }
    
    // WITH PANELS
    ctx.fillStyle = '#00ff66'; 
    ctx.strokeStyle = '#00ff66';
    cx = 0;
    cy = h;
    nx = 0;
    ny = h;
    for (let i = 0; i < daycount; i++) {
	let c = withPanels[i] / high; // scale
	nx = i * dw;
	ny = h - c * h;
	if (nx > cx || ny > cy) {
	    ctx.beginPath();
	    ctx.moveTo(cx, cy);	    
	    ctx.lineTo(nx, ny);
	    ctx.stroke();
	}
	cx = nx;
	cy = ny;
    }
}
