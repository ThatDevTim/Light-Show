#include "HardwareSerial.h"

void setup() {
  // Initialize Serial Monitor for debugging
  Serial.begin(115200);
  // Start the hardware serial communication on Serial2
  // Assuming connection to GPIO 16 as RX
  Serial2.begin(115200, SERIAL_8N1, 16, 17); // -1 denotes no TX pin used
}

void loop() {
  if (Serial2.available()) { // Check if there is data to read
    String data = Serial2.readStringUntil('\n'); // Read the data until newline
    Serial.println(data); // Print the data to the Serial Monitor
  }
}
