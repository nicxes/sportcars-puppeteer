const fs = require('fs');
const puppeteer = require('puppeteer');

const body_types = [
	"CONVERTIBLE",
	"COUPE",
	"CROSSOVER",
	"ESTATE",
	"GRANDTOURER",
	"HATCHBACK",
	"MINIBUS",
	"MINIVAN",
	"MPV",
	"PICKUP",
	"ROADSTER",
	"SALOON",
	"SEDAN",
	"SMALL_CAR",
	"SPORTSCAR",
	"SUPERCAR",
	"SUPERMINI",
	"SUV",
	"TRUCK",
	"VAN",
	"WAGON",
	"OTHER",
	"NONE"
]

/**
 * Scrappes all the data from the inventory.
 *
 * @param {string} url
 * @param {string} filename
 * @returns {array}
 */

const scrapper = async (url, fileName) => {
	// Launch Puppeteer
	const browser = await puppeteer.launch({
		headless: false,
		defaultViewport: {
			width: 1920,
			height: 1080
		},
		args: ['--no-sandbox']
	})

	// Open a new tab/page
	const page = await browser.newPage();
	let cache = []
	let data = []

	// This would listen the inventory response data
	page.on('response', async (response) => {
		const request = response.request();
		if (request.url().includes('getInventory')) {
			const data = await response.json();
			cache = data.inventory
		}
	})

	// Go to url
	await page.goto(url, {
		waitUntil: 'networkidle2',
		timeout: 0
	});

	// Scrap every card vehicle from the response
	cache.forEach((vehicle, i) => {
		let item = {};

		// Title
		item.title = `${vehicle.title[0].slice(0, -1)} ${vehicle.title[1]?.slice(1)}`;

		// Make
		item.make = vehicle.title[0].slice(4);

		// Model
		item.model = vehicle.model ? vehicle.model : '-';

		// Body Style
		item.body_style = 'NONE'

		// Year
		item.year = vehicle.title[0].substring(0, 4);

		// VIN
		item.vin = vehicle.callout[0]?.href.replace('https://www.carfax.com/cfm/ccc_displayhistoryrpt.cfm?partner=DLR_3&vin=', '');

		// Stock Number
		let stock_number
		vehicle.attributes.forEach((attr) => {
			if (attr.name == 'stockNumber') {
				stock_number = attr.value
				return
			}
		})

		item.vehicle_id = stock_number;

		// Price
		item.price = `${vehicle.pricing.retailPrice?.replace('$', '') || '0'} USD`;

		// Image URL
		item.image = vehicle.images[0].uri;

		// URL Vehicle
		item.url = 'https://www.sportcars.miami/' + vehicle.link;

		// Mileage Vehicle
		let mileage_value
		vehicle.attributes.forEach((attr) => {
			if (attr.name == 'odometer') {
				mileage_value = attr.value
				return
			}
		})
		item['mileage.value'] = mileage_value.replace(',', '').slice(0, -6);

		// Hardcore Properties
		item['mileage.unit'] = 'MI'
		item['state_of_vehicle'] = 'USED'
		item['fb_page_id'] = '321137121850648'
		item['description'] = 'Sport Cars Miami is a one of a kind first class pre-owned vehicles dealership. Our extensive partnership network and our flexible financing options allow us to offer the widest selection of both off-lease and new car trades at exceptional values. Looking for a high quality vehicle? You\'ve come to the right place. To learn more about our dealership and how we can help with your next vehicle purchase, please call us at 833-617-5627 or stop by in person. We look forward to meeting you.'

		// Address Properties
		item['address.addr1'] = '1300 N State Road 7, FL 33021'
		item['address.city'] = 'Hollywood'
		item['address.region'] = 'Florida'
		item['address.country'] = 'United States'

		if (item.price !== '0 USD') {
			data[i] = item;
		}
	})

	// Close the browser
	await browser.close()

	// Create final file
	fs.writeFileSync(`../data/${fileName}.json`, JSON.stringify(data));
	console.log(`Vehicles Scrapped in Total: ${data.length}`)
	console.log(`Saved into: ${fileName}.json\n`)
}

scrapper('https://www.sportcars.miami/full-inventory.htm', 'inventory-1');
scrapper('https://www.sportcars.miami/full-inventory.htm?start=100', 'inventory-2');
scrapper('https://www.sportcars.miami/full-inventory.htm?start=200', 'inventory-3');
scrapper('https://www.sportcars.miami/full-inventory.htm?start=300', 'inventory-4');

