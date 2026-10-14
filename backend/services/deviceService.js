const Device = require('../models/device');
const Action = require('../models/action');
const { publishControl } = require('./mqttService');
const { getIo } = require('./socketService');

const getDevicesWithStatusService = async () => {
  const devices = await Device.find().sort({ id: 1 });

  const result = await Promise.all(devices.map(async (device) => {
    const latestAction = await Action.findOne({
      deviceId: device._id
    }).sort({ time: -1 });

    const lastSuccessAction = await Action.findOne({
      deviceId: device._id,
      status: { $in: ["success"] }
    }).sort({ time: -1 });

    let currentStatus = "off";
    if (lastSuccessAction) {
      if (lastSuccessAction.action === "turn_on") currentStatus = "on";
      if (lastSuccessAction.action === "turn_off") currentStatus = "off";
    }

    const TIMEOUT_PENDING_MS = 5000;
    let isPending = false;
    let pendingAction = null;

    if (latestAction && latestAction.status === "pending") {
      const elapsed = Date.now() - new Date(latestAction.time).getTime();
      if (elapsed <= TIMEOUT_PENDING_MS) {
        isPending = true;
        pendingAction = latestAction.action;
      } else {
        latestAction.status = "failed";
        await latestAction.save();
      }
    }

    return {
      _id: device._id,
      id: device.id,
      name: device.name,
      status: isPending ? "pending" : currentStatus,
      previousStatus: currentStatus,
      pendingAction: pendingAction,
      loading: isPending
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
    const populatedAction = {
      ...newAction.toObject(),
      deviceId: { _id: device._id, name: device.name }
    };
    io.emit("action_update", populatedAction);
    io.emit("device_update", {
      id: device.id,
      _id: device._id,
      status: "pending",
      pendingAction: action,
      loading: true
    });
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

          const lastSuccess = await Action.findOne({ deviceId: device._id, status: { $in: ["success"] } }).sort({ time: -1 });
          const prevStatus = (lastSuccess && lastSuccess.action === "turn_on") ? "on" : "off";
          io.emit("device_update", {
            id: device.id,
            _id: device._id,
            status: prevStatus,
            loading: false,
            error: `Không nhận được phản hồi từ ${device.name || 'thiết bị'}`
          });
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