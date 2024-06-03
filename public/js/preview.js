async function color(color) {
    let data = document.getElementsByClassName("pixel")
    console.log(data)

    let index = 0

    let per = 3

    setInterval(function () {
        for (let done = 0; done < per; done++) {
            for (let count = 0; count < data.length; count++) {
                const element = data[count]
                if (element.id.split("-")[1] == index) element.style.backgroundColor = color
            }
            index++
        }
    }, 0)
}

let playing = true
let fps = 30

let startTime
let lastFrame = 0

let substation1
let substation2

let endFrame

function loop() {
    document.getElementById("audio").play()

    console.log(endFrame)

    let pixels = document.getElementsByClassName("pixel")
    setInterval(() => {
        if (!playing) return

        let now = Date.now()
        let elapsed = now - startTime
        let newFrame = Math.round(elapsed / (1000 / fps))

        if (newFrame == lastFrame) return

        lastFrame = newFrame
        frame = newFrame

        if (frame > endFrame) {
            playing = false
            document.getElementById("audio").pause()
        }

        if (substation1[String(frame)]) {
            let frameData = substation1[String(frame)]
            frameData.forEach(step => {
                if (step[0] == "range") {
                    function inRange(num) {
                        if (num >= step[1][0] && num <= step[1][1]) return true
                        return false
                    }
                    for (let pixel = 0; pixel < pixels.length; pixel++) {
                        let element = pixels[pixel]
                        let split = element.id.split("-")
                        if (split[0] == "substation1") {
                            if (inRange(split[1])) {
                                element.style.backgroundColor = `hsl(${0}, ${step[2][1] * 100}%, ${step[2][2] * 50}%)`
                            }
                        }
                    }
                }
            })
        }

        if (substation2[String(frame)]) {
            let frameData = substation2[String(frame)]
            frameData.forEach(step => {
                if (step[0] == "range") {
                    function inRange(num) {
                        if (num >= step[1][0] && num <= step[1][1]) return true
                        return false
                    }
                    for (let pixel = 0; pixel < pixels.length; pixel++) {
                        let element = pixels[pixel]
                        let split = element.id.split("-")
                        if (split[0] == "substation2") {
                            if (inRange(split[1])) {
                                element.style.backgroundColor = `hsl(${0}, ${step[2][1] * 100}%, ${step[2][2] * 50}%)`
                            }
                        }
                    }
                }
            })
        }
    }, 0)
}

async function load() {
    let data = await (await fetch("/shows/plot.json")).json()
    data.forEach(pixel => {
        let newPixel = document.createElement("div")
        newPixel.id = pixel["id"]
        newPixel.classList = "pixel"
        newPixel.style.left = (pixel["x"] * .5) + "px"
        newPixel.style.top = (pixel["y"] * .5) + "px"
        document.body.appendChild(newPixel)
    })

    endFrame = await (await fetch("/shows/demo/info.json")).json()
    endFrame = endFrame["length"]

    substation1 = await (await fetch("/shows/demo/compiled/section1/compact.json")).json()
    substation2 = await (await fetch("/shows/demo/compiled/section2/compact.json")).json()

    startTime = Date.now()
    // loop()

    //color("hotpink")
}