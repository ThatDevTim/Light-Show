const http = require("https")

function loop() {
    setInterval(() => {    // Start code that will run over and over again as fast as possible
        // Do loop code here
        // This will comprise of sending frame data via http post requests to substation handlers
    }, 0)

    console.log("[+] Loop Started")
}

module.exports = { loop }