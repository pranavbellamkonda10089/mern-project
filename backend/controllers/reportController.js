const Report = require('../models/Report');
const Item = require('../models/Item');

const createReport = async (req, res) => {
    try {
        const { itemId, reason } = req.body;

        if (!itemId || !reason) {
            return res.status(400).json({ message: 'Please provide both itemId and reason' });
        }

        const item = await Item.findById(itemId);
        if (!item) return res.status(404).json({ message: 'Item not found' });

        const reportExists = await Report.findOne({ itemId, reportedBy: req.user._id });
        if (reportExists) {
            return res.status(400).json({ message: 'You have already reported this item' });
        }

        const report = await Report.create({
            itemId,
            reportedBy: req.user._id,
            reason
        });

        res.status(201).json(report);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const getReports = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized as admin' });
        }
        const reports = await Report.find({}).populate('itemId', 'title').populate('reportedBy', 'name email').sort('-createdAt');
        res.status(200).json(reports);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { createReport, getReports };
