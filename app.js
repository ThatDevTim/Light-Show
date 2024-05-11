const express = require("express")
const fs = require("fs")
const chalk = require("chalk")

const { load, loop, reset, prepare, play } = require("./handler.js")

const app = express()
const port = 80

const substations = __dirname + "/subhandlers.json"

app.use(express.json())
app.use("/public", express.static('public'))
app.use("/shows", express.static('shows'))

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/html/home.html")
})

app.get("/checkin", (req, res) => {
    let data = fs.readFileSync(substations)
    data = JSON.parse(data)

    let ip = req.ip
    if (ip.startsWith("::ffff:")) {
        ip = ip.slice(7)
    }

    if (!data.includes(ip)) {
        data.push(ip)
        fs.writeFileSync(substations, JSON.stringify(data))
        console.log(`${chalk.green("[+]")} Now tracking ${chalk.underline(ip)} as a Substation`)
    } else {
        console.log(`${chalk.yellow("[=]")} Already tracking ${chalk.underline(ip)} as a Substation`)
    }

    load()
    res.sendStatus(200)
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
    console.log(`${chalk.gray("[~]")} Clearing tracked Substations`)
    fs.writeFileSync(substations, JSON.stringify([]))
    console.log(chalk.green(`[+] Done clearing tracked Substations`))
    loop()
})