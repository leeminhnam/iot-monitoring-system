const express = require('express');
const router = express.Router();
const {
    getSensorData, getLatestSensorData
} = require('../controllers/sensorController');

router.get('/data', getSensorData);

router.get('/data/latest', getLatestSensorData);

module.exports = router;