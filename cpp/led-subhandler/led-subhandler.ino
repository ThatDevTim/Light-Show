#include <WiFi.h>
#include <WebServer.h>
#include <FastLED.h>
#include <ArduinoJson.h>

#define NUM_LEDS 256        // Number of LEDs in the strip
#define DATA_PIN 3          // Data pin where the strip is connected
#define LED_TYPE WS2812B    // Type of LED strip
#define COLOR_ORDER GRB     // Color order of the LED strip
#define BRIGHTNESS 10       // Brightness level (0-255)

const char* ssid = "ShowPoint";        // Wi-Fi SSID
const char* password = "6802Point"; // Wi-Fi password

String hostname = "ESP-32"; // Define a Hostname

CRGB leds[NUM_LEDS];        // Array of LED color data
WebServer server(80);       // Create a web server object that listens for HTTP request on port 80

bool playing = false;

unsigned long frame = 1;          // Current frame to render
unsigned long lastUpdateTime = 0; // Timestamp of last LED update
const int updateInterval = 1000 / 30;    // Interval at which to update the LEDs (milliseconds)

DynamicJsonDocument frameBuffer(10240); // Adjust size based on expected JSON size

void setup() {
  Serial.begin(115200);

  FastLED.addLeds<LED_TYPE, DATA_PIN, COLOR_ORDER>(leds, NUM_LEDS).setCorrection(TypicalLEDStrip);
  FastLED.setBrightness(BRIGHTNESS);

  // Connect to Wi-Fi
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  WiFi.setHostname(hostname.c_str()); // Set the Hostname
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.println("WiFi connected.");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());

  // POST endpoint for receiving data
  server.on("/frames", HTTP_POST, []() {
    Serial.println("Received!");
    if (!server.hasArg("plain")) {
      server.send(400, "text/plain", "Bad Request: Body not found");
      return;
    }

    DynamicJsonDocument newFrames(3072);
    DeserializationError error = deserializeJson(newFrames, server.arg("plain"));
    if (error) {
      server.send(500, "text/plain", "Bad Request: JSON parsing failed");
      return;
    }

    // Assuming newFrames is a JSON object
    JsonObject obj = newFrames.as<JsonObject>();

    // Merge new data into the global JSON object
    for (auto kvp : obj) {
      frameBuffer[kvp.key()] = kvp.value();
    }

    // Uncomment to debug print the entire frame buffer
    // Serial.println("Frame Buffer Object:");
    // serializeJsonPretty(frameBuffer, Serial);

    server.send(200, "text/plain", "Data received!");
  });

  server.on("/settings", HTTP_POST, []() {
    Serial.println("Received!");
    if (!server.hasArg("plain")) {
      server.send(400, "text/plain", "Bad Request: Body not found");
      return;
    }

    DynamicJsonDocument settings(3072);
    DeserializationError error = deserializeJson(settings, server.arg("plain"));
    if (error) {
      server.send(500, "text/plain", "Bad Request: JSON parsing failed");
      return;
    }

    JsonObject obj = settings.as<JsonObject>();

    if (obj["brightness"]) {
      uint8_t newBrightness = obj["brightness"].as<uint8_t>();
      FastLED.setBrightness(newBrightness);
    }

    server.send(200, "text/plain", "Data received!");
  });

  // GET endpoint for simple test
  server.on("/buffer", HTTP_GET, []() {
    String responseData;
    serializeJson(frameBuffer, responseData); // Serialize the global data to a string
    server.send(200, "application/json", responseData); // Send the global data as JSON
  });

  server.on("/restart", HTTP_GET, []() {
    frame = 1;
    server.send(200);
  });

  server.on("/play", HTTP_GET, []() {
    playing = !playing;
    Serial.println("Playing: " + String(playing));

    server.send(200);
  });

  server.begin(); // Start server
  Serial.println("HTTP server started");
}

void loop() {
  server.handleClient();

  if (playing == false) return;

  unsigned long currentTime = millis();
  if (currentTime - lastUpdateTime >= updateInterval) {
    
    if (frameBuffer.containsKey(String(frame))) {
      JsonVariant value = frameBuffer[String(frame)];

      // serializeJson(value, Serial);
      // Serial.println();

      for (int index = 0; index < value.size(); index++) {
        JsonVariant instruction = value[index];

        String type = instruction[0].as<String>();
        JsonVariant range = instruction[1];
        JsonVariant color = instruction[2];

        uint8_t hue = color[0].as<float>() * 255;
        uint8_t saturation = color[1].as<float>() * 255;
        uint8_t value = color[2].as<float>() * 255;

        // serializeJson(instruction, Serial);
        // Serial.println();

        if (type == "range") {
          unsigned int start = range[0].as<unsigned int>() - 1;
          unsigned int finish = range[1].as<unsigned int>() - 1; 
          // Serial.println(start);
          // Serial.println(finish);

          for (int pixel = start; pixel <= finish; pixel++) {
            leds[pixel] = CHSV(hue, saturation, value);
          }
        }
      }

      FastLED.show();  // Update the LEDs
    }

    unsigned long elapsedTime = millis() - currentTime; // Calculate elapsed time for the update
    lastUpdateTime = currentTime; // Update the last update time to current time before delay calculation

    if (frameBuffer.containsKey(String(frame))) {
      Serial.println("Rendered frame " + String(frame) + " in " + String(elapsedTime) + "ms");

      frameBuffer.remove(String(frame));
    }

    frame++; // Move to the next frame
  }
}
