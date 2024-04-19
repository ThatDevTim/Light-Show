const http = require("https")

let playing = false
let frame = 0
let fps = 30

let initialFrameSend = 15
let frameSend = 5

async function sendData(node, data) {
    let options = {
        method: 'POST',
        'Content-Type': 'application/json',
    }

    let result = ''
    const req = http.request(node, options, (res) => {
        console.log(res.statusCode)

        res.setEncoding('utf8')
        res.on('data', (chunk) => {
            result += chunk
        })

        res.on('end', () => {
            console.log(result)
        })
    })

    req.on('error', (e) => {
        console.error(e)
    })

    req.write(data)
    req.end()
}

function loop() {
    setInterval(() => {    // Start code that will run over and over again as fast as possible
        // Do loop code here
        // This will comprise of sending frame data via http post requests to substation handlers
    }, 0)

    console.log("[+] Loop Started")
}

module.exports = { loop }