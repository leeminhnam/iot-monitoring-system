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
  // Lấy (limit * 3) bản ghi mới nhất (vì mỗi lần update có 3 loại cảm biến)
  const rawData = await SensorData.find()
    .sort({ time: -1 })
    .limit(limit * 3)
    .exec();

  const grouped = {};
  rawData.forEach(item => {
    const timeKey = item.time.getTime(); // Group bằng exact millisecond
    const vnTime = new Date(item.time.getTime() + 7 * 60 * 60 * 1000);
    const displayTime = vnTime.toISOString().substring(11, 16); // HH:mm

    if (!grouped[timeKey]) {
      grouped[timeKey] = { time: displayTime, temperature: null, humidity: null, light: null, timestamp: timeKey };
    }
    if (item.sensorType === "temperature") grouped[timeKey].temperature = item.value;
    else if (item.sensorType === "humidity") grouped[timeKey].humidity = item.value;
    else if (item.sensorType === "light") grouped[timeKey].light = item.value;
  });

  // Sort lại theo thời gian tăng dần để vẽ biểu đồ từ trái sang phải
  const result = Object.values(grouped)
    .sort((a, b) => a.timestamp - b.timestamp)
    .map(item => {
      delete item.timestamp;
      return item;
    });

  // Đảm bảo chỉ trả về tối đa `limit` phần tử mới nhất
  return result.slice(-limit);
};

module.exports = {
  getSensorDataService, getLatestSensorDataService, getChartDataService
};