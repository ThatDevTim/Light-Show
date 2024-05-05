async function getRaw() {
    let data = await fetch("../shows/demo/raw/transform.json")
    let raw = await data.json()
    console.log(raw)
}
