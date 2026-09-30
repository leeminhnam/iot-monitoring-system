require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcryptjs');

require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Sensor = require('../models/sensor');
const Device = require('../models/device');
const SensorData = require('../models/sensorData');
const Action = require('../models/action');
const User = require('../models/user');

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
    await User.deleteMany({});
    console.log('Đã xóa dữ liệu cũ thành công.');

    // Tạo tài khoản mặc định
    const hashedPassword = await bcrypt.hash('12345678', 10);
    const defaultUser = {
      username: 'B23DCCN579',
      password: hashedPassword,
      firstName: 'Nam',
      lastName: 'Lê Minh',
    };
    console.log('Đang tạo tài khoản mặc định...');
    await User.create(defaultUser);
    console.log('Đã tạo tài khoản mặc định (username: B23DCCN579 / password: 12345678).');

    const devices = [
      { id: 'led1', name: 'Led 1' },
      { id: 'led2', name: 'Led 2' },
      { id: 'led3', name: 'Led 3' }
    ];
    console.log('Đang thêm các thiết bị...');
    await Device.insertMany(devices);
    console.log('Đã thêm các thiết bị.');

    const sensors = [
      { id: 'DHT11', name: 'DHT11' },
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
