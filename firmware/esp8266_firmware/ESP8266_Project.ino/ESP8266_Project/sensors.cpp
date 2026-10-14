#include <Arduino.h>
#include <Wire.h>
#include <BH1750.h>
#include <DHT.h>
#include <PubSubClient.h>

// DHT từ file chính
extern DHT dht;

// MQTT từ file chính
extern PubSubClient mqttClient;

// MQTT topic
extern const char* TOPIC_SENSOR;

// Khởi tạo đối tượng cảm biến BH1750
BH1750 lightMeter;

// SETUP
void setupSensors() {
  // ESP8266 mặc định: D2 = SDA, D1 = SCL
  Wire.begin(D2, D1);

  // Khởi động BH1750
  if (lightMeter.begin(BH1750::CONTINUOUS_HIGH_RES_MODE)) {
    Serial.println("BH1750 initialized successfully");
  } else {
    Serial.println("Error initializing BH1750! Check wiring (D1/D2)");
  }

  dht.begin();
  Serial.println("Sensors initialized");
}

// READ SENSOR
void readSensors() {
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();

  // Đọc cường độ ánh sáng thực tế theo đơn vị Lux (0 - 65535 lx)
  float lux = lightMeter.readLightLevel();

  // Độ mưa giả lập ngẫu nhiên 0 - 100%
  int rain = random(0, 101);

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
  data += String(lux, 1); // Trả về số thực Lux

  data += ",\"rain\":";
  data += String(rain);
  data += "}";

  Serial.print("Sensor data: ");
  Serial.println(data);

  mqttClient.publish(
    TOPIC_SENSOR,
    data.c_str()
  );
}