const SensorData = require('../models/sensorData');

const getSensorDataService = async ({ time, sensorType, value }, page = 1, limit = 10, sort = {}) => {
  const query = {};
  const exprConditions = [];

  if (time) {
    exprConditions.push({
      $regexMatch: {
        input: {
          $dateToString: {
            format: "%Y/%m/%d %H:%M:%S",
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

  const sortObj = {};
  const allowedSortFields = ['value', 'time', 'sensorType'];
  if (sort.sortBy && allowedSortFields.includes(sort.sortBy)) {
    sortObj[sort.sortBy] = sort.sortOrder === 'asc' ? 1 : -1;
  } else {
    sortObj.time = -1; 
  }

  const data = await SensorData.find(query)
    .sort(sortObj)
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
  const [temperature, humidity, light, rain] = await Promise.all([
    SensorData.findOne({ sensorType: 'temperature' }).sort({ time: -1 }),
    SensorData.findOne({ sensorType: 'humidity' }).sort({ time: -1 }),
    SensorData.findOne({ sensorType: 'light' }).sort({ time: -1 }),
    SensorData.findOne({ sensorType: 'rain' }).sort({ time: -1 })
  ]);

  return [temperature, humidity, light, rain].filter(item => item !== null);
};

const getChartDataService = async (limit = 50) => {
  const rawData = await SensorData.find()
    .sort({ time: -1 })
    .limit(limit * 4)
    .exec();

  const grouped = {};
  rawData.forEach(item => {
    const timeKey = item.time.getTime();
    const vnTime = new Date(item.time.getTime() + 7 * 60 * 60 * 1000);
    const displayTime = vnTime.toISOString().substring(11, 16);

    if (!grouped[timeKey]) {
      grouped[timeKey] = { time: displayTime, temperature: null, humidity: null, light: null, rain: null, timestamp: timeKey };
    }
    if (item.sensorType === "temperature") grouped[timeKey].temperature = item.value;
    else if (item.sensorType === "humidity") grouped[timeKey].humidity = item.value;
    else if (item.sensorType === "light") grouped[timeKey].light = item.value;
    else if (item.sensorType === "rain") grouped[timeKey].rain = item.value;
  });

  const result = Object.values(grouped)
    .sort((a, b) => a.timestamp - b.timestamp)
    .map(item => {
      delete item.timestamp;
      return item;
    });

  return result.slice(-limit);
};

module.exports = {
  getSensorDataService, getLatestSensorDataService, getChartDataService
};