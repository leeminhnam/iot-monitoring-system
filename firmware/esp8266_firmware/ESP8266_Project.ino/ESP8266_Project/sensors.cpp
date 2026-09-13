#include <Arduino.h>
#include <DHT.h>
#include <PubSubClient.h>

// DHT từ file chính
extern DHT dht;

// MQTT từ file chính
extern PubSubClient mqttClient;

// MQTT topic
extern const char* TOPIC_SENSOR;

// Pin LM393
#define LM393_PIN A0

// SETUP
void setupSensors() {
  dht.begin();

  Serial.println("Sensors initialized");
}

// READ SENSOR
void readSensors() {
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();

  int lightRaw = analogRead(LM393_PIN);

  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("DHT11 read failed");
    return;
  }

  String data = "{";

  data += "\"temperature\":";
  data += String(temperature, 1);

  data += ",\"humidity\":";
  data += String(humidity, 0);

  data += ",\"light\":";
  data += String(lightRaw);

  data += "}";

  Serial.print("Sensor data: ");
  Serial.println(data);

  mqttClient.publish(
    TOPIC_SENSOR,
    data.c_str()
  );
}