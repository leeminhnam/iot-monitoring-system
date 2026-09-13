#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>

// WIFI
const char* WIFI_SSID = "leeminhnam";
const char* WIFI_PASSWORD = "leeminhnam";

// MQTT
const char* MQTT_SERVER = "10.106.124.117";
const int MQTT_PORT = 1883;

const char* TOPIC_SENSOR   = "sensor_data";
const char* TOPIC_CONTROL  = "device_control";
const char* TOPIC_RESPONSE = "device_response";

// SENSOR
#define DHT_PIN D1
#define LM393_PIN A0
#define DHT_TYPE DHT11

DHT dht(DHT_PIN, DHT_TYPE);

// MQTT
WiFiClient espClient;
PubSubClient mqttClient(espClient);

// HÀM KHÁC
void setupSensors();
void readSensors();

void setupLeds();

void handleLedControl(
  char* topic,
  byte* payload,
  unsigned int length
);

void publishLedStatus();

// SETUP
void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println();
  Serial.println("ESP8266 START");

  setupSensors();

  setupLeds();

  // WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  Serial.print("Connecting WiFi");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.println("WiFi connected");

  Serial.print("IP: ");
  Serial.println(WiFi.localIP());

  // MQTT
  mqttClient.setServer(MQTT_SERVER, MQTT_PORT);
  mqttClient.setCallback(handleLedControl);
}

// MQTT RECONNECT
void reconnectMQTT() {
  while (!mqttClient.connected()) {

    Serial.print("Connecting MQTT... ");

    String clientId = "ESP8266-";
    clientId += String(ESP.getChipId());

    if (mqttClient.connect(clientId.c_str())) {
      Serial.println("connected");

      mqttClient.subscribe(TOPIC_CONTROL);

      Serial.print("Subscribed: ");
      Serial.println(TOPIC_CONTROL);

    } else {
      Serial.print("failed, rc=");
      Serial.println(mqttClient.state());

      delay(2000);
    }
  }
}

// LOOP
void loop() {
  if (!mqttClient.connected()) {
    reconnectMQTT();
  }

  mqttClient.loop();

  readSensors();

  delay(2000);
}
