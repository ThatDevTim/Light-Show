const fs = require("fs")
const chalk = require("chalk")

const debug = require("./debug.js")

const audio = require("./audioHandler.js")
const substation = require("./substationHandler.js")

let showName = "demo"

let playing = false
let frame = 0
let fps = Number(process.env.FPS)

let frameSend = Number(process.env.FRAMESEND)
let initialFrameSend = Number(process.env.INITIALFRAMESEND)

let startTime = 0
let pausedTime = 0
let lastFrame = 0

let substationList = []

function load() {
    substationList = []

    let substationDictionary = fs.readFileSync(__dirname + "/substationDictionary.json")
    substationDictionary = JSON.parse(substationDictionary)

    Object.keys(substationDictionary).forEach(substationIP => {
        if (substationDictionary[substationIP]["registered"]) substationList.push(substationIP)
    })
}

function register() {
    substation.sendUART("F-Register")
}

function reset() {
    substation.sendUART("F-Reset")

    playing = false
    frame = 0
    lastFrame = 0
    pausedTime = 0
}

function prepare() {
    audio.load("./music/60BPM.mp3")
    substation.prepare()
}

function play() {
    audio.play()
    substation.sendUART("F-Play")

    playing = true

    startTime = Date.now() - pausedTime
}

function pause() {
    audio.pause()
    substation.sendUART("F-Pause")

    playing = false

    pausedTime = Date.now() - startTime
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

        let endFrame = fs.readFileSync(__dirname + `/shows/${showName}/info.json`, "utf-8")
        endFrame = JSON.parse(endFrame)["length"]

        if (frame == endFrame) {
            debug.success(`Show ended at frame ${chalk.underline(endFrame)}`)
            pause()
            return
        }

        if ((frame - 1) % frameSend != 0) return

        lastRender = now

        let toSend = [frame + initialFrameSend, frame + initialFrameSend + frameSend]

        substationList.forEach(substationIP => {
            substation.sendFrames(substationIP, toSend)
        })
    }, 0)

    debug.success("mainHandler: Loop Started")
}

module.exports = { load, register, reset, prepare, play, pause, loop }