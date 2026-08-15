const Item = require('../models/Item');
const Claim = require('../models/Claim');
const Exchange = require('../models/Exchange');
const Message = require('../models/Message');
const Report = require('../models/Report');

const getItems = async (req, res) => {
    try {
        const { type, search, category, status, tag } = req.query;
        let query = {};

        // Default to active unless explicitly requested (or "all")
        if (status && status !== 'all') {
            query.status = status;
        } else if (!status) {
            query.status = 'active';
        }

        if (type && (type === 'lost' || type === 'found')) {
            query.type = type;
        }

        if (category && category !== 'all') {
            query.category = category;
        }

        if (tag) {
            query.tags = { $in: [tag.toLowerCase()] };
        }

        if (search && search.trim()) {
            const sanitized = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const searchRegex = { $regex: sanitized, $options: 'i' };
            query.$or = [
                { title: searchRegex },
                { description: searchRegex },
                { location: searchRegex },
                { color: searchRegex },
                { tags: searchRegex }
            ];
        }

        const items = await Item.find(query).populate('postedBy', 'name email').sort('-createdAt');
        res.status(200).json(items);
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).json({ message: 'Server error fetching items' });
    }
};

const createItem = async (req, res) => {
    try {
        const { type, title, description, category, location, date, claimQuestion, color } = req.body;
        let photoUrl = req.body.photoUrl || '';
        let parsedTags = [];

        if (req.body.tags) {
            if (Array.isArray(req.body.tags)) {
                parsedTags = req.body.tags;
            } else if (typeof req.body.tags === 'string') {
                try {
                    parsedTags = JSON.parse(req.body.tags);
                } catch {
                    parsedTags = req.body.tags.split(',').map(t => t.trim().replace(/^#/, '')).filter(Boolean);
                }
            }
        }

        if (req.file) {
            photoUrl = req.file.path;
        }

        const item = await Item.create({
            type,
            title,
            description,
            category: category || 'other',
            location,
            date: date || new Date(),
            photoUrl,
            claimQuestion,
            color,
            tags: parsedTags,
            postedBy: req.user._id
        });
        res.status(201).json(item);
    } catch (error) {
        console.error('Error creating item:', error);
        res.status(500).json({ message: 'Server error creating item' });
    }
};

const getItem = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id).populate('postedBy', 'name email role');
        if (!item) return res.status(404).json({ message: 'Item not found' });
        res.status(200).json(item);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteItem = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Item not found' });

        if (item.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized to delete this item' });
        }

        // Clean up associated resources
        await Item.findByIdAndDelete(req.params.id);
        await Claim.deleteMany({ itemId: req.params.id });
        await Message.deleteMany({ item: req.params.id });
        await Report.deleteMany({ itemId: req.params.id });
        await Exchange.deleteMany({ itemId: req.params.id });

        res.status(200).json({ message: 'Item and associated records deleted successfully' });
    } catch (error) {
        console.error('Error deleting item:', error);
        res.status(500).json({ message: 'Server error deleting item' });
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
        const { message, dropLocation, responseType } = req.body;
        const item = await Item.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Item not found' });

        if (item.postedBy.toString() === req.user._id.toString()) {
            return res.status(400).json({
                message: item.type === 'lost'
                    ? 'You cannot respond to your own lost item'
                    : 'You cannot claim your own item'
            });
        }

        const claimExists = await Claim.findOne({ itemId: item._id, claimantId: req.user._id });
        if (claimExists) {
            return res.status(400).json({
                message: item.type === 'lost'
                    ? 'You have already submitted a response for this item'
                    : 'You have already submitted a claim for this item'
            });
        }

        let photoUrl = '';
        if (req.file) {
            photoUrl = req.file.path;
        }

        const effectiveResponseType = responseType || (item.type === 'lost' ? 'finder_response' : 'claim_request');
        const effectiveMessage = message || (item.type === 'lost' ? 'I found your item!' : '');

        const claim = await Claim.create({
            itemId: item._id,
            claimantId: req.user._id,
            message: effectiveMessage,
            dropLocation: dropLocation || '',
            photoUrl: photoUrl || '',
            responseType: effectiveResponseType
        });

        const populatedClaim = await Claim.findById(claim._id).populate('claimantId', 'name email');
        res.status(201).json(populatedClaim);
    } catch (error) {
        console.error('Error creating claim/response:', error);
        res.status(500).json({ message: 'Server error creating claim/response' });
    }
};

const getClaims = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Item not found' });

        const isAuthor = item.postedBy.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';

        let query = { itemId: req.params.id };
        if (!isAuthor && !isAdmin) {
            // Regular students can only see their own claim
            query.claimantId = req.user._id;
        }

        const claims = await Claim.find(query)
            .populate('claimantId', 'name email')
            .sort('-createdAt');
        res.status(200).json(claims);
    } catch (error) {
        console.error('Error fetching claims:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getAllClaims = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized as admin' });
        }
        const claims = await Claim.find({})
            .populate('itemId', 'title type category location photoUrl status')
            .populate('claimantId', 'name email')
            .sort('-createdAt');
        res.status(200).json(claims);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching all claims' });
    }
};

const updateClaimStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const claim = await Claim.findById(req.params.claimId);
        if (!claim) return res.status(404).json({ message: 'Claim not found' });

        const item = await Item.findById(claim.itemId);
        if (!item) return res.status(404).json({ message: 'Item not found' });

        if (item.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        claim.status = status;
        await claim.save();

        if (status === 'approved') {
            item.status = 'claimed';
            await item.save();
        }

        const populatedClaim = await Claim.findById(claim._id).populate('claimantId', 'name email');
        res.status(200).json(populatedClaim);
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

module.exports = {
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
};
