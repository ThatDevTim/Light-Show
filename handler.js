const http = require("http")
const fs = require("fs")
const chalk = require("chalk")
const fetch = require("node-fetch")
const { spawn } = require("child_process")
const { SerialPort } = require('serialport')

const pythonProcess = spawn("python3", ["audioPlayer.py"])

let showName = "timing"

let playing = false
let waitingStop = false
let frame = 0
let fps = 30

let frameSend = 150
let initialFrameSend = 150

let startTime = 0
let lastFrame = 0

let subhandlers
let frameData

function loadAudio(filePath) {
    console.log(`${chalk.gray("[~]")} Loading audio file`)
    pythonProcess.stdin.write(`load ${filePath}\n`)
}

function playAudio() {
    if (!pythonProcess.stdin.writableEnded) {
        console.log(`${chalk.gray("[~]")} Sending play command audioPlayer`)
        pythonProcess.stdin.write('play\n')
    } else {
        console.error(`${chalk.red("[-]")} Attempted to write to a closed stream`)
    }
}

function pauseAudio() {
    console.log(`${chalk.gray("[~]")} Sending pause command to audioPlayer`)
    pythonProcess.stdin.write('pause\n')
}

function stopPythonScript() {
    if (!pythonProcess.stdin.writableEnded) {
        pythonProcess.stdin.write('exit\n')
    }
}

function UART(message) {
    const port = new SerialPort({
        path: '/dev/ttyS0',
        baudRate: 115200
    })

    port.on('open', () => {
        console.log(`${chalk.gray("[~]")} Serial port opened`)
        port.write(message + '\n', (err) => {
          if (err) {
            return console.log(`Error on write: ${chalk.underline(err.message)}`)
          }
          console.log(`${chalk.green("[+]")} Serial port message sent: ${chalk.underline(message)}`)
        })
      
        port.drain(() => {
          port.close((err) => {
            if (err) {
                return console.log(`Error closing port: ${chalk.underline(err.message)}`)
            }
          })
        })
    })

    port.on('error', (err) => {
        return console.log(`Serial port error: ${chalk.underline(err.message)}`)
    })
}

async function sendData(node, method, data) {
    const startTime = Date.now()

    const url = `http://${node}/${method}`
    const postData = JSON.stringify(data)
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(postData)
        }
    }

    let result = ""
    const req = http.request(url, options, (res) => {
        res.setEncoding("utf8")
        res.on("data", (chunk) => {
            result += chunk
        })

        res.on("end", () => {
            console.log(`${chalk.gray("[~]")} Data Sent to ${node}/${method} in ${Date.now() - startTime}ms`)
            return 200
        })
    })

    req.on("error", (e) => {
        console.error(`${chalk.red("[-] Request Error:")} ${e.message}`)
    })

    req.write(postData)
    req.end()
}

function load() {
    subhandlers = fs.readFileSync(__dirname + "/subhandlers.json", "utf-8")
    subhandlers = JSON.parse(subhandlers) || []

    frameData = fs.readFileSync(__dirname + `/shows/demo/compiled/${showName}/compact.json`, "utf-8")
    frameData = JSON.parse(frameData)
}

function loop() {
    load()
    setInterval(() => {
        if (!playing) return

        let now = Date.now()
        let elapsed = now - startTime
        let newFrame = Math.round(elapsed / (1000 / fps))

        if (newFrame == lastFrame) return

        lastFrame = newFrame
        frame = newFrame

        if (waitingStop) {
            let keysAsNumbers = Object.keys(frameData).map(key => parseInt(key))
            let lastFrame = Math.max(...keysAsNumbers)

            if (frame == lastFrame + 3) {
                play()
                pauseAudio()
                waitingStop = false
            }
            return
        }

        if ((frame - 1) % frameSend != 0) return

        lastRender = now

        let toSend = {}

        for (let index = frame + initialFrameSend; index < frame + initialFrameSend + frameSend; index++) {
            if(frameData[index.toString()]) toSend[index.toString()] = frameData[index.toString()]
        }

        if (Object.keys(toSend).length == 0) {
            console.log(`${chalk.green("[+]")} Out of Frames! Paused loop at frame ${frame + initialFrameSend}!`)
            waitingStop = true
        } else {
            subhandlers.forEach(subhandler => {
                sendData(subhandler, "frames", toSend)  
            })
        }
    }, 0)

    console.log(`${chalk.green("[+]")} Loop Started`)
}

function reset() {
    frame = 0
    subhandlers.forEach(subhandler => {
        fetch(`http://${subhandler}/reset`)
    })
}

function prepare() {
    loadAudio("./music/60BPM.mp3")

    let toSend = {}

    for (let index = 1; index <= initialFrameSend; index++) {
        if(frameData[index.toString()]) toSend[index.toString()] = frameData[index.toString()]
    }

    subhandlers.forEach(subhandler => {
        sendData(subhandler, "settings", { "brightness": 255 })
        sendData(subhandler, "frames", toSend)  
    })
}

function play() {
    // subhandlers.forEach(subhandler => {
    //     let now = Date.now()
    //     fetch(`http://${subhandler}/play`).then(() => {
    //         console.log(`${chalk.green("[+]")} Command sent to ${chalk.underline(subhandler)} in ${Date.now() - now}ms!`)
    //     })
    // })

    UART("F-Play")

    if (!playing) playAudio()

    startTime = Date.now()
    playing = !playing
}

pythonProcess.stdout.on("data", (data) => {
    console.log(`${chalk.green("[+]")} Python Output: ${chalk.underline(data.toString())}`)
})

pythonProcess.stderr.on("data", (data) => {
    console.log(`${chalk.red("[-]")} Python Error: ${chalk.underline(data.toString())}`)
})

pythonProcess.on("close", (code) => {
    console.log(`${chalk.gray("[~]")} Python script exited with code ${chalk.underline(code)}`)
})

process.on('exit', () => {
    stopPythonScript()
    pythonProcess.kill()
})

module.exports = { load, loop, reset, prepare, play }