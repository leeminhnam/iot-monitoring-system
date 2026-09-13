const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/user');

const resetDatabase = async () => {
  try {
    const dbUrl = process.env.DB_URL;
    if (!dbUrl) {
      throw new Error('Chưa cấu hình DB_URL trong file .env');
    }

    console.log('Đang kết nối tới database...');
    await mongoose.connect(dbUrl);
    console.log('Kết nối database thành công!');

    // Xóa tất cả collections/dữ liệu trong database
    console.log('Đang xóa toàn bộ database...');
    await mongoose.connection.dropDatabase();
    console.log('Đã xóa database thành công!');

    // Tạo lại user
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('12345678', saltRounds);

    const newUser = new User({
      username: 'B23DCCN579',
      password: hashedPassword,
      firstName: 'Nam',
      lastName: 'Lê Minh',
    });

    await newUser.save();
    console.log('Đã tạo tài khoản thành công:', {
      username: newUser.username,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
    });

  } catch (error) {
    console.error('Đã xảy ra lỗi khi xử lý dữ liệu:', error);
  } finally {
    mongoose.connection.close();
    console.log('Đã ngắt kết nối database');
  }
};

resetDatabase();
