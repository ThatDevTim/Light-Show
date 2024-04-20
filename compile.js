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
            color
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

// Compile Show
let filePath = __dirname + `/Shows/${show}`
let fileList = fs.readdirSync(filePath + "/raw")

fileList.forEach((section) => {
    let data = fs.readFileSync(filePath + `/raw/${section}`, "utf-8")
    data = JSON.parse(data)

    frameData = {}

    data.forEach((instruction) => {
        if (instruction.type == "set") set(instruction)
        if (instruction.type == "transform") transform(instruction)
    })

    // After compiling all instruction in a section, write it to a json file with the same name in the /compiled directory
    frameData = JSON.stringify(frameData,)
    fs.writeFileSync(filePath + `/compiled/${section}`, frameData)
})

console.log(frameData)