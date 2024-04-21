const fs = require("fs")

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
        console.log(`[+] Setting pixels ${range[0]} to ${range[1]} to (${color}) at frame ${frame}`)

        let compiledInstruction = [
            "range",
            range,
            [color[0] / 360, color[1], color[2]]
        ]

        insertData(frame, compiledInstruction)
    }
}

// for (let index = range[0]; index <= range[1]; index++) {
//     console.log(index)
// }

function transform(instruction) {
    let range = instruction.range
    let color = instruction.color
    let frame = instruction.frame
}

function segment(instruction) {
    let range = instruction.range
    let color = instruction.color
    let frame = instruction.frame

    let numTotal = (range[1] - range[0]) + 1
    console.log(numTotal)
    let numPer = instruction.length || numTotal / color.length
    console.log(numPer)
    let numSegments = numTotal / numPer

    for (let index = 0; index < numSegments; index++) {
        let start = range[0] + (numPer * index)
        let finish = range[0] + (numPer * (index + 1)) - 1

        if (finish > range[1]) finish = range[1]

        let setColor = color[index % color.length]
        setColor = [setColor[0] / 360, setColor[1], setColor[2]]

        let compiledInstruction = [
            "range",
            [start, finish],
            setColor
        ]

        insertData(frame, compiledInstruction)
    }
}

// Compile Show
let filePath = __dirname + `/Shows/${show}`
let fileList = fs.readdirSync(filePath + "/raw")

fileList.forEach((section) => {
    console.log(`[=] Compiling ${section}`)

    let data = fs.readFileSync(filePath + `/raw/${section}`, "utf-8")
    data = JSON.parse(data)

    frameData = {}

    data.forEach((instruction) => {
        if (instruction.type == "set") set(instruction)
        if (instruction.type == "transform") transform(instruction)
        if (instruction.type == "segment") segment(instruction)
    })

    // After compiling all instruction in a section, write it to a json file with the same name in the /compiled directory
    frameData = JSON.stringify(frameData,)
    fs.writeFileSync(filePath + `/compiled/${section}`, frameData)

    console.log(`[+] Done Compiling ${section}`)
})

console.log(frameData)