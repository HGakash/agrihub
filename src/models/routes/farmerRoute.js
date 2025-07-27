const express = require('express');
const Farmer = require('../farmer'); // Import Farmer model
const router = express.Router();
// const { verifyToken } = require('./authRoute'); // Import verifyToken middleware

console.log('Farmer route file loaded');

// Debug route to test if the file is being loaded
router.get('/test', (req, res) => {
    console.log('Test route hit');
    res.json({ message: 'Farmer route is working!' });
});

// Register Farmer Route
router.post('/', async (req, res, next) => {
      // Apply the middleware here
    console.log('farmer route is hitting');
    const { name, email, location, produce, experience, contact } = req.body;
    try {
        const newFarmer = new Farmer({ name, email, location, produce, experience, contact });
        await newFarmer.save();
        res.status(201).json({ message: 'Farmer registered successfully' });
    } catch (error) {
        console.error('Error registering farmer:', error);
        res.status(500).json({ message: 'Error registering farmer' });
    }
});

router.get('/', async (req, res) => {
    console.log('GET /api/farmers route hit');
    try {
        const farmers = await Farmer.find({});
        res.status(200).json(farmers);
    } catch (error) {
        console.error('Error fetching farmers:', error);
        res.status(500).json({ message: 'Error fetching farmers' });
    }
});

router.get('/:farmerId', async (req, res) => {
    try {
        console.log('iam hitted');
        const farmer = await Farmer.findById(req.params.farmerId);
        if (farmer) {
            res.json(farmer); // Return the farmer object if found
        } else {
            res.status(404).json({ message: 'Farmer not found' });
        }
    } catch (error) {
        console.error('Error fetching farmer:', error);
        res.status(500).json({ message: 'Error fetching farmer' });
    }
});


module.exports = router;
