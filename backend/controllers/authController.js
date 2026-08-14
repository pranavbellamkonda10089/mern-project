const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please add all fields' });
        }
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = await User.create({ name, email, password: hashedPassword, role });
        if (user) {
            res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id)
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (user && (await bcrypt.compare(password, user.password))) {
            if (user.blocked) return res.status(403).json({ message: 'User is blocked by Admin' });
            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id)
            });
        } else {
            res.status(400).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const getUser = async (req, res) => {
    res.status(200).json(req.user);
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching users' });
    }
};

const googleLogin = async (req, res) => {
    try {
        const { credential } = req.body;
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const { email, name } = ticket.getPayload();

        let user = await User.findOne({ email });

        if (!user) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(email + (process.env.JWT_SECRET || 'secret'), salt);
            user = await User.create({ name, email, password: hashedPassword, role: 'student' });
        }

        if (user.blocked) {
            return res.status(403).json({ message: 'User is blocked by Admin' });
        }

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id)
        });
    } catch (error) {
        console.error('Google Auth Error:', error);
        res.status(500).json({ message: 'Google Authentication failed' });
    }
};

const toggleBlockUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        // Prevent admin from blocking themselves
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'You cannot block your own account' });
        }

        user.blocked = !user.blocked;
        await user.save();
        res.status(200).json({ message: `User ${user.blocked ? 'blocked' : 'unblocked'} successfully`, user });
    } catch (error) {
        res.status(500).json({ message: 'Server error updating user status' });
    }
};

const Item = require('../models/Item');
const Claim = require('../models/Claim');
const Message = require('../models/Message');
const Report = require('../models/Report');

const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Prevent admin from deleting their own account
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'You cannot delete your own admin account' });
        }

        // Delete user and cascade clean associated data
        await User.findByIdAndDelete(req.params.id);
        await Item.deleteMany({ postedBy: req.params.id });
        await Claim.deleteMany({ claimantId: req.params.id });
        await Message.deleteMany({ sender: req.params.id });
        await Report.deleteMany({ reportedBy: req.params.id });

        res.status(200).json({ message: `Account for ${user.name} (${user.email}) deleted successfully` });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Server error deleting user account' });
    }
};

module.exports = { register, login, getUser, getAllUsers, googleLogin, toggleBlockUser, deleteUser };
