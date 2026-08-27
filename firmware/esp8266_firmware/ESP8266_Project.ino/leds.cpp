#include <Arduino.h>

// PIN LED
#define LED1_PIN D5
#define LED2_PIN D6
#define LED3_PIN D7

// SETUP
void setupLeds() {
  pinMode(LED1_PIN, OUTPUT);
  pinMode(LED2_PIN, OUTPUT);
  pinMode(LED3_PIN, OUTPUT);

  // Ban đầu tắt
  digitalWrite(LED1_PIN, LOW);
  digitalWrite(LED2_PIN, LOW);
  digitalWrite(LED3_PIN, LOW);

  Serial.println("LED initialized");
}

// LED 1
void setLed1(bool state) {
  digitalWrite(
    LED1_PIN,
    state ? HIGH : LOW
  );

  Serial.print("SET LED1: ");
  Serial.println(state ? "ON" : "OFF");

  Serial.print("D5 GPIO: ");
  Serial.println(
    digitalRead(LED1_PIN) == HIGH
      ? "HIGH"
      : "LOW"
  );
}

// LED 2
void setLed2(bool state) {
  digitalWrite(
    LED2_PIN,
    state ? HIGH : LOW
  );

  Serial.print("SET LED2: ");
  Serial.println(state ? "ON" : "OFF");

  Serial.print("D6 GPIO: ");
  Serial.println(
    digitalRead(LED2_PIN) == HIGH
      ? "HIGH"
      : "LOW"
  );
}

// LED 3
void setLed3(bool state) {
  digitalWrite(
    LED3_PIN,
    state ? HIGH : LOW
  );

  Serial.print("SET LED3: ");
  Serial.println(state ? "ON" : "OFF");

  Serial.print("D7 GPIO: ");
  Serial.println(
    digitalRead(LED3_PIN) == HIGH
      ? "HIGH"
      : "LOW"
  );
}
