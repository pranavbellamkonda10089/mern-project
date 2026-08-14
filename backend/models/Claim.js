const mongoose = require('mongoose');

const ClaimSchema = new mongoose.Schema({
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
    claimantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    dropLocation: { type: String },
    photoUrl: { type: String },
    responseType: { type: String, enum: ['finder_response', 'claim_request'], default: 'claim_request' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('Claim', ClaimSchema);
