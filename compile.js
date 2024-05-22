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

function set(instruction) {
    let range = instruction.range
    let color = instruction.color
    let frame = instruction.frame

    if (Array.isArray(range)) {
        let compiledInstruction = [
            "range",
            range,
            [Math.round((color[0] / 360) * 1000) / 1000, color[1], color[2]]
        ]

        insertData(frame, compiledInstruction)
    }

    console.log(`${chalk.gray("[~]")} Set pixels ${range[0]} to ${range[1]} to (${color}) at frame ${frame}!`)
}

function transform(instruction) {
    let range = instruction.range
    let color = instruction.color
    let frame = instruction.frame

    let hChange = color[1][0] - color[0][0]
    let sChange = color[1][1] - color[0][1]
    let vChange = color[1][2] - color[0][2]

    let duration = frame[1] - frame[0]

    for (let index = 0; index <= duration; index++) {
        let setColor = [
            Math.round(((color[0][0] + ((index / duration) * hChange)) / 360) * 1000) / 1000,
            Math.round((color[0][1] + ((index / duration) * sChange)) * 1000) / 1000,
            Math.round((color[0][2] + ((index / duration) * vChange)) * 1000) / 1000
        ]
        
        let compiledInstruction = [
            "range",
            range,
            setColor
        ]

        insertData(frame[0] + index, compiledInstruction)
    }

    console.log(`${chalk.gray("[~]")} Transformed pixels ${range[0]} to ${range[1]} to from (${color[0]}) to (${color[1]}) at between frame ${frame[0]} and ${frame[1]}!`)
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

let filePath = __dirname + `/shows/${show}`
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
    })

    frameData = JSON.stringify(frameData)

    fs.mkdirSync(filePath + `/compiled/${section}`, { recursive: true })
    fs.writeFileSync(filePath + `/compiled/${section}/compact.json`, frameData)

    console.log(`${chalk.green("[+]")} Done Compiling ${chalk.underline(section)}`)
})