from PIL import Image
import json

def saveJSON(array, file_path):
    with open(file_path, 'w') as file:
        json.dump(array, file, separators=(',', ':'))

def sortX(arr, rev):
    sorted_arr = sorted(arr, key=lambda d: d["x"], reverse=rev)
    return sorted_arr

def sortY(arr, rev):
    sorted_arr = sorted(arr, key=lambda d: d["y"], reverse=rev)
    return sorted_arr

def addID(arr, prefix, count):
    counted = count - 1
    for index, pixel in enumerate(arr):
        pixel["id"] = prefix + str(count + index)
        counted += 1
    return arr, counted

ledCount = 0

def identifyPixels(image_path):
    img = Image.open(image_path)

    img = img.convert("RGB")
    
    pixels = img.load()

    global ledCount
    localCount = 0
    white_pixel_coordinates = []

    for y in range(img.height):
        for x in range(img.width):
            if pixels[x, y] == (255, 255, 255):
                ledCount += 1
                localCount += 1
                white_pixel_coordinates.append({"x": x, "y": y})
    
    print(f"Local white pixels: {localCount}")
    return white_pixel_coordinates

plot = []

json_path = './shows/plot.json'
image_path = './diagrams/arches_1.png'
pixels = identifyPixels(image_path)
sortedPixels = sortX(pixels, True)
pixelID, count = addID(sortedPixels, "substation1-", 1)
plot = plot + pixelID

json_path = './shows/plot.json'
image_path = './diagrams/tree_1.png'
pixels = identifyPixels(image_path)
sortedPixels = sortY(pixels, True)
pixelID, count = addID(sortedPixels, "substation1-", count + 1)
plot = plot + pixelID

json_path = './shows/plot.json'
image_path = './diagrams/arches_2.png'
pixels = identifyPixels(image_path)
sortedPixels = sortX(pixels, True)
pixelID, count = addID(sortedPixels, "substation2-", 1)
plot = plot + pixelID

json_path = './shows/plot.json'
image_path = './diagrams/tree_2.png'
pixels = identifyPixels(image_path)
sortedPixels = sortY(pixels, True)
pixelID, count = addID(sortedPixels, "substation2-", count + 1)
plot = plot + pixelID

json_path = './shows/plot.json'
image_path = './diagrams/window_1_1.png'
pixels = identifyPixels(image_path)
sortedPixels = sortX(pixels, False)
pixelID, count = addID(sortedPixels, "substation3-", 1)
plot = plot + pixelID

json_path = './shows/plot.json'
image_path = './diagrams/window_1_2.png'
pixels = identifyPixels(image_path)
sortedPixels = sortY(pixels, True)
pixelID, count = addID(sortedPixels, "substation3-", count + 1)
plot = plot + pixelID

json_path = './shows/plot.json'
image_path = './diagrams/window_1_3.png'
pixels = identifyPixels(image_path)
sortedPixels = sortX(pixels, True)
pixelID, count = addID(sortedPixels, "substation3-", count + 1)
plot = plot + pixelID

json_path = './shows/plot.json'
image_path = './diagrams/window_2_1.png'
pixels = identifyPixels(image_path)
sortedPixels = sortX(pixels, True)
pixelID, count = addID(sortedPixels, "substation3-", count + 1)
plot = plot + pixelID

json_path = './shows/plot.json'
image_path = './diagrams/window_2_2.png'
pixels = identifyPixels(image_path)
sortedPixels = sortY(pixels, True)
pixelID, count = addID(sortedPixels, "substation3-", count + 1)
plot = plot + pixelID

json_path = './shows/plot.json'
image_path = './diagrams/window_2_3.png'
pixels = identifyPixels(image_path)
sortedPixels = sortX(pixels, False)
pixelID, count = addID(sortedPixels, "substation3-", count + 1)
plot = plot + pixelID

print(f"Total white pixels: {ledCount}")
saveJSON(plot, json_path)
