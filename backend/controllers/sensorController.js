const asyncHandler = require("../utils/asyncHandler");
const { getSensorDataService, getLatestSensorDataService, getChartDataService } = require('../services/sensorService');

const getSensorData = asyncHandler(async (req, res) => {
  const { startTime, endTime, time, sensorType, value, page, limit, sortBy, sortOrder } = req.query;

  const result = await getSensorDataService(
    { startTime, endTime, time, sensorType, value },
    parseInt(page) || 1,
    parseInt(limit) || 10,
    { sortBy, sortOrder }
  );

  return res.json(result);
});

const getLatestSensorData = asyncHandler(async (req, res) => {
  const data = await getLatestSensorDataService();

  return res.json(data);
});

const getChartData = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const result = await getChartDataService(limit);

  return res.json(result);
});

module.exports = {
  getSensorData, getLatestSensorData, getChartData
};
