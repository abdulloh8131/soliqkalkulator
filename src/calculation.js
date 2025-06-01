"use strict";


const elements = {

	monthlySalary: document.getElementById("monthlySalary"),
	allowance: document.getElementById("allowance"),
	allowanceTaxable: document.getElementById("allowanceTaxable"),
	sectorInputs: document.querySelectorAll('input[name="sector"]'),
	periodInputs: document.querySelectorAll('input[name="period"]'),


	grossIncome: document.getElementById("grossIncome"),
	sssAmount: document.getElementById("sssAmount"),
	mpfAmount: document.getElementById("mpfAmount"),
	philhealthAmount: document.getElementById("philhealthAmount"),
	pagibigAmount: document.getElementById("pagibigAmount"),
	totalDeductions: document.getElementById("totalDeductions"),
	taxableIncome: document.getElementById("taxableIncome"),
	withholdingTax: document.getElementById("withholdingTax"),
	taxDue: document.getElementById("taxDue"),
	takeHomePay: document.getElementById("takeHomePay"),
};

const updateElementValue = (element, value) => {
	const monthlySalary = parseFormattedNumber(
		document.getElementById("monthlySalary").value
	);
	const formattedValue = monthlySalary === 0 ? "0.00" : value.toFixed(2);
	element.innerText = numberFormat(formattedValue);
};


const numberFormat = (num) =>
	num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

const parseFormattedNumber = (str) => {
	const parsedValue = parseFloat(str.replace(/[^0-9.]/g, ""));
	return isNaN(parsedValue) ? 0.0 : parsedValue;
};

const handleInput = (elementId, callback) => {
	const element = document.getElementById(elementId);
	element.addEventListener("input", () => {
		element.value = numberFormat(parseFormattedNumber(element.value));
		calculateTax();
	});
};

handleInput("monthlySalary");
handleInput("allowance");

// contribution functions

const bracket = (lower, upper) => (income) =>
	(isNaN(lower) || income >= lower) && (isNaN(upper) || income <= upper);

const bracketPhilHealth = [
	[NaN, 10000, () => 500],
	[10000.01, 99999.99, (mon) => mon * 0.05],
	[100000, NaN, () => 5000],
];

const computePhilHealth = (monthly) => {
	return (
		bracketPhilHealth
			.filter((phBracket) => bracket(phBracket[0], phBracket[1])(monthly))
			.reduce(
				(contribution, phBracket) => (contribution += phBracket[2](monthly)),
				0
			) * 0.5
	);
};

const bracketSSS = (lower, upper) => (income) =>
	(isNaN(lower) || income >= lower) && (isNaN(upper) || income < upper);




const computeWithholdingTax = (taxableAnnualIncome) => {
	let taxAmount = 0;

	switch (true) {
		case taxableAnnualIncome <= 250000:
			taxAmount = 0;
			break;
		case taxableAnnualIncome <= 400000:
			taxAmount = (taxableAnnualIncome - 250000) * 0.15;
			break;
		case taxableAnnualIncome <= 800000:
			taxAmount = 22500 + (taxableAnnualIncome - 400000) * 0.2;
			break;
		case taxableAnnualIncome <= 2000000:
			taxAmount = 102500 + (taxableAnnualIncome - 800000) * 0.25;
			break;
		case taxableAnnualIncome <= 8000000:
			taxAmount = 402500 + (taxableAnnualIncome - 2000000) * 0.3;
			break;
		default:
			taxAmount = 2202500 + (taxableAnnualIncome - 8000000) * 0.35;
	}
	return taxAmount / 12;
};

