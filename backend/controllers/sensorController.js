const asyncHandler = require("../utils/asyncHandler");
const { getSensorDataService, getLatestSensorDataService } = require('../services/sensorService');

const getSensorData = asyncHandler(async (req, res) => {
  const { startTime, endTime, time, sensorType, value, page, limit } = req.query;
  
  const result = await getSensorDataService(
    { startTime, endTime, time, sensorType, value },
    parseInt(page) || 1,
    parseInt(limit) || 10
  );

  return res.json(result);
});

const getLatestSensorData = asyncHandler(async (req, res) => {
  const data = await getLatestSensorDataService();
  
  return res.json(data);
});

module.exports = { getSensorData, getLatestSensorData };