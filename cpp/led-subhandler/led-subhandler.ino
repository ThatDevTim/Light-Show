#include <WiFi.h>
#include <HTTPClient.h>
#include <WebServer.h>
#include <FastLED.h>
#include <ArduinoJson.h>
#include "HardwareSerial.h"

#define NUM_LEDS 1000
#define DATA_PIN 13
#define LED_TYPE WS2812B
#define COLOR_ORDER GRB
#define BRIGHTNESS 10

const char* ssid = "ShowPoint";
const char* password = "6802Point";

String hostname = "ESP-32";

CRGB leds[NUM_LEDS];
WebServer server(80);

bool playing = false;

unsigned long frame = 1;
unsigned long lastUpdateTime = 0;
const int updateInterval = 1000 / 30;

DynamicJsonDocument frameBuffer(10240);

void attemptRegister() {
  HTTPClient http;
  http.begin("http://192.168.0.101/register");
  int httpCode = http.GET();
  
  if (httpCode > 0) {
    Serial.println("GET request sent successfully");
  } else {
    Serial.println("Error sending GET request");
    Serial.println(httpCode);
  }
  
  http.end();
}

void setup() {
  Serial.begin(115200);
  Serial2.begin(115200, SERIAL_8N1, 16, 17);

  FastLED.addLeds<LED_TYPE, DATA_PIN, COLOR_ORDER>(leds, NUM_LEDS).setCorrection(TypicalLEDStrip);
  FastLED.setBrightness(BRIGHTNESS);

  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  WiFi.setHostname(hostname.c_str());
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.println("WiFi connected.");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
  Serial.println("MAC address: ");
  Serial.println(WiFi.macAddress());

  server.on("/reboot", HTTP_GET, []() {
    server.send(200, "text/plain", "Rebooting!");
    delay(250);
    ESP.restart();
  });

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

    JsonObject obj = newFrames.as<JsonObject>();

    for (auto kvp : obj) {
      frameBuffer[kvp.key()] = kvp.value();
    }

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
    serializeJson(frameBuffer, responseData);
    server.send(200, "application/json", responseData);
  });

  server.on("/reset", HTTP_GET, []() {
    frame = 1;
    frameBuffer.clear();
    FastLED.clear();
    FastLED.show();
    Serial.println("Buffer cleared and frame set to 1");
    server.send(200);
  });

  server.on("/play", HTTP_GET, []() {
    playing = !playing;
    Serial.println("Playing: " + String(playing));

    server.send(200);
  });

  server.begin();
  Serial.println("HTTP server started");

  attemptRegister();
}

void loop() {
  server.handleClient();

  if (Serial2.available()) {
    String data = Serial2.readStringUntil('\n');

    if (data.startsWith("F-Register")) {
      attemptRegister();
    }
    if (data.startsWith("F-Play")) {
      playing = true;
      Serial.println("Playing");
    }
    if (data.startsWith("F-Pause")) {
      playing = false;
      Serial.println("Paused");
    }
    if (data.startsWith("F-Reset")) {
      playing = false;
      frame = 1;

      frameBuffer.clear();

      FastLED.clear();
      FastLED.show();

      Serial.println("Buffer cleared and frame set to 1");
    }
    Serial.println(data); // Print the data to the Serial Monitor (Pass the message down)
  }

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
