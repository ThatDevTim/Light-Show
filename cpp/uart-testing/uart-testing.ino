#include "HardwareSerial.h"

void setup() {
  // Start the hardware serial communication
  // Serial2 default pins are 16 (RX) and 17 (TX) for ESP32
  Serial2.begin(115200, SERIAL_8N1, 16, 17);
}

void loop() {
  // Send a simple message at regular intervals
  Serial2.println("Hello from Sender");
  delay(1000); // Delay for 1 second
}