const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
    farmerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Farmer',  // Reference to the Farmer model
        required: true
    },
    companyName: {
        type: String,
        required: true
    },
    contractDetails: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    duration: {
        type: Number,
        required: true  // Duration in years
    },
    pricePerUnit: {
        type: Number,
        required: true,  // Ensure price per unit is provided
        min: 0  // Price per unit should be a positive number
    },
        gstNumber: {
        type: String,
        required: true,  // Ensure price per unit is provided
        min: 0  // Price per unit should be a positive number
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],  // Valid statuses for the contract
        default: 'pending'
    }
}, { timestamps: true });  // Automatically adds createdAt and updatedAt fields

const Contract = mongoose.model('Contract', contractSchema);

module.exports = Contract;