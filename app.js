const express = require("express")
const fs = require("fs")
const chalk = require("chalk")

require("dotenv").config()

const debug = require("./handlers/debugHandler.js")

const handler = require("./handlers/mainHandler.js")

const app = express()
const port = 80

app.use(express.json())
app.use("/public", express.static('public'))
app.use("/shows", express.static('shows'))

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/html/home.html")
})

app.get("/control", (req, res) => {
    res.sendFile(__dirname + "/public/html/control.html")
})

app.get("/timeline", (req, res) => {
    res.sendFile(__dirname + "/public/html/timeline.html")
})

app.get("/preview", (req, res) => {
    res.sendFile(__dirname + "/public/html/preview.html")
})

app.get("/register", (req, res) => {
    let substationDictionary = fs.readFileSync(__dirname + "../substationDictionary.json")
    substationDictionary = JSON.parse(substationDictionary)

    let ip = req.ip
    if (ip.startsWith("::ffff:")) {
        ip = ip.slice(7)
    }

    if (Object.keys(substationDictionary).includes(ip)) {
        substationDictionary[ip]["registered"] = true
        fs.writeFileSync(__dirname + "/substationDictionary.json", JSON.stringify(substationDictionary, null, 4))
        debug.success(`Now tracking ${chalk.underline(ip)} as a Substation`)
    } else {
        debug.failure(`Can't register ${chalk.underline(ip)} as a Substation`)
    }

    handler.load()
    res.sendStatus(200)
})

app.get("/load", (req, res) => {
    handler.load()
    res.sendStatus(200)
})

app.get("/reset", (req, res) => {
    handler.reset()
    res.sendStatus(200)
})

app.get("/attemptRegister", (req, res) => {
    handler.register()
    res.sendStatus(200)
})

app.get("/prepare", (req, res) => {
    handler.prepare()
    res.sendStatus(200)
})

app.get("/play", (req, res) => {
    handler.play()
    res.sendStatus(200)
})

app.get("/pause", (req, res) => {
    handler.pause()
    res.sendStatus(200)
})

app.listen(port, () => {
    debug.success(`Listening on port ${chalk.underline(port)}`)
    debug.note("Clearing tracked Substations")
    
    let substationDictionary = fs.readFileSync(__dirname + "/substationDictionary.json")
    substationDictionary = JSON.parse(substationDictionary)

    Object.keys(substationDictionary).forEach(substation => {
        substationDictionary[substation]["registered"] = false
    })

    fs.writeFileSync(__dirname + "/substationDictionary.json", JSON.stringify(substationDictionary, null, 4))

    debug.success("Done clearing tracked Substations")

    handler.loop()
})