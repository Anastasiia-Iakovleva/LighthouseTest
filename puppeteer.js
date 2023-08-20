const fs = require('fs')
const puppeteer = require('puppeteer')
const lighthouse = require('lighthouse/lighthouse-core/fraggle-rock/api.js')

const waitTillHTMLRendered = async (page, timeout = 30000) => {
  const checkDurationMsecs = 1000;
  const maxChecks = timeout / checkDurationMsecs;
  let lastHTMLSize = 0;
  let checkCounts = 1;
  let countStableSizeIterations = 0;
  const minStableSizeIterations = 3;

  while(checkCounts++ <= maxChecks){
    let html = await page.content();
    let currentHTMLSize = html.length; 

    if(lastHTMLSize != 0 && currentHTMLSize == lastHTMLSize) 
      countStableSizeIterations++;
    else 
      countStableSizeIterations = 0; //reset the counter

    if(countStableSizeIterations >= minStableSizeIterations) {
      console.log("Fully Rendered Page: " + page.url());
      break;
    }

    lastHTMLSize = currentHTMLSize;
    await page.waitForTimeout(checkDurationMsecs);
  }  
};

async function captureReport() {
	const browser = await puppeteer.launch({args: ['--allow-no-sandbox-job', '--allow-sandbox-debugging', '--no-sandbox', '--disable-gpu', '--disable-gpu-sandbox', '--display', '--ignore-certificate-errors', '--disable-storage-reset=true']});

	const page = await browser.newPage();
	const baseURL = "http://localhost/";
	
	await page.setViewport({"width":1920,"height":1080});
	await page.setDefaultTimeout(10000);
	
	const navigationPromise = page.waitForNavigation({timeout: 30000, waitUntil: ['domcontentloaded']});
	await page.goto(baseURL);
    await navigationPromise;
		
	const flow = await lighthouse.startFlow(page, {
		name: 'demoshop',
		configContext: {
		  settingsOverrides: {
			throttling: {
			  rttMs: 40,
			  throughputKbps: 10240,
			  cpuSlowdownMultiplier: 1,
			  requestLatencyMs: 0,
			  downloadThroughputKbps: 0,
			  uploadThroughputKbps: 0
			},
			throttlingMethod: "simulate",
			screenEmulation: {
			  mobile: false,
			  width: 1920,
			  height: 1080,
			  deviceScaleFactor: 1,
			  disabled: false,
			},
			formFactor: "desktop",
			onlyCategories: ['performance'],
		  },
		},
	});
	//================================INPUT_CONSTANTS================================
	const fullName = "John Smith";
	const address = "Rummelsburger Str. 123";
	const postalCode = "12345";
	const city = "Berlin";
	const country = "DE";
	const phone = "+491234567899";
	const email = "test@gmail.com";
	
	//================================SELECTORS================================
	const tablesTab      = "a[href='http://localhost/tables']";
	const firstTable = "div[class*='product-list'] div:first-child";
	const addToCartButton = "button[type='submit']";
	const addedSuccessCheck   = "span[class*='al-box success cart-added-info']";
	const cartTab    = "a[href='http://localhost/cart']";
	const placeAnOrderButton       = "input[value='Place an order']";
	const placeOrderFinalButton  = "input[value='Place Order']";
	
	const thankYouTitle = ".//h1[text()='Thank You']"
	
	const fullNameField = "input[name='cart_name']";
	const addressField = "input[name='cart_address']";
	const postalCodeField = "input[name='cart_postal']";
	const cityField = "input[name='cart_city']";
	const countrySelector = "select[name='cart_country']";
	const phoneField = "input[name='cart_phone']";
	const emailField = "input[name='cart_email']";
	
	//================================NAVIGATE================================
    await flow.navigate(baseURL, {
		stepName: 'open the application'
		});
  	console.log('application is opened');
	
	//================================PAGE_ACTIONS================================
	await page.waitForSelector(tablesTab);
	await flow.startTimespan({ stepName: 'Open Tables tab' });
		await page.waitForSelector(tablesTab);
		await page.click(tablesTab);
		await navigationPromise;
		await waitTillHTMLRendered(page);
	await flow.endTimespan();
    console.log('Tables tab is opened');

	await page.waitForSelector(firstTable);
	await flow.startTimespan({ stepName: 'Open table' });
		await page.click(firstTable);
		await navigationPromise;
		await waitTillHTMLRendered(page);
	await flow.endTimespan();
	console.log('Table is opened');
	
	await page.waitForSelector(addToCartButton);
	await flow.startTimespan({ stepName: 'Add table to cart' });
		await page.click(addToCartButton);
		await navigationPromise;
		await waitTillHTMLRendered(page);
		await page.waitForSelector(addedSuccessCheck);
	await flow.endTimespan();
	console.log('Table is added to cart');
	
	await flow.startTimespan({ stepName: 'Open cart' });
		await page.click(cartTab);
		await navigationPromise;
		await waitTillHTMLRendered(page);
	await flow.endTimespan();
	console.log('Cart is opened');
	
	await page.waitForSelector(placeAnOrderButton);
	await flow.startTimespan({ stepName: 'Click Place an Order button' });
		await page.click(placeAnOrderButton);
		await navigationPromise;
		await waitTillHTMLRendered(page);
	await flow.endTimespan();
	console.log('Place an Order button was clicked');
	
	await page.waitForSelector(placeOrderFinalButton);
	await flow.startTimespan({ stepName: 'Fill required data and place an order' });
		await page.type(fullNameField, fullName);
		console.log('fullNameField is filled');
		await page.type(addressField, address);
		console.log('addressField is filled');
		await page.type(postalCodeField, postalCode);
		console.log('postalCodeField is filled');
		await page.type(cityField, city);
		console.log('cityField is filled');
		await page.type(phoneField, phone);
		console.log('phoneField is filled');
		await page.type(emailField, email);
		console.log('emailField is filled');
		await page.select(countrySelector, country);
		console.log('countrySelector is filled');
		await page.click(placeOrderFinalButton);
		console.log('placeOrderButton is clicked');
		await waitTillHTMLRendered(page);
		await page.waitForXPath(thankYouTitle);
	await flow.endTimespan();
	console.log('Order is placed');

	//================================REPORTING================================
	const reportPath = __dirname + '/user-flow.report.html';

	const report = await flow.generateReport();
	
	fs.writeFileSync(reportPath, report);
	
    await browser.close();
}
captureReport();