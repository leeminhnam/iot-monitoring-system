const SensorData = require('../models/sensorData');

const getSensorDataService = async ({ time, sensorType, value }, page = 1, limit = 10) => {
  const query = {};
  const exprConditions = [];

  if (time) {
    exprConditions.push({
      $regexMatch: {
        input: {
          $dateToString: {
            format: "%d/%m/%Y %H:%M:%S",
            date: "$time",
            timezone: "Asia/Ho_Chi_Minh"
          }
        },
        regex: time,
        options: "i"
      }
    });
  }

  if (sensorType) {
    query.sensorType = sensorType;
  }

  if (value) {
    exprConditions.push({
      $regexMatch: {
        input: { $toString: "$value" },
        regex: value,
        options: "i"
      }
    });
  }

  if (exprConditions.length > 0) {
    query.$expr = { $and: exprConditions };
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

module.exports = {
  getSensorDataService, getLatestSensorDataService
};