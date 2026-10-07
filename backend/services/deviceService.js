const Device = require('../models/device');
const Action = require('../models/action');
const { publishControl } = require('./mqttService');
const { getIo } = require('./socketService');

const getDevicesWithStatusService = async () => {
  const devices = await Device.find().sort({ id: 1 });

  const result = await Promise.all(devices.map(async (device) => {
    const lastAction = await Action.findOne({
      deviceId: device._id,
      status: { $in: ["success"] }
    }).sort({ time: -1 });

    let currentStatus = "off";
    if (lastAction) {
      if (lastAction.action === "turn_on") currentStatus = "on";
      if (lastAction.action === "turn_off") currentStatus = "off";
    }

    return {
      _id: device._id,
      id: device.id,
      name: device.name,
      status: currentStatus
    };
  }));

  return result;
};

const toggleDeviceService = async (deviceId, action, userId) => {
  const allDevices = await Device.find();
  const device = allDevices.find(d => d._id.toString() === deviceId.toString());

  if (!device) {
    return null;
  }

  const newAction = new Action({
    id: Date.now().toString(),
    userId: userId,
    deviceId: device._id,
    action: action,
    status: "pending",
    time: new Date()
  });
  await newAction.save();

  const io = getIo();
  if (io) {
    // Tránh query DB để populate, tự tạo object
    const populatedAction = {
      ...newAction.toObject(),
      deviceId: { _id: device._id, name: device.name }
    };
    io.emit("action_update", populatedAction);
  }

  const controlPayload = {};

  await Promise.all(allDevices.map(async (d) => {
    if (d._id.toString() === device._id.toString()) {
      controlPayload[d.id] = action === "turn_on" ? "ON" : "OFF";
      controlPayload[d.id + ":" + (action === "turn_on" ? "ON" : "OFF")] = true;
    } else {
      const last = await Action.findOne({ deviceId: d._id, status: { $in: ["success"] } }).sort({ time: -1 });
      let st = "OFF";
      if (last && (last.action === "turn_on")) st = "ON";
      controlPayload[d.id] = st;
    }
  }));

  // Gửi MQTT ngay sau khi tính toán xong
  publishControl(controlPayload);

  setTimeout(async () => {
    try {
      const checkAction = await Action.findById(newAction._id);
      if (checkAction && checkAction.status === 'pending') {
        checkAction.status = 'failed';
        await checkAction.save();

        const io = getIo();
        if (io) {
          const populatedFailedAction = {
            ...checkAction.toObject(),
            deviceId: { _id: device._id, name: device.name }
          };
          io.emit("action_update", populatedFailedAction);
        }
      }
    } catch (error) {
      console.error("Lỗi khi kiểm tra timeout action:", error);
    }
  }, 5000);

  return newAction;
};

module.exports = {
  getDevicesWithStatusService,
  toggleDeviceService
};