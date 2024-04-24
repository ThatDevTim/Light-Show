const http = require("http")
const fs = require("fs")
const chalk = require("chalk")

let playing = true
let frame = 0
let fps = 30

let initialFrameSend = 300
let frameSend = 150

let startTime = 0
let lastFrame = 0
let lastRender = 0

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

function loop() {
    sendData("192.168.0.104", "settings", {"brightness": 255})

    let frameData = fs.readFileSync(__dirname + "/Shows/demo/compiled/transform.json", "utf-8")
    frameData = JSON.parse(frameData)

    startTime = Date.now()
    setInterval(() => {
        if (!playing) return

        let now = Date.now()
        let elapsed = now - startTime
        let newFrame = Math.round(elapsed / (1000 / fps))

        if (newFrame == lastFrame) return

        lastFrame = newFrame
        frame = newFrame
        if ((frame - 1) % frameSend != 0) return

        lastRender = now

        let toSend = {}

        for (let index = frame; index < frame + frameSend; index++) {
            if(frameData[index.toString()]) toSend[index.toString()] = frameData[index.toString()]
        }

        if (Object.keys(toSend).length == 0) {
            console.log(chalk.green(`[+] Out of Frames! Paused loop at frame ${frame}!`))
            playing = false
        } else {
            sendData("192.168.0.104", "frames", toSend)
        }
    }, 0)

    console.log(chalk.green("[+] Loop Started"))
}

async function test() {
    console.log("[=] Test Started")
    let testData = fs.readFileSync(__dirname + "/Shows/demo/compiled/transform.json", "utf-8")
    testData = JSON.parse(testData)
    console.log(testData)
    console.log("[=] Sending Data to 192.168.0.104")
    await
    await sendData("192.168.0.104", "frames", testData).then(fetch("http://192.168.0.104/restart"))
    console.log("[+] Test Complete")
}

module.exports = { loop, test }