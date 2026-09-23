const asyncHandler = require("../utils/asyncHandler");
const { getActionHistoryService } = require('../services/actionService');

const getActionHistory = asyncHandler(async (req, res) => {
  const { time, page, limit, deviceName, status, action } = req.query;
  const result = await getActionHistoryService(
    { time, deviceName, status, action },
    parseInt(page) || 1,
    parseInt(limit) || 10
  );
  return res.json(result);
});

module.exports = { getActionHistory };