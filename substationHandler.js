const fs = require("fs")
const http = require("http")
const chalk = require("chalk")
const { SerialPort } = require('serialport')

const debug = require("./debug.js")

let initialFrameSend = Number(process.env.INITIALFRAMESEND)

function sendData(node, method, data) {
    const startTime = Date.now()

    const url = `http://${node}/${method}`
    const postData = JSON.stringify(data)
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(postData)
        }
    }

    let result = ""
    const req = http.request(url, options, (res) => {
        res.setEncoding("utf8")
        res.on("data", (chunk) => {
            result += chunk
        })

        res.on("end", () => {
            debug.note(`Data Sent to ${node}/${method} in ${Date.now() - startTime}ms`)
            return 200
        })
    })

    req.on("error", (e) => {
        debug.failure(`Request Error: ${e.message}`)
    })

    req.write(postData)
    req.end()
}

function sendUART(message) {
	const port = new SerialPort({
		path: '/dev/ttyS0',
		baudRate: 115200
	})

	port.on('open', () => {
		debug.note("Serial port opened")

		port.write(message + '\n', (err) => {
			if (err) return debug.failure(`Error on write: ${chalk.underline(err.message)}`)
			debug.success(`Serial port message sent: ${chalk.underline(message)}`)
		})

		port.drain(() => {
			port.close((err) => {
				if (err) return debug.failure(`Error closing port: ${chalk.underline(err.message)}`)
			})
		})
	})

	port.on('error', (err) => {
		return debug.failure(`Serial port error: ${chalk.underline(err.message)}`)
	})
}

function sendFrames(substation, range) {
	let substationDictionary = fs.readFileSync(__dirname + "/substationDictionary.json", "utf-8")
    substationDictionary = JSON.parse(substationDictionary)

	let zone = substationDictionary[substation].zone

	let frameData = fs.readFileSync(__dirname + `/shows/demo/compiled/${zone}/compact.json`, "utf-8")
	frameData = JSON.parse(frameData)

	let toSend = {}

	for (let index = range[0]; index < range[1]; index++) {
		if (frameData[index.toString()]) toSend[index.toString()] = frameData[index.toString()]
	}

	sendData(substation, "frames", toSend)
}

function prepare() {
	let substationDictionary = fs.readFileSync(__dirname + "/substationDictionary.json", "utf-8")
    substationDictionary = JSON.parse(substationDictionary)

	Object.keys(substationDictionary).forEach(substation => {
		if (!substationDictionary[substation].registered) return

		let zone = substationDictionary[substation].zone

		let frameData = fs.readFileSync(__dirname + `/shows/demo/compiled/${zone}/compact.json`, "utf-8")
		frameData = JSON.parse(frameData)

		let toSend = {}

		for (let index = 1; index <= initialFrameSend; index++) {
			if (frameData[index.toString()]) toSend[index.toString()] = frameData[index.toString()]
		}

		let brightness = substationDictionary[substation].brightness

		sendData(substation, "settings", { brightness })
		sendData(substation, "frames", toSend)
	})
}

module.exports = { sendFrames, sendUART, prepare }