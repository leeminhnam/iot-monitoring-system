const mongoose = require('mongoose');

const sensorDataSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  sensorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sensor',
    required: true
  },
  sensorType: {
    type: String,
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  time: {
    type: Date,
    default: Date.now
  }
});

const SensorData = mongoose.model('SensorData', sensorDataSchema);

module.exports = SensorData;
