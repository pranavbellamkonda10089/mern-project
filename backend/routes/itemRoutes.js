const express = require('express');
const router = express.Router();
const { getItems, createItem, getItem, updateItemStatus, createClaim, getClaims, updateClaimStatus } = require('../controllers/itemController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/').get(getItems).post(protect, upload.single('image'), createItem);
router.route('/:id').get(getItem);
router.route('/:id/status').patch(protect, updateItemStatus);
router.route('/:id/claim').post(protect, createClaim).get(protect, getClaims);
router.route('/claim/:claimId').patch(protect, updateClaimStatus);

module.exports = router;
