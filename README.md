# Function

A detailed explanation of how every aspect of the show works.

## Show
The host at the superstation will send an initial frame buffer `(Default: 150)` to each substation handler to account for any extra delay during Run of Show (ROS) distribution, also known as compiled frameData.

Compiled frameData is distrobuted in chunks starting as soon as the `play` instruction is recieved. Chunks of frames `(Default: 150)` are sent to substation handers over a WiFi connection. The `play` command is sent over a 18/3 Universal Asynchronous Receiver/Transmitter (UART) cable to each daisy chained substation handler.

<hr/>

# Structure

JSON format for how the show data should be written.

## Raw
<details><summary>View Types</summary>

**Set**
```
{
    "details": { "name": "", "color": "" },
    "type": "set",
    "range": {"start": 0, "end": 0},
    "color":  {"hue": 0, "saturation": 0, "value": 0},
    "frame": 0
}
```

**Transform**
```
{
    "details": { "name": "", "color": "" },
    "type": "transform",
    "range": {"start": 0, "end": 0},
    "color": {
        "start": {"hue": 0, "saturation": 0, "value": 0},
        "end": {"hue": 0, "saturation": 0, "value": 0}
    }
    "frame": {"start": 0, "end": 0}
}
```
</details>

## Frame Data
<details><summary>View Types</summary>

**Range**
```
[
    "range",
    [0, 0] // Pixel [start, end]
    [0, 0, 0] // Color [hue, saturation, value]
]
```

List *(Currently Unused)*
```
[
    "list",
    [0, 0, ...] // Pixel list
    [0, 0, 0] // Color [hue, saturation, value]
]
```
</details>

<hr/>