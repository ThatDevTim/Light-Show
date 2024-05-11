const http = require("http")
const fs = require("fs")
const chalk = require("chalk")
const fetch = require("node-fetch")

let playing = false
let waitingStop = false
let frame = 0
let fps = 30

let frameSend = 150
let initialFrameSend = 150

let startTime = 0
let lastFrame = 0

let subhandlers
let frameData

async function sendData(node, method, data) {
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
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
            result += chunk
        })

        res.on("end", () => {
            console.log(`[~] Data Sent to ${node}/${method} in ${Date.now() - startTime}ms`)
            return 200
        })
    })

    req.on("error", (e) => {
        console.error(chalk.red(`[-] Request Error: ${e.message}`));
    })

    req.write(postData)
    req.end()
}

function load() {
    subhandlers = fs.readFileSync(__dirname + "/subhandlers.json", "utf-8")
    subhandlers = JSON.parse(subhandlers)

    frameData = fs.readFileSync(__dirname + "/shows/demo/compiled/transform.json", "utf-8")
    frameData = JSON.parse(frameData)
}

function loop() {
    setInterval(() => {
        if (!playing) return

        let now = Date.now()
        let elapsed = now - startTime
        let newFrame = Math.round(elapsed / (1000 / fps))

        if (newFrame == lastFrame) return

        lastFrame = newFrame
        frame = newFrame

        if (waitingStop) {
            let keysAsNumbers = Object.keys(frameData).map(key => parseInt(key))
            let lastFrame = Math.max(...keysAsNumbers)

            if (frame == lastFrame + 3) {
                play()
            }
            return
        }

        if ((frame - 1) % frameSend != 0) return

        lastRender = now

        let toSend = {}

        for (let index = frame + initialFrameSend; index < frame + initialFrameSend + frameSend; index++) {
            if(frameData[index.toString()]) toSend[index.toString()] = frameData[index.toString()]
        }

        if (Object.keys(toSend).length == 0) {
            console.log(chalk.green(`[+] Out of Frames! Paused loop at frame ${frame + initialFrameSend}!`))
            waitingStop = true
        } else {
            subhandlers.forEach(subhandler => {
                sendData(subhandler, "frames", toSend)  
            })
        }
    }, 0)

    console.log(chalk.green("[+] Loop Started"))
}

function reset() {
    frame = 0
    subhandlers.forEach(subhandler => {
        fetch(`http://${subhandler}/reset`)
    })
}

function prepare() {
    let toSend = {}

    for (let index = 1; index <= initialFrameSend; index++) {
        if(frameData[index.toString()]) toSend[index.toString()] = frameData[index.toString()]
    }

    subhandlers.forEach(subhandler => {
        sendData(subhandler, "settings", { "brightness": 255 })
        sendData(subhandler, "frames", toSend)  
    })
}

function play() {
    subhandlers.forEach(subhandler => {
        let now = Date.now()
        fetch(`http://${subhandler}/play`).then(() => {
            console.log(Date.now() - now)
        })
    })

    startTime = Date.now()
    playing = !playing
}

module.exports = { load, loop, reset, prepare, play }