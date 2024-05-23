const chalk = require("chalk")
const debug = require("./debug.js")
const { spawn } = require("child_process")

const pythonProcess = spawn("python3", ["audioPlayer.py"])

function load(filePath) {
    debug.note("Loading audio file")
    pythonProcess.stdin.write(`load ${filePath}\n`)
}

function play() {
    if (!pythonProcess.stdin.writableEnded) {
        debug.note("Sending play command audioPlayer")
        pythonProcess.stdin.write('play\n')
    } else {
        console.error("Attempted to write to a closed stream")
    }
}

function pause() {
    debug.note("Sending pause command to audioPlayer")
    pythonProcess.stdin.write("pause\n")
}

function close() {
    if (!pythonProcess.stdin.writableEnded) {
        pythonProcess.stdin.write("exit\n")
    }
}

pythonProcess.stdout.on("data", (data) => {
    debug.success(`Python Output: ${chalk.underline(data.toString())}`)
})

pythonProcess.stderr.on("data", (data) => {
    debug.failure(`Python Error: ${chalk.underline(data.toString())}`)
})

pythonProcess.on("close", (code) => {
    debug.note(`Python script exited with code ${chalk.underline(code)}`)
})

process.on('exit', () => {
    stopPythonScript()
    pythonProcess.kill()
})

module.exports = { load, play, pause, close }