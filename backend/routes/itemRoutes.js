const express = require('express');
const router = express.Router();
const {
    getItems,
    createItem,
    getItem,
    deleteItem,
    updateItemStatus,
    createClaim,
    getClaims,
    getAllClaims,
    updateClaimStatus,
    getExchanges,
    deleteExchange,
    addMessage,
    getMessages
} = require('../controllers/itemController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/').get(getItems).post(protect, upload.single('image'), createItem);
router.route('/claims/all').get(protect, admin, getAllClaims);
router.route('/exchanges').get(protect, admin, getExchanges);
router.route('/exchanges/:id').delete(protect, admin, deleteExchange);
router.route('/:id').get(getItem).delete(protect, deleteItem);
router.route('/:id/status').patch(protect, updateItemStatus);
router.route('/:id/claim').post(protect, createClaim).get(protect, getClaims);
router.route('/claim/:claimId').patch(protect, updateClaimStatus);
router.route('/:id/messages').post(protect, addMessage).get(getMessages);

module.exports = router;
