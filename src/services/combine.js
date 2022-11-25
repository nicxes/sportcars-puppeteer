const fs = require("fs");

const inventory_1 = require('../data/inventory-1.json')
const inventory_2 = require('../data/inventory-2.json')
const inventory_3 = require('../data/inventory-3.json')
const inventory_4 = require('../data/inventory-4.json')

let merged = []

inventory_1.forEach((item) => {
	merged.push(item)
})

inventory_2.forEach((item) => {
	merged.push(item)
})

inventory_3.forEach((item) => {
	merged.push(item)
})

inventory_4.forEach((item) => {
	merged.push(item)
})

fs.writeFileSync(`../data/result.json`, JSON.stringify(merged))
console.log('Vehicles in total: ' + merged.length)
