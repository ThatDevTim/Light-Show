const http = require("http")
const fs = require("fs")
const chalk = require("chalk")

let playing = true
let frame = 0
let fps = 30

let initialFrameSend = 30
let frameSend = 15

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
            console.log(chalk.green(`[+] Data Sent to ${node}/${method} in ${Date.now() - startTime}ms`))
        })
    })

    req.on("error", (e) => {
        console.error(chalk.red(`[-] Request Error: ${e.message}`));
    })

    req.write(postData)
    req.end()
}

function loop() {
    startTime = Date.now()
    setInterval(() => {
        if (!playing) return

        let now = Date.now()
        let elapsed = now - startTime
        let newFrame = Math.round(elapsed / (1000 / fps))

        if (newFrame == lastFrame) return

        lastFrame = newFrame
        frame = newFrame
        if (frame % frameSend != 0) return

        // Sen Frames

        lastRender = now
    }, 0)

    console.log(chalk.green("[+] Loop Started"))
}

function test() {
    console.log("[=] Test Started")
    let testData = fs.readFileSync(__dirname + "/Shows/demo/compiled/section2.json", "utf-8")
    testData = JSON.parse(testData)
    console.log(testData)
    console.log("[=] Sending Data to 192.168.0.104")
    sendData("192.168.0.104", "frames", testData).then(fetch("http://192.168.0.104/restart"))
    sendData("192.168.0.104", "settings", {"brightness": 125})
    console.log("[+] Test Complete")
}

module.exports = { loop, test }