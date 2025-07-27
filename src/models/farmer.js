const mongoose = require('mongoose');

const farmerSchema = new mongoose.Schema({
    name: String,
    email: String,
    location: String,
    produce: String,
    experience: Number,
    contact: String
}, { timestamps: true });

module.exports = mongoose.models.Farmer || mongoose.model('Farmer', farmerSchema);
