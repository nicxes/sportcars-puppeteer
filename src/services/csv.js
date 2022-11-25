const { Parser } = require('json2csv')
const fs = require('fs')
const inventory = require('../data/inventory-1.json')

const fields = [
	'title',
	'make',
	'model',
	'body_style',
	'year',
	'vin',
	'vehicle_id',
	'price',
	'image[0].url',
	'url',
	'mileage.value',
	'mileage.unit',
	'state_of_vehicle',
	'fb_page_id',
	'description',
	'address.addr1',
	'address.city',
	'address.region',
	'address.country'
]

const parserObj = new Parser({ fields })

try {
	const csv = parserObj.parse(inventory)
	fs.writeFileSync('../data/result.csv', csv);
} catch (err) {
	console.error(err)
}
