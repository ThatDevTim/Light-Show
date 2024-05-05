const express = require("express")
const chalk = require("chalk")

const { load, loop, reset, prepare, play } = require("./handler.js")

const app = express()
const port = 3030

app.use(express.json())
app.use("/public", express.static('public'))
app.use("/shows", express.static('shows'))

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/html/home.html")
})

app.get("/load", (req, res) => {
    load()
    res.sendStatus(200)
})

app.get("/reset", (req, res) => {
    reset()
    res.sendStatus(200)
})

app.get("/prepare", (req, res) => {
    prepare()
    res.sendStatus(200)
})

app.get("/play", (req, res) => {
    play()
    res.sendStatus(200)
})

app.listen(port, () => {
    console.log(chalk.green(`[+] Listening on port ${port}`))
    load()
    loop()
})