const mqtt = require("mqtt");
const SensorData = require("../models/sensorData");
const Sensor = require("../models/sensor");
const Device = require("../models/device");
const Action = require("../models/action");
const { getIo } = require("./socketService");

const TOPIC_SENSOR = "sensor_data";
const TOPIC_CONTROL = "device_control";
const TOPIC_RESPONSE = "device_response";

let client;
let sensorCache = {};

const SENSOR_TYPE_MAP = {
  temperature: "DHT11",
  humidity: "DHT11",
  light: "BH1750"
};

const initMqtt = async () => {
  const sensors = await Sensor.find();
  if (sensors.length === 0) {
    console.warn("Không tìm thấy cảm biến nào trong CSDL. Hãy chạy script resetDatabase trước.");
  }
  for (let sensor of sensors) {
    sensorCache[sensor.name] = sensor._id;
  }

  const devices = await Device.find();
  if (devices.length === 0) {
    console.warn("Không tìm thấy thiết bị nào trong CSDL. Hãy chạy script resetDatabase trước.");
  }

  const mqttServer = process.env.MQTT_SERVER;
  client = mqtt.connect(mqttServer, {
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD
  });

  client.on("connect", () => {
    console.log("Đã kết nối tới MQTT Broker tại", mqttServer);
    client.subscribe(TOPIC_SENSOR);
    client.subscribe(TOPIC_RESPONSE);
  });

  client.on("message", async (topic, message) => {
    try {
      const payloadStr = message.toString();
      const data = JSON.parse(payloadStr);

      if (topic === TOPIC_SENSOR) {
        const currentTime = new Date();
        const commonIdPrefix = Date.now().toString();
        const records = [
          { value: data.temperature, type: "temperature" },
          { value: data.humidity, type: "humidity" },
          { value: data.light, type: "light" }
        ].filter(r => r.value !== undefined);

        const newRecords = await Promise.all(records.map(async (r, i) => {
          return await SensorData.create({
            id: commonIdPrefix + i,
            sensorId: sensorCache[SENSOR_TYPE_MAP[r.type]],
            sensorType: r.type,
            value: r.value,
            time: currentTime
          });
        }));

        const io = getIo();
        if (io) {
          io.emit("sensor_update", {
            temperature: data.temperature,
            humidity: data.humidity,
            light: data.light,
            time: currentTime
          });
          io.emit("sensor_data_new", newRecords);
        }
      }
      else if (topic === TOPIC_RESPONSE) {
        console.log("Phản hồi từ thiết bị:", data);

        const devices = await Device.find();

        await Promise.all(devices.map(async (dev) => {
          const state = data[dev.id];
          if (!state) return;

          const actionStatus = state === "ON" ? "turn_on" : "turn_off";

          const pendingAction = await Action.findOne({
            deviceId: dev._id,
            status: "pending",
            action: actionStatus
          }).sort({ time: -1 });

          if (pendingAction) {
            pendingAction.status = "success";
            await pendingAction.save();

            const populatedAction = {
              ...pendingAction.toObject(),
              deviceId: { _id: dev._id, name: dev.name }
            };

            const io = getIo();
            if (io) {
              io.emit("device_update", {
                id: dev.id,
                _id: dev._id,
                status: state === "ON" ? "on" : "off"
              });
              io.emit("action_update", populatedAction);
            }
          } else {
            const lastAction = await Action.findOne({ deviceId: dev._id, status: { $in: ["success", "on", "off"] } }).sort({ time: -1 });
            let currentDbState = "OFF";
            if (lastAction && (lastAction.action === "turn_on")) {
               currentDbState = "ON";
            }
            if (currentDbState !== state) {
               const User = require("../models/user");
               const defaultUser = await User.findOne();
               if (!defaultUser) {
                 console.warn("Không tìm thấy user mặc định, bỏ qua tạo action");
                 return;
               }
               const newAction = await Action.create({
                 id: Date.now().toString(),
                 userId: defaultUser?._id,
                 deviceId: dev._id,
                 action: state === "ON" ? "turn_on" : "turn_off",
                 status: "success",
                 time: new Date()
               });

               const populatedAction = {
                 ...newAction.toObject(),
                 deviceId: { _id: dev._id, name: dev.name }
               };

               const io = getIo();
               if (io) {
                 io.emit("device_update", {
                   id: dev.id,
                   _id: dev._id,
                   status: state === "ON" ? "on" : "off"
                 });
                 io.emit("action_update", populatedAction);
               }
            }
          }
        }));
      }
    } catch (err) {
      console.error("Lỗi khi xử lý tin nhắn MQTT trên topic", topic, ":", err.message);
    }
  });
};

const publishControl = (payloadObj) => {
  if (client && client.connected) {
    const payload = JSON.stringify(payloadObj);
    client.publish(TOPIC_CONTROL, payload);
    console.log("Đã gửi đến device_control:", payload);
  } else {
    console.warn("Client MQTT chưa kết nối, không thể gửi");
  }
};

module.exports = { initMqtt, publishControl };