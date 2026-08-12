const express = require('express');
const router = express.Router();
const { getItems, createItem, getItem, updateItemStatus, createClaim, getClaims, updateClaimStatus, getExchanges, addMessage, getMessages } = require('../controllers/itemController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/').get(getItems).post(protect, upload.single('image'), createItem);
router.route('/exchanges').get(protect, admin, getExchanges);
router.route('/:id').get(getItem);
router.route('/:id/status').patch(protect, updateItemStatus);
router.route('/:id/claim').post(protect, createClaim).get(protect, getClaims);
router.route('/claim/:claimId').patch(protect, updateClaimStatus);
router.route('/:id/messages').post(protect, addMessage).get(getMessages);

module.exports = router;
