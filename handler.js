const http = require("http")
const fs = require("fs")

let playing = false
let frame = 0
let fps = 30

let initialFrameSend = 15
let frameSend = 5

async function sendData(node, method, data) {
    const startTime = Date.now()

    const url = `http://${node}/${method}`;
    const postData = JSON.stringify(data); // Ensure data is properly stringified JSON
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(postData) // Correctly set the Content-Length header
        }
    }

    let result = ""
    const req = http.request(url, options, (res) => {
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
            result += chunk
        })

        res.on("end", () => {
            console.log(`[+] Data Sent to ${node}/${method} in ${Date.now() - startTime}ms`)
        })
    })

    req.on("error", (e) => {
        console.error(`Request Error: ${e.message}`);
    })

    req.write(postData) // Write the stringified JSON data to the request
    req.end()
}

function loop() {
    setInterval(() => {    // Start code that will run over and over again as fast as possible
        // Do loop code here
        // This will comprise of sending frame data via http post requests to substation handlers
    }, 0)

    console.log("[+] Loop Started")
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