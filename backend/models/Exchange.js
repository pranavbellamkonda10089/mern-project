const mongoose = require('mongoose');

const ExchangeSchema = new mongoose.Schema({
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
    posterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    claimantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, default: 'returned' }
}, { timestamps: true });

module.exports = mongoose.model('Exchange', ExchangeSchema);
