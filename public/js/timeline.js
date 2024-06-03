let showData

let currentStep
let currentColor

let startRender = 0
let endRender = 150

function sortLayers(instructions) {
    let layers = []

    function collision(layer, start) {
        let canPlace = true
        if (!layers[layer]) layers[layer] = []
        layers[layer].forEach(obstacle => {
            if (obstacle.start <= start && start < obstacle.end) canPlace = false
        })
        
        if (canPlace) return false
        return true
    }  

    let index = 0
    instructions.forEach(step => {
        let layer = 1

        while (collision(String(layer), step.frame.start)) layer++

        layers[layer].push({"start": step.frame.start, "end": step.frame.end})
        instructions[index]["details"]["layer"] = layer

        index++
    })

    return instructions
}

function orderInstructions(instructions) {
    return instructions.sort((a, b) => a.frame.start - b.frame.start)
}

function loadLayers(section, instructions) {
    let sectionDiv = document.getElementById(section)

    let layers = sectionDiv.getElementsByClassName("layer")

    for (let index = 0; index < layers.length; index++) {
        layers[index].innerHTML = ""
    }

    document.getElementById("startRender").value = startRender
    document.getElementById("endRender").value = endRender

    let index = 0
    instructions.forEach(step => {
        let stepClone = document.getElementById("clone").getElementsByClassName("step")[0].cloneNode(true)
        stepClone.id = index
        stepClone.style.left = `${(step.frame.start / endRender) * 100}%`
        stepClone.style.width = `${((step.frame.end - step.frame.start) / endRender) * 100}%`
        stepClone.innerHTML = step.details.name
        stepClone.classList.add(step.details.color)
        sectionDiv.getElementsByClassName("layer")[step.details.layer - 1].appendChild(stepClone)

        index++
    })
}

function test() {
    let order = orderInstructions([
        {
            "details": { "name": "Test 1", "color": "red" },
            "type": "transform",
            "range": {"start": 1, "end": 500},
            "color": [[0, 0, 1], [0, 0, 0.25]],
            "frame": {"start": 18, "end": 50}
        },
        {
            "details": { "name": "Test 2", "color": "blue" },
            "type": "transform",
            "range": {"start": 1, "end": 500},
            "color": [[0, 0, 0.5], [0, 0, 0.1]],
            "frame": {"start": 51, "end": 60}
        },
        {
            "details": { "name": "Test 3", "color": "purple" },
            "type": "transform",
            "range": {"start": 1, "end": 500},
            "color": [[0, 0, 0.5], [0, 0, 0.1]],
            "frame": {"start": 61, "end": 80}
        },
        {
            "details": { "name": "Test 4", "color": "green" },
            "type": "transform",
            "range": {"start": 1, "end": 500},
            "color": [[0, 0, 0.25], [0, 0, 0.1]],
            "frame": {"start": 81, "end": 100}
        },
        {
            "details": { "name": "Test 5", "color": "yellow" },
            "type": "transform",
            "range": {"start": 1, "end": 500},
            "color": {"start": [0, 0, 0.25], "end": [0, 0, 0.1]},
            "frame": {"start": 101, "end": 115}
        }
    ])

    showData = sortLayers(order)

    loadLayers("section1", showData)
}

function update(change) {
    if (change) {
        index = Number(currentStep.id)
        showData[index].details.name = document.getElementById("name").value
    
        showData[index].frame.start = Number(document.getElementById("start").value)
        showData[index].frame.end = Number(document.getElementById("end").value)
    }

    let order = orderInstructions(showData)
    showData = sortLayers(order)

    if (currentStep) currentStep.classList.remove("current")
    currentStep = null
    if (currentColor) currentColor.classList.remove("current")
    currentColor = null
    document.getElementById("editor").classList.add("hidden")
    document.getElementById("colors").classList.add("hidden")

    document.getElementById("editor").innerHTML = `<div class="subsection"><div id="id">Index ID</div><input id="name" type="text" placeholder="Name"></div><div class="subsection"><input id="start" type="text" placeholder="Start"><input id="end" type="text" placeholder="End"><input id="length" type="text" placeholder="Length"></div><button id="update" onclick="update(true)">Update</button>`
    
    loadLayers("section1", showData)
}

function render() {
    endRender = Number(document.getElementById("endRender").value)
    console.log("here")
    update()
}

function duplicate() {
    if (!currentStep) return
    showData.push(showData[Number(currentStep.id)])
    showData = JSON.parse(JSON.stringify(showData))
    update()
}

document.addEventListener('DOMContentLoaded', (event) => {
    function handleClick(event) {
        if (event.target.classList.contains('step')) {
            if (currentStep) currentStep.classList.remove("current")
            if (currentStep == event.target) {
                currentStep.classList.remove("current")
                currentStep = null
                currentColor.classList.remove("current")
                currentColor = null
                document.getElementById("editor").classList.add("hidden")
                document.getElementById("colors").classList.add("hidden")
                return
            }

            currentStep = event.target
            currentStep.classList.add("current")
            document.getElementById("editor").classList.remove("hidden")
            document.getElementById("colors").classList.remove("hidden")

            if (currentColor) currentColor.classList.remove("current")
            currentColor = document.getElementById(showData[Number(currentStep.id)].details.color)
            currentColor.classList.add("current")

            document.getElementById("id").innerHTML = Number(currentStep.id)
            document.getElementById("name").value = showData[Number(currentStep.id)].details.name

            document.getElementById("start").value = showData[Number(currentStep.id)].frame.start
            document.getElementById("end").value = showData[Number(currentStep.id)].frame.end
            document.getElementById("length").value = document.getElementById("end").value - document.getElementById("start").value
        }

        if (event.target.classList.contains('color')) {
            if (currentColor) currentColor.classList.remove("current")
            console.log('Clicked element:', event.target);
            currentColor = event.target
            currentColor.classList.add("current")

            currentStep.className = "step current"
            currentStep.classList.add(currentColor.id)

            showData[Number(currentStep.id)].details.color = currentColor.id
        }
    }
    document.body.addEventListener('click', handleClick)
})

document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        document.activeElement.blur()
    }
})