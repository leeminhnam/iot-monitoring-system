const SensorData = require('../models/sensorData');

const getSensorDataService = async ({ startTime, endTime, time, sensorType, value }, page = 1, limit = 10) => {
  const query = {};

  if (startTime || endTime) {
    query.time = {};
    if (startTime) query.time.$gte = new Date(startTime);
    if (endTime) query.time.$lte = new Date(endTime);
  } else if (time) {
    const parsedTime = new Date(time);
    if (!isNaN(parsedTime.getTime())) {
      const nextDay = new Date(parsedTime);
      nextDay.setDate(nextDay.getDate() + 1);
      query.time = { $gte: parsedTime, $lt: nextDay };
    }
  }

  if (sensorType) {
    query.sensorType = sensorType;
  }

  if (value) {
    query.value = Number(value);
  }

  const skip = (page - 1) * limit;

  const data = await SensorData.find(query)
    .sort({ time: -1 })
    .skip(skip)
    .limit(limit);

  const total = await SensorData.countDocuments(query);

  return {
    data,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };
};

const getLatestSensorDataService = async () => {
  const data = await SensorData.findOne().sort({ time: -1 });
  return data;
};

module.exports = { getSensorDataService, getLatestSensorDataService };