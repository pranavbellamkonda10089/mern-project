const Item = require('../models/Item');
const Claim = require('../models/Claim');
const Exchange = require('../models/Exchange');
const Message = require('../models/Message');

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

        if (status === 'returned') {
            const existingExchange = await Exchange.findOne({ itemId: item._id });
            if (!existingExchange) {
                const approvedClaim = await Claim.findOne({ itemId: item._id, status: 'approved' });
                await Exchange.create({
                    itemId: item._id,
                    posterId: item.postedBy,
                    claimantId: approvedClaim ? approvedClaim.claimantId : null
                });
            }
        }

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

            const existingExchange = await Exchange.findOne({ itemId: item._id });
            if (!existingExchange) {
                await Exchange.create({
                    itemId: item._id,
                    posterId: item.postedBy,
                    claimantId: claim.claimantId
                });
            }
        }

        res.status(200).json(claim);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const getExchanges = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized as admin' });
        }
        const exchanges = await Exchange.find({})
            .populate('itemId', 'title type category location date photoUrl')
            .populate('posterId', 'name email')
            .populate('claimantId', 'name email')
            .sort('-createdAt');
        res.status(200).json(exchanges);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching exchanges' });
    }
};

const deleteExchange = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized as admin' });
        }
        const exchange = await Exchange.findByIdAndDelete(req.params.id);
        if (!exchange) {
            return res.status(404).json({ message: 'Exchange not found' });
        }
        res.status(200).json({ message: 'Exchange deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error deleting exchange' });
    }
};

const addMessage = async (req, res) => {
    try {
        const { text } = req.body;
        const item = await Item.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Item not found' });

        const message = await Message.create({
            item: item._id,
            sender: req.user._id,
            text
        });
        const populatedMsg = await message.populate('sender', 'name');
        res.status(201).json(populatedMsg);
    } catch (error) {
        res.status(500).json({ message: 'Server error adding message' });
    }
};

const getMessages = async (req, res) => {
    try {
        const messages = await Message.find({ item: req.params.id }).populate('sender', 'name').sort('createdAt');
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching messages' });
    }
};

module.exports = { getItems, createItem, getItem, updateItemStatus, createClaim, getClaims, updateClaimStatus, getExchanges, deleteExchange, addMessage, getMessages };
