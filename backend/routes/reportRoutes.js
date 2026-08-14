const express = require('express');
const router = express.Router();
const { createReport, getReports, updateReportStatus, deleteReport } = require('../controllers/reportController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').post(protect, createReport).get(protect, admin, getReports);
router.route('/:id/status').patch(protect, admin, updateReportStatus);
router.route('/:id').delete(protect, admin, deleteReport);

module.exports = router;
