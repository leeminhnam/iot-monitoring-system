const express = require('express');
const router = express.Router();
const { getActionHistory } = require('../controllers/actionController');

router.get('/', getActionHistory);

module.exports = router;