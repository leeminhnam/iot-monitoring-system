const express = require('express');
const router = express.Router();
const {
    getSensorData, getLatestSensorData, getChartData
} = require('../controllers/sensorController');

router.get('/data', getSensorData);

router.get('/data/latest', getLatestSensorData);

router.get('/chart-data', getChartData);

module.exports = router;