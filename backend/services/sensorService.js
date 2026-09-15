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

const getChartDataService = async (limit = 50) => {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const rawData = await SensorData.find({ time: { $gte: twentyFourHoursAgo } })
    .sort({ time: 1 })
    .exec();

  const grouped = {};
  rawData.forEach(item => {
    const vnTime = new Date(item.time.getTime() + 7 * 60 * 60 * 1000);
    const timeKey = vnTime.toISOString().substring(0, 16);
    const displayTime = vnTime.toISOString().substring(11, 16); // HH:mm
    if (!grouped[timeKey]) {
      grouped[timeKey] = { time: displayTime, temperature: null, humidity: null, light: null };
    }
    if (item.sensorType === "temperature") grouped[timeKey].temperature = item.value;
    else if (item.sensorType === "humidity") grouped[timeKey].humidity = item.value;
    else if (item.sensorType === "light") grouped[timeKey].light = item.value;
  });

  let result = Object.values(grouped);

  if (result.length > limit) {
    const step = Math.ceil(result.length / limit);
    result = result.filter((_, index) => index % step === 0);
  }

  return result;
};

module.exports = {
  getSensorDataService, getLatestSensorDataService, getChartDataService
};