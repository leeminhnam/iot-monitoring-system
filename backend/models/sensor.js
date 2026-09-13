const mongoose = require('mongoose');

const sensorSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Sensor = mongoose.model('Sensor', sensorSchema);

module.exports = Sensor;