const calculateTax = function () {
	
	const monthlySalary = parseFormattedNumber(
		document.getElementById("monthlySalary").value
	);
	const allowance = parseFormattedNumber(
		document.getElementById("allowance").value
	);

	const allowanceTaxable = document.getElementById("allowanceTaxable").checked;
	const sector = document.querySelector('input[name="sector"]:checked').value;
	const period = document.querySelector('input[name="period"]:checked').value;

	const switchLabel = document.getElementById("switch-label");

	const mpfLabel = "Majburiy ta'minot fondi";

	let grossIncome =
		period === "HAR YILI"
			? monthlySalary * 12
			: period === "IKKIHAFTALIK"
			? monthlySalary / 2
			: monthlySalary;

	if (allowanceTaxable) {
		grossIncome += allowance;
	}

	let sssContribution = 0;
	let mpfContribution = 0;
	let gsisContribution = 0;
	let pagibigContribution = 200;
	let philhealthContribution = computePhilHealth(monthlySalary);

	if (sector === "XUSUSIY") {
		sssContribution = computeSSS(grossIncome).sss;
		mpfContribution = computeSSS(grossIncome).mpf;

		if (period === "HAR YILI") {
			sssContribution *= 12;
			mpfContribution *= 12;
			gsisContribution = grossIncome * 0.09 * 12;
			pagibigContribution = 1200;
			philhealthContribution *= 12;
		} else if (period === "IKKIHAFTALIK") {
			sssContribution /= 2;
			mpfContribution /= 2;
			gsisContribution = (grossIncome * 0.09) / 2;
			philhealthContribution /= 2;
		}

		switchLabel.textContent = mpfLabel;
	} else if (sector === "OMMAVIY") {
		gsisContribution = grossIncome * 0.09;
		mpfContribution = gsisContribution;

		if (period === "HAR YILI") {
			gsisContribution *= 12;
		} else if (period === "IKKIHAFTALIK") {
			gsisContribution /= 2;
		}

		switchLabel.textContent = gsisLabel;
	}

	let totalDeductions =
		sssContribution +
		mpfContribution +
		philhealthContribution +
		pagibigContribution;

	let taxableIncome = grossIncome - totalDeductions;

	let taxableAnnualIncome =
		period === "OYLIK"
			? taxableIncome * 12
			: period === "IKKIHAFTALIK"
			? taxableIncome * 26
			: taxableIncome;

	let withholdingTax =
		period === "HAR YILI"
			? computeWithholdingTax(taxableAnnualIncome) * 12
			: period === "IKKIHAFTALIK"
			? computeWithholdingTax(taxableAnnualIncome) / 26
			: computeWithholdingTax(taxableAnnualIncome);

	let taxDue = totalDeductions + withholdingTax;

	let takeHomePay = grossIncome - taxDue;

	if (!allowanceTaxable) {
		takeHomePay += allowance;
	}

	updateElementValue(elements.grossIncome, grossIncome);
	updateElementValue(elements.sssAmount, sssContribution);
	updateElementValue(elements.mpfAmount, mpfContribution);
	updateElementValue(elements.philhealthAmount, philhealthContribution);
	updateElementValue(elements.pagibigAmount, pagibigContribution);
	updateElementValue(elements.taxableIncome, taxableIncome);
	updateElementValue(elements.withholdingTax, withholdingTax);
	updateElementValue(elements.totalDeductions, totalDeductions);
	updateElementValue(elements.taxDue, taxDue);
	updateElementValue(elements.takeHomePay, takeHomePay);

	let summaryTable = [
		[1, "Gross Income", "", grossIncome.toFixed(2)],
		[1, "Allowance", "", allowance.toFixed(2)],
		[2, "Withholding Tax", "", withholdingTax.toFixed(2)],
		[3, "SSS Contribution", "", sssContribution.toFixed(2)],
		[4, "SSS Mandatory Provident Fund", "", mpfContribution.toFixed(2)],
		[5, "GSIS Contribution", "", gsisContribution.toFixed(2)],
		[6, "PhilHealth Contribution", "", philhealthContribution.toFixed(2)],
		[7, "Pag-ibig Contribution", "", pagibigContribution.toFixed(2)],
		[8, "Total Contribution", "", totalDeductions.toFixed(2)],
		[9, "Taxable Income", "", taxableIncome.toFixed(2)],
		[10, "Total Tax Due", "", taxDue.toFixed(2)],
		[11, "Net Income", "", takeHomePay.toFixed(2)],
	];

	props.invoice.table = summaryTable;


	const checkTakeHomePay = function () {
		const takeHomePayElement = document.getElementById("takeHomePay");
		const downloadBtn = document.getElementById("downloadBtn");
		const takeHomePay = parseFloat(takeHomePayElement.textContent);

		if (takeHomePay > 0) {
			downloadBtn.removeAttribute("disabled");
		} else {
			downloadBtn.setAttribute("disabled", "true");
		}
	};
	checkTakeHomePay();
};
