const mongoose = require('mongoose');

const actionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  deviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Device',
    required: true
  },
  action: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true
  },
  time: {
    type: Date,
    default: Date.now
  }
});

const Action = mongoose.model('Action', actionSchema);

module.exports = Action;
