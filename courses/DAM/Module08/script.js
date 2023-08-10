function color(s, c) {
    return '<font color="' + c + '">' + s + '</font>'
}

function compute() {
    let cost = parseInt(document.getElementById('assetcost').value);
    let ploan = parseFloat(document.getElementById('loan').value) / 100;
    let pay = parseInt(document.getElementById('payment').value);
    let lint = parseFloat(document.getElementById('interest').value) / 100;
    let rent = parseInt(document.getElementById('rent').value);
    let rinc = parseFloat(document.getElementById('increase').value) / 100;
    let taxrate = parseFloat(document.getElementById('tax').value) / 100;
    let years = parseInt(document.getElementById('duration').value);
    let sale = parseInt(document.getElementById('sale').value);
    
    let profitable = false;
    let table = document.getElementById('flow');
    let s = table.getElementsByTagName('tbody')[0];
    s.textContent = '';

    // how much do we owe the bank
    let debt = ploan * cost;
    let inv = debt - cost; // downpayment (negative)

    // auxiliary variables
    let r = 0;
    let c = 0;
    let aint = 0;
    let taxp = 0;
    let profit = 0;
    let exp = 0;
    let balance = 0;
    let total = 0;
    let howmany = 0;

    // cover the year span
    for (let y = 0; y < years; y++) {
	if (pay > 0) {
	    aint = (lint * debt); // annual interest
	    howmany = Math.ceil(debt / pay);
	    if (howmany > 12) {
		aint /= 12 // all months have loan payments
	    } else {
		aint /= howmany // not all of the year has loan payments anymore
	    }
	}
	
	taxp = taxrate * rent; // tax on present rent (simplification)

	profit = rent - taxp; // rent we get to keep after tax
	
	for (let m = 0; m < 12; m++) { // each month
	    balance = 0; // monthly balance
	    balance += profit; // we get some rent income

	    // accumulation of total money flow
	    total += profit;

	    if (debt <= pay) {
		pay = debt; // remaining debt, ending here
		debt = 0;
	    } else {
		debt -= pay; // we reduce the outstanding debt
	    }

	    r = s.insertRow(m + 12 * y);
	    c = r.insertCell(0);
	    c.innerHTML = (m + 1);
	    c = r.insertCell(1);
	    c.innerHTML = (y + 1);
	    c = r.insertCell(2);	    
	    if (y == 0 && m == 0) { // first month: downpayment
		c.innerHTML = color(inv.toFixed(2), "red");
		balance += inv;
		total += inv;
	    } else if (y == years - 1 && m == 11) {
		c.innerHTML = color(sale, "green");
		balance += sale;
		total += sale;
		pay += debt;  // pay off any remaining debt
	    }
	    if (m >= howmany) { // this month is beyond the end of the loan payments
		aint = 0;
		exp = 0;
	    } else {
		exp = pay + aint; // total debt payment per month
		balance -= exp; // this is an expense
		total -= exp;
	    }
	    c = r.insertCell(3);		
	    c.innerHTML = color(rent.toFixed(2), 'blue');
	    c = r.insertCell(4);
	    c.innerHTML = color(taxp.toFixed(2), 'red');
	    c = r.insertCell(5);
	    c.innerHTML = color(profit.toFixed(2), 'green');
	    c = r.insertCell(6);			    
	    c.innerHTML = color(debt.toFixed(2), 'blue');
	    c = r.insertCell(7);	
	    c.innerHTML = color(pay.toFixed(2), 'orange');
	    c = r.insertCell(8);		
	    c.innerHTML = color(aint.toFixed(2), 'orange');
	    c = r.insertCell(9);		
	    c.innerHTML = color(exp.toFixed(2), 'red');
	    c = r.insertCell(10);
	    if (balance < 0) {
		c.innerHTML = color(balance.toFixed(2), "red");
	    } else {
		if (!profitable) {
		    document.getElementById('first').innerHTML =
			"First profit on " + (m + 1) + " of year " + (y + 1);
		    profitable = true; // lift the flag
		}
		c.innerHTML = color(balance.toFixed(2), "green");
	    }
	    c = r.insertCell(11);		
	    c.innerHTML = total.toFixed(2);	    	    
	}
	rent *= (1 + rinc); // annual rent increase
    }
}


