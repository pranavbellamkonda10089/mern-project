const express = require('express');
const router = express.Router();
const { register, login, getUser, getAllUsers, googleLogin, toggleBlockUser } = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.get('/me', protect, getUser);
router.get('/', protect, admin, getAllUsers);
router.patch('/users/:id/block', protect, admin, toggleBlockUser);

module.exports = router;
