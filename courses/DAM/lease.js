let cost = parseInt(document.getElementById('assetcost').value);
let ploan = parseFloat(document.getElementById('loan').value) / 100;
let pay = parseInt(document.getElementById('payment').value);
let lint = parseFloat(document.getElementById('interest').value) / 100;
let rent = parseInt(document.getElementById('rent').value);
let rinc = parseFloat(document.getElementById('increase').value) / 100;
let taxrate = parseFloat(document.getElementById('tax').value) / 100;
let years = parseInt(document.getElementById('duration').value);
let sale = parseInt(document.getElementById('sale').value);

function compute() {
    let table = document.getElementById('flow');
    let s = table.getElementsByTagName('tbody')[0];
    s.textContent = '';    
    let debt = ploan * cost;
    let inv = debt - cost;
    let r, c, aint, taxp, profit, exp, balance;
    let total = 0;
    for (let y = 0; y < years; y++) {
	aint = (lint * debt) / 12; // monthly part of annual interest
	taxp = taxrate * rent; // tax on present rent
	profit = rent - taxp; // rent we get to keep after tax
	for (let m = 0; m < 12; m++) { // each month
	    balance = 0; // monthly balance
	    balance += profit; // we get some rent income
	    total += profit;
	    debt -= pay; // we reduce the outstanding debt
	    r = s.insertRow(m + 12 * y);
	    c = r.insertCell(0);
	    c.innerHTML = (m + 1) + '  ' + (y + 1);
	    c = r.insertCell(1);	    
	    if (y == 0 && m == 0) { // first month: downpayment
		c.innerHTML = inv.toFixed(2);
		balance += inv;
		total += inv;
	    } else if (y == years - 1 && m == 11) {
		c.innerHTML = sale;		
		balance += sale;
		total += sale;
		pay += debt;  // pay off any remaining debt
	    }
	    exp = pay + aint; // total debt payment per month
	    balance -= exp; // this is an expense
	    total -= exp;
	    c = r.insertCell(2);		
	    c.innerHTML = rent.toFixed(2);	    
	    c = r.insertCell(3);
	    c.innerHTML = taxp.toFixed(2);
	    c = r.insertCell(4);
	    c.innerHTML = profit.toFixed(2);
	    c = r.insertCell(5);			    
	    c.innerHTML = debt.toFixed(2);
	    c = r.insertCell(6);	
	    c.innerHTML = pay.toFixed(2);
	    c = r.insertCell(7);		
	    c.innerHTML = aint.toFixed(2);
	    c = r.insertCell(8);		
	    c.innerHTML = exp.toFixed(2);
	    c = r.insertCell(9);		
	    c.innerHTML = balance.toFixed(2);
	    c = r.insertCell(10);		
	    c.innerHTML = total.toFixed(2);	    	    
	}
	rent *= (1 + rinc); // annual rent increase
    }
}


