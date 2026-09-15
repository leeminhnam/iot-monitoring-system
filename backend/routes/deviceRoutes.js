const express = require('express');
const router = express.Router();
const {
    getDevicesWithStatus, toggleDevice 
} = require('../controllers/deviceController');

router.get('/', getDevicesWithStatus);

router.post('/:id/toggle', toggleDevice);

module.exports = router;