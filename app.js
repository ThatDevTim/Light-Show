const express = require("express")
const chalk = require("chalk")

const { loop, test } = require("./handler.js")

const app = express()
const port = 3030

app.use(express.json())

app.get("*", (req, res) => {
    res.send(200)
})

app.listen(port, () => {
    console.log(chalk.green(`[+] Listening on port ${port}`))
    loop()
})