const fs = require("fs")
const chalk = require("chalk")

function success(message) {
    let log = `${chalk.green("[+]")} ${message}`
    console.log(log)
}

function failure(message) {
    let log = `${chalk.red("[-]")} ${message}`
    console.log(log)
}

function warning(message) {
    let log = `${chalk.yellow("[=]")} ${message}`
    console.log(log)
}

function note(message) {
    let log = `${chalk.gray("[~]")} ${message}`
    console.log(log)
}

module.exports = { success, failure, warning, note }