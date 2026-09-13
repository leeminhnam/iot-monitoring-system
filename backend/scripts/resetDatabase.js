require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Sensor = require('../models/sensor');
const Device = require('../models/device');
const SensorData = require('../models/sensorData');
const Action = require('../models/action');

const DB_URL = process.env.DB_URL;

const resetDatabase = async () => {
  try {
    console.log('Đang kết nối đến cơ sở dữ liệu...');
    await mongoose.connect(DB_URL);
    console.log('Đã kết nối đến MongoDB');

    console.log('Đang xóa dữ liệu cũ...');
    await Sensor.deleteMany({});
    await Device.deleteMany({});
    await SensorData.deleteMany({});
    await Action.deleteMany({});
    console.log('Đã xóa dữ liệu cũ thành công.');

    const devices = [
      { id: 'LED1', name: 'Led 1' },
      { id: 'LED2', name: 'Led 2' },
      { id: 'LED3', name: 'Led 3' }
    ];
    console.log('Đang thêm các thiết bị...');
    await Device.insertMany(devices);
    console.log('Đã thêm các thiết bị.');

    const sensors = [
      { id: 'DHT11', name: 'DHT11' },
      { id: 'LM393', name: 'LM393' },
      { id: 'BH1750', name: 'BH1750' }
    ];
    console.log('Đang thêm các cảm biến...');
    await Sensor.insertMany(sensors);
    console.log('Đã thêm các cảm biến.');

    console.log('Khôi phục cơ sở dữ liệu thành công!');
  } catch (error) {
    console.error('Lỗi khi khôi phục cơ sở dữ liệu:', error);
  } finally {
    mongoose.connection.close();
  }
};

resetDatabase();
