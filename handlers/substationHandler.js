const fs = require("fs")
const http = require("http")

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

module.exports = { sendFrames, prepare }