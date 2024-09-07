# Function

A detailed explanation of how every aspect of the show works.

## Show
The host at the superstation will send an initial frame buffer `(default: 150)` to each substation handler to account for any extra delay during Run of Show (ROS) distribution, also known as compiled frameData.

Compiled frameData is distrobuted in chunks starting as soon as the `play` instruction is recieved. Chunks of frames `(default: 150)` are sent to substation handers over a WiFi connection. The `play` command is sent over a 18/3 Universal Asynchronous Receiver/Transmitter (UART) cable to each daisy chained substation handler.

<hr/>

# Structure

JSON format for how the show data should be written.

`range` is an abject consisting  of a `start` and `end` that are positive integers and represent the pixels the step will affect.

Inside `color` objects, `hue` is a positive integer between `0` and `360`, `saturation` and `value` is an positive integer between `0` and `100`.

If a step only takes place in one frame, the `frame` value will be a positive integer. If a step takes place over more than one frame, `frame` will be an object

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

**Segment**

`length` takes a positive integer value. If `length` is not present or set to `0`, the pixels will be divided into the number of items in the `color` array.
```
{
    "details": { "name": "", "color": "" },
    "type": "segment",
    "range": {"start": 0, "end": 0},
    "length": 0,
    "color": [
        {"hue": 0, "saturation": 0, "value": 0},
        {"hue": 0, "saturation": 0, "value": 0},
        ...
    ],
    "frame": 0
}
```

**Trail**

`life` takes a number of frames represented as a positive integer value. If `life` is not present or set to `0`, the life will be assumed to be `infinite` and pixels will not revert to black. `decay` is a positive integer between `0` and `100` that represents the fraction of the `life` in which the pixels will start to decay. If `decay` is set to `100`, the color will start to fade immediately; if set to `0` the pixels will not fade and disapear after their lifespan.
```
{
    "details": { "name": "", "color": "" },
    "type": "trail",
    "range": {"start": 0, "end": 0},
    "life": 0,
    "decay": 0,
    "reverse": false,
    "color": {"hue": 0, "saturation": 0, "value": 0},
    "frame": {"start": 0, "end": 0}
}
```

**Twinkle**

`life` takes a number of frames represented as a positive integer value. If `life` is not present or set to `0`, the life will be assumed to be `infinite` and pixels will not revert to black. `decay` is a positive integer between `0` and `100` that represents the fraction of the `life` in which the pixels will start to decay. If `decay` is set to `100`, the color will start to fade immediately; if set to `0` the pixels will not fade and disapear after their lifespan. `rate` is a positive integer value that represents the number of new twinkles per frame.
```
{
    "details": { "name": "", "color": "" },
    "type": "twinkle",
    "range": {"start": 0, "end": 0},
    "life": 0,
    "decay": 0,
    "rate": 0,
    "color": {"hue": 0, "saturation": 0, "value": 0},
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

**List** *(Currently Unused)*
```
[
    "list",
    [0, 0, ...] // Pixel list
    [0, 0, 0] // Color [hue, saturation, value]
]
```
</details>

<hr/>