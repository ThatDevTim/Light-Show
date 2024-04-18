const express = require("express")

const { loop } = require("./handler.js")

const app = express()    // Start an Express instance
const port = 3030        // Define port to listen on

app.use(express.json())  // Allows for JSON bodies in requests

app.get("*", (req, res) => {
    res.send(200)        // Listen for any get request and return status code 200
})

app.listen(port, () => {
    console.log(`[+] Listening on port ${port}`)
})