const Item = require('../models/Item');
const Claim = require('../models/Claim');

const getItems = async (req, res) => {
    try {
        const { type, search } = req.query;
        let query = { status: 'active' };
        if (type) query.type = type;
        if (search) query.title = { $regex: search, $options: 'i' };

        const items = await Item.find(query).populate('postedBy', 'name email').sort('-createdAt');
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const createItem = async (req, res) => {
    try {
        const { type, title, description, category, location, date, claimQuestion, tags } = req.body;
        let photoUrl = req.body.photoUrl || '';

        if (req.file) {
            photoUrl = req.file.path;
        }

        const item = await Item.create({
            type, title, description, category, location, date, photoUrl, claimQuestion, tags,
            postedBy: req.user._id
        });
        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const getItem = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id).populate('postedBy', 'name email');
        if (!item) return res.status(404).json({ message: 'Item not found' });
        res.status(200).json(item);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const updateItemStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const item = await Item.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Item not found' });
        if (item.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }
        item.status = status;
        await item.save();
        res.status(200).json(item);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const createClaim = async (req, res) => {
    try {
        const { message } = req.body;
        const item = await Item.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Item not found' });

        const claimExists = await Claim.findOne({ itemId: item._id, claimantId: req.user._id });
        if (claimExists) return res.status(400).json({ message: 'Already claimed this item' });

        const claim = await Claim.create({
            itemId: item._id,
            claimantId: req.user._id,
            message
        });
        res.status(201).json(claim);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const getClaims = async (req, res) => {
    try {
        const claims = await Claim.find({ itemId: req.params.id }).populate('claimantId', 'name email');
        res.status(200).json(claims);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const updateClaimStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const claim = await Claim.findById(req.params.claimId);
        if (!claim) return res.status(404).json({ message: 'Claim not found' });

        const item = await Item.findById(claim.itemId);
        if (item.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        claim.status = status;
        await claim.save();

        if (status === 'approved') {
            item.status = 'claimed';
            await item.save();
        }

        res.status(200).json(claim);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getItems, createItem, getItem, updateItemStatus, createClaim, getClaims, updateClaimStatus };
