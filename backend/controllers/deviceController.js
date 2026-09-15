const asyncHandler = require("../utils/asyncHandler");
const { getDevicesWithStatusService, toggleDeviceService } = require("../services/deviceService");

const getDevicesWithStatus = asyncHandler(async (req, res) => {
  const result = await getDevicesWithStatusService();
  
  return res.json(result);
});

const toggleDevice = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { action } = req.body;
  const userId = req.user.id;

  const newAction = await toggleDeviceService(id, action, userId);
  if (!newAction) {
    return res.status(404).json({ message: "Không tìm thấy thiết bị" });
  }

  return res.json({ message: "Đang thực hiện hành động", action: newAction });
});

module.exports = {
  getDevicesWithStatus, toggleDevice
};
