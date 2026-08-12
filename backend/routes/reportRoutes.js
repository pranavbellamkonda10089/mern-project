const express = require('express');
const router = express.Router();
const { createReport, getReports } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, createReport).get(protect, getReports);

module.exports = router;
