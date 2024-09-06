const fs = require("fs")
const chalk = require("chalk")

let show = "demo"

let frameData = {}

function insertData(frame, data) {
    if (!frameData[frame]) {
        frameData[frame] = []
    }

    frameData[frame].push(data)
}

function toByte(int) {
    return Math.round(int * 255)
}

function set(instruction) {
    let range = instruction.range
    let color = instruction.color
    let frame = instruction.frame

    if (Array.isArray(range)) {
        let compiledInstruction = [
            "range",
            [range.start, range.end],
            [
                toByte(color.hue / 360),
                toByte(color.saturation / 100),
                toByte(color.value / 100)
            ]
        ]

        insertData(frame, compiledInstruction)
    }

    console.log(`${chalk.gray("[~]")} Set pixels ${range[0]} to ${range[1]} to (${color}) at frame ${frame}!`)
}

function transform(instruction) {
    let range = instruction.range
    let color = instruction.color
    let frame = instruction.frame

    let hChange = color.end.hue - color.start.hue
    let sChange = color.end.saturation - color.start.saturation
    let vChange = color.end.value - color.start.value

    let duration = frame.end - frame.start

    for (let index = 0; index <= duration; index++) {
        let hOffset = (index / duration) * hChange
        let sOffset = (index / duration) * sChange
        let vOffset = (index / duration) * vChange
        
        let compiledInstruction = [
            "range",
            [range.start, range.end],
            [
                toByte((color.start.hue + hOffset) / 360),
                toByte((color.start.saturation + sOffset) / 360),
                toByte((color.start.value + vOffset) / 360),
            ]
        ]

        insertData(frame[0] + index, compiledInstruction)
    }

    console.log(`${chalk.gray("[~]")} Transformed pixels ${range.start} to ${range.end} to from (${color[0]}) to (${color[1]}) at between frame ${frame[0]} and ${frame[1]}!`)
}

function segment(instruction) {
    let range = instruction.range
    let color = instruction.color
    let frame = instruction.frame

    let numTotal = (range[1] - range[0]) + 1
    let numPer = instruction.length || numTotal / color.length
    let numSegments = numTotal / numPer

    for (let index = 0; index < numSegments; index++) {
        let start = range[0] + (numPer * index)
        let finish = range[0] + (numPer * (index + 1)) - 1

        if (finish > range[1]) finish = range[1]

        let setColor = color[index % color.length]
        setColor = [Math.round((setColor[0] / 360) * 1000) / 1000, Math.round(setColor[1] * 1000) / 1000, Math.round(setColor[2] * 1000) / 1000]

        let compiledInstruction = [
            "range",
            [start, finish],
            setColor
        ]

        insertData(frame, compiledInstruction)
    }

    console.log(`${chalk.gray("[~]")} Segmented pixels ${range[0]} to ${range[1]} into ${color.length} colors at frame ${frame}!`)
}

function trail(instruction) {
    let range = instruction.range
    let color = instruction.color
    let life = instruction.life
    let frame = instruction.frame

    let totalLength = (range.end - range.start) + 1
    let duration = (frame.end - frame.start) + 1

    let changePerFrame = totalLength / duration

    for (let index = 0; index <= (duration - 1); index++) { 
        let start = Math.round(range.start + (changePerFrame * index))
        let end = Math.round((start + changePerFrame) - 1)

        let compiledInstruction = [
            "range",
            [start, end],
            [
                toByte(color.hue / 360),
                toByte(color.saturation / 100),
                toByte(color.value / 100)
            ]
        ]

        insertData(frame.start + index, compiledInstruction)

        if (life != 0) {
            // Decay here
        }
    }

    console.log(`${chalk.gray("[~]")} Trailed pixels ${range.start} to ${range.end} to (${color.hue}, ${color.saturation}, ${color.value}) with a life of ${life} between frame ${frame.start} and ${frame.end}!`)
}

let filePath = __dirname + `/public/shows/${show}`
let fileList = fs.readdirSync(filePath + "/raw")
let sections = []

fileList.forEach((section) => {
    sections.push(section.split(".")[0])
})

sections.forEach((section) => {
    console.log(chalk.yellow(`[=] Compiling ${chalk.underline(section)}`))

    let data = fs.readFileSync(filePath + `/raw/${section}.json`, "utf-8")
    data = JSON.parse(data)

    frameData = {}

    data.forEach((instruction) => {
        if (instruction.type == "set") set(instruction)
        if (instruction.type == "transform") transform(instruction)
        if (instruction.type == "segment") segment(instruction)
        if (instruction.type == "trail") trail(instruction)
    })

    frameData = JSON.stringify(frameData)

    fs.mkdirSync(filePath + `/compiled/${section}`, { recursive: true })
    fs.writeFileSync(filePath + `/compiled/${section}/compact.json`, frameData)

    console.log(`${chalk.green("[+]")} Done Compiling ${chalk.underline(section)}`)
})