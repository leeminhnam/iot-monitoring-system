#include <Arduino.h>
#include <PubSubClient.h>

// MQTT
extern PubSubClient mqttClient;

extern const char* TOPIC_RESPONSE;

// LED PIN
#define LED1_PIN D5
#define LED2_PIN D6
#define LED3_PIN D7

// HÀM ĐIỀU KHIỂN
void setLed1(bool state);
void setLed2(bool state);
void setLed3(bool state);

// ĐỌC LED TỪ PHẦN CỨNG
bool readLed1Hardware() {
  return digitalRead(LED1_PIN) == HIGH;
}

bool readLed2Hardware() {
  return digitalRead(LED2_PIN) == HIGH;
}

bool readLed3Hardware() {
  return digitalRead(LED3_PIN) == HIGH;
}

// PUBLISH HARDWARE STATUS
void publishLedStatus() {
  bool led1 = readLed1Hardware();
  bool led2 = readLed2Hardware();
  bool led3 = readLed3Hardware();

  String response = "{";

  response += "\"led1\":\"";
  response += led1 ? "ON" : "OFF";

  response += "\",\"led2\":\"";
  response += led2 ? "ON" : "OFF";

  response += "\",\"led3\":\"";
  response += led3 ? "ON" : "OFF";

  response += "\"}";

  Serial.print("HARDWARE LED STATUS: ");
  Serial.println(response);

  mqttClient.publish(
    TOPIC_RESPONSE,
    response.c_str()
  );
}

// MQTT CALLBACK
void handleLedControl(
  char* topic,
  byte* payload,
  unsigned int length
) {
  String message = "";

  for (unsigned int i = 0; i < length; i++) {
    message += (char)payload[i];
  }

  Serial.println();
  Serial.print("Received topic: ");
  Serial.println(topic);

  Serial.print("Received message: ");
  Serial.println(message);

  // LED 1
  if (message.indexOf("led1:ON") >= 0) {
    setLed1(true);
  }
  else if (message.indexOf("led1:OFF") >= 0) {
    setLed1(false);
  }

  // LED 2
  if (message.indexOf("led2:ON") >= 0) {
    setLed2(true);
  }
  else if (message.indexOf("led2:OFF") >= 0) {
    setLed2(false);
  }

  // LED 3
  if (message.indexOf("led3:ON") >= 0) {
    setLed3(true);
  }
  else if (message.indexOf("led3:OFF") >= 0) {
    setLed3(false);
  }

  // ĐỌC LẠI PHẦN CỨNG
  publishLedStatus();
}
