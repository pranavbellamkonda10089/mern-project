const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
    type: { type: String, enum: ['lost', 'found'], required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    location: { type: String, required: true },
    date: { type: Date, required: true },
    photoUrl: { type: String },
    status: { type: String, enum: ['active', 'claimed', 'returned'], default: 'active' },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    claimQuestion: { type: String },
    color: { type: String },
    tags: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Item', ItemSchema);
