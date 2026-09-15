const Device = require('../models/device');
const Action = require('../models/action');
const { publishControl } = require('./mqttService');
const { getIo } = require('./socketService');

const getDevicesWithStatusService = async () => {
  const devices = await Device.find();
  const result = [];

  for (let device of devices) {
    const lastAction = await Action.findOne({
      deviceId: device._id,
      status: { $in: ["success", "on", "off"] }
    }).sort({ time: -1 });

    let currentStatus = "off";
    if (lastAction) {
      if (lastAction.status === "on" || lastAction.action === "turn_on") currentStatus = "on";
      if (lastAction.status === "off" || lastAction.action === "turn_off") currentStatus = "off";
    }

    result.push({
      _id: device._id,
      id: device.id,
      name: device.name,
      status: currentStatus
    });
  }

  return result;
};

const toggleDeviceService = async (deviceId, action, userId) => {
  const device = await Device.findById(deviceId);
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

  // Emit action_update cho frontend
  const io = getIo();
  if (io) {
    const populatedAction = await Action.findById(newAction._id).populate('deviceId', 'name');
    io.emit("action_update", populatedAction);
  }

  const allDevices = await Device.find();
  const controlPayload = {};

  for (let d of allDevices) {
    if (d._id.toString() === device._id.toString()) {
      controlPayload[d.id] = action === "turn_on" ? "ON" : "OFF";
      controlPayload[d.id + ":" + (action === "turn_on" ? "ON" : "OFF")] = true;
    } else {
      const last = await Action.findOne({ deviceId: d._id, status: { $in: ["success", "on", "off"] } }).sort({ time: -1 });
      let st = "OFF";
      if (last && (last.action === "turn_on" || last.status === "on")) st = "ON";
      controlPayload[d.id] = st;
    }
  }

  publishControl(controlPayload);

  return newAction;
};

module.exports = {
  getDevicesWithStatusService,
  toggleDeviceService
};
