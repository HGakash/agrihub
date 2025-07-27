const express = require('express');
const router = express.Router();
const Contract = require('../Contract');
const authenticateJWT = require('../../middleware/authenticateJWT');
const User = require('../User');
const Farmer = require('../Farmer');
const contractABI = require('../../../contract/contractABI.json');
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || '0x1234567890abcdef1234567890abcdef12345678';
const { Web3 } = require('web3');
const web3 = new Web3(process.env.BLOCKCHAIN_PROVIDER || 'http://localhost:8545');

// Route to create a new contract
router.post('/create', authenticateJWT, async (req, res) => {
    try {
        const { farmerId, companyName, contractDetails, startDate, endDate, duration, pricePerUnit, gstNumber } = req.body;
        
        const newContract = new Contract({
            farmerId,
            companyName,
            contractDetails,
            startDate,
            endDate,
            duration,
            gstNumber,
            pricePerUnit,
            createdBy: req.userId,
            status: 'pending'
        });

        await newContract.save();

        // Save to blockchain
        try {
            const accounts = await web3.eth.getAccounts();
            const contract = new web3.eth.Contract(contractABI, CONTRACT_ADDRESS);
            
            const startTimestamp = Math.floor(new Date(startDate).getTime() / 1000);
            const endTimestamp = Math.floor(new Date(endDate).getTime() / 1000);
            
            const gasPrice = await web3.eth.getGasPrice();
            await contract.methods.addContract(
                companyName,
                contractDetails,
                startTimestamp,
                endTimestamp,
                'pending'
            ).send({
                from: accounts[0],
                gas: 3000000,
                gasPrice: gasPrice,
                type: 0x0 // Force legacy transaction type
            });

            console.log('Contract saved to blockchain successfully');
        } catch (blockchainError) {
            console.error('Blockchain error:', blockchainError);
            // Continue even if blockchain fails - MongoDB is primary storage
        }

        res.status(201).json({ message: 'Contract created successfully' });
    } catch (error) {
        console.error('Error creating contract:', error);
        res.status(500).json({ error: 'Failed to create contract' });
    }
});

router.get('/farmer/mycontract', authenticateJWT, async (req, res) => {
    try {
        console.log("JWT middleware triggered");
        console.log('User ID from JWT:', req.userId);
        console.log("Email in request:", req.email);

        // Step 1: Check if farmer record exists
        let farmer = await Farmer.findOne({ email: req.email });
        
        if (!farmer) {
            console.log('Farmer not found for email:', req.email);
            // Return empty array instead of error
            return res.json([]);
        }

        console.log('Found farmer:', farmer._id);

        // Step 2: Find pending contracts for this farmer
        const contracts = await Contract.find({ 
            farmerId: farmer._id, 
            status: 'pending' 
        }).populate('farmerId', 'name email location');

        console.log('Found contracts:', contracts.length);
        
        // Transform the data to include farmer information
        const contractsWithDetails = contracts.map(contract => ({
            _id: contract._id,
            farmerId: contract.farmerId._id,
            farmerName: contract.farmerId.name,
            farmerEmail: contract.farmerId.email,
            farmerLocation: contract.farmerId.location,
            companyName: contract.companyName,
            contractDetails: contract.contractDetails,
            startDate: contract.startDate,
            endDate: contract.endDate,
            duration: contract.duration,
            pricePerUnit: contract.pricePerUnit,
            gstNumber: contract.gstNumber,
            status: contract.status,
            createdBy: contract.createdBy
        }));

        res.json(contractsWithDetails);
    } catch (error) {
        console.error('Error fetching contracts:', error);
        res.status(500).json({ error: 'Server error' });
    }
});


// Route to accept a contract with blockchain storage
router.post('/accept/:id', authenticateJWT, async (req, res) => {
    const { id } = req.params;
    try {
        // First, get the farmer details based on the authenticated user
        const farmer = await Farmer.findOne({ email: req.email });
        if (!farmer) {
            return res.status(404).json({ error: 'Farmer not found' });
        }

        // Update the contract only if it belongs to this farmer
        const updatedContract = await Contract.findOneAndUpdate(
            { _id: id, farmerId: farmer._id },
            { status: 'accepted' },
            { new: true }
        );

        if (!updatedContract) {
            return res.status(404).json({ error: 'Contract not found or does not belong to this farmer' });
        }

        // Store acceptance on blockchain
        try {
            const accounts = await web3.eth.getAccounts();
            console.log('Available accounts:', accounts);
            
            if (!accounts || accounts.length === 0) {
                throw new Error('No accounts available on Ganache');
            }

            const contract = new web3.eth.Contract(contractABI, CONTRACT_ADDRESS);
            
            const startTimestamp = Math.floor(new Date(updatedContract.startDate).getTime() / 1000);
            const endTimestamp = Math.floor(new Date(updatedContract.endDate).getTime() / 1000);
            
            console.log('Sending transaction to blockchain...');
            console.log('Contract address:', CONTRACT_ADDRESS);
            console.log('Parameters:', {
                companyName: updatedContract.companyName,
                contractDetails: updatedContract.contractDetails,
                startTimestamp,
                endTimestamp,
                status: 'accepted'
            });

            const gasPrice = await web3.eth.getGasPrice();
            const gasEstimate = await contract.methods.addContract(
                updatedContract.companyName,
                updatedContract.contractDetails,
                startTimestamp,
                endTimestamp,
                'accepted'
            ).estimateGas({ from: accounts[0] });

            const receipt = await contract.methods.addContract(
                updatedContract.companyName,
                updatedContract.contractDetails,
                startTimestamp,
                endTimestamp,
                'accepted'
            ).send({
                from: accounts[0],
                gas: Math.min(gasEstimate + 100000, 3000000),
                gasPrice: gasPrice,
                type: 0x0
            });

            console.log('Transaction receipt:', receipt);
            console.log('Contract acceptance saved to blockchain successfully');
            console.log('Transaction hash:', receipt.transactionHash);
        } catch (blockchainError) {
            console.error('Blockchain error during acceptance:', blockchainError);
            console.error('Error details:', {
                message: blockchainError.message,
                code: blockchainError.code,
                data: blockchainError.data
            });
            // Don't throw error, but log it for debugging
        }

        res.json({ message: 'Contract accepted', contract: updatedContract });
    } catch (error) {
        console.error('Error accepting contract:', error);
        res.status(500).json({ error: 'Failed to accept contract' });
    }
});

// Route to reject a contract
router.post('/reject/:id', authenticateJWT, async (req, res) => {
    const { id } = req.params;
    try {
        // First, get the farmer details based on the authenticated user
        const farmer = await Farmer.findOne({ email: req.email });
        if (!farmer) {
            return res.status(404).json({ error: 'Farmer not found' });
        }

        // Update the contract status to rejected instead of deleting
        const updatedContract = await Contract.findOneAndUpdate(
            { _id: id, farmerId: farmer._id },
            { status: 'rejected' },
            { new: true }
        );

        if (!updatedContract) {
            return res.status(404).json({ error: 'Contract not found or does not belong to this farmer' });
        }

        res.json({ message: 'Contract rejected', contract: updatedContract });
    } catch (error) {
        console.error('Error rejecting contract:', error);
        res.status(500).json({ error: 'Failed to reject contract' });
    }
});

router.get('/accepted', authenticateJWT, async (req, res) => {
    try {
        console.log('hitt me');
        
        // First, get the farmer details based on the authenticated user
        const Farmer = require('../Farmer');
        const farmer = await Farmer.findOne({ email: req.email });
        
        if (!farmer) {
            return res.status(404).json({ error: 'Farmer not found' });
        }
        
        // Find all accepted contracts for this farmer
        const acceptedContracts = await Contract.find({ 
            farmerId: farmer._id,
            status: 'accepted'
        })
            .populate('farmerId', 'name email location');
        
        // Transform the data to include farmer name
        const contractsWithFarmerNames = acceptedContracts.map(contract => ({
            _id: contract._id,
            farmerId: contract.farmerId._id,
            farmerName: contract.farmerId.name,
            farmerEmail: contract.farmerId.email,
            farmerLocation: contract.farmerId.location,
            companyName: contract.companyName,
            contractDetails: contract.contractDetails,
            startDate: contract.startDate,
            endDate: contract.endDate,
            duration: contract.duration,
            pricePerUnit: contract.pricePerUnit,
            gstNumber: contract.gstNumber,
            status: contract.status,
            createdAt: contract.createdAt,
            updatedAt: contract.updatedAt
        }));
        
        res.json(contractsWithFarmerNames);
    } catch (error) {
        console.error('Error fetching accepted contracts:', error);
        res.status(500).json({ error: 'Failed to fetch accepted contracts' });
    }
});

// Route to get all contracts created by the dealer (all statuses)
router.get('/dealer/all', authenticateJWT, async (req, res) => {
    try {
        console.log('Fetching all contracts for dealer:', req.userId);
        
        const allContracts = await Contract.find({ 
            createdBy: req.userId // Filter by the logged-in dealer
        })
            .populate('farmerId', 'name email location');
        
        console.log('Raw contracts from DB:', allContracts.length);
        console.log('Contract statuses:', allContracts.map(c => ({id: c._id, status: c.status})));
        
        // Transform the data to include farmer name
        const contractsWithFarmerNames = allContracts.map(contract => ({
            _id: contract._id,
            farmerId: contract.farmerId._id,
            farmerName: contract.farmerId.name,
            farmerEmail: contract.farmerId.email,
            farmerLocation: contract.farmerId.location,
            companyName: contract.companyName,
            contractDetails: contract.contractDetails,
            startDate: contract.startDate,
            endDate: contract.endDate,
            duration: contract.duration,
            pricePerUnit: contract.pricePerUnit,
            gstNumber: contract.gstNumber,
            status: contract.status,
            createdAt: contract.createdAt,
            updatedAt: contract.updatedAt
        }));
        
        console.log('Transformed contracts:', contractsWithFarmerNames.length);
        console.log('Status distribution:', {
            pending: contractsWithFarmerNames.filter(c => c.status === 'pending').length,
            accepted: contractsWithFarmerNames.filter(c => c.status === 'accepted').length,
            rejected: contractsWithFarmerNames.filter(c => c.status === 'rejected').length
        });
        
        res.json(contractsWithFarmerNames);
    } catch (error) {
        console.error('Error fetching all dealer contracts:', error);
        res.status(500).json({ error: 'Failed to fetch dealer contracts' });
    }
});

// Route to get contracts filtered by company name for the logged-in dealer
router.get('/dealer/company/:companyName', authenticateJWT, async (req, res) => {
    try {
        const { companyName } = req.params;
        
        const contracts = await Contract.find({ 
            createdBy: req.userId, // Filter by the logged-in dealer
            companyName: companyName // Filter by company name
        })
            .populate('farmerId', 'name email location');
        
        // Transform the data to include farmer name
        const contractsWithFarmerNames = contracts.map(contract => ({
            _id: contract._id,
            farmerId: contract.farmerId._id,
            farmerName: contract.farmerId.name,
            farmerEmail: contract.farmerId.email,
            farmerLocation: contract.farmerId.location,
            companyName: contract.companyName,
            contractDetails: contract.contractDetails,
            startDate: contract.startDate,
            endDate: contract.endDate,
            duration: contract.duration,
            pricePerUnit: contract.pricePerUnit,
            gstNumber: contract.gstNumber,
            status: contract.status,
            createdAt: contract.createdAt,
            updatedAt: contract.updatedAt
        }));
        
        res.json(contractsWithFarmerNames);
    } catch (error) {
        console.error('Error fetching company contracts:', error);
        res.status(500).json({ error: 'Failed to fetch company contracts' });
    }
});

module.exports = router;

// const express = require('express');
// const router = express.Router();
// const Contract = require('../Contract'); // MongoDB model
// const authenticateJWT = require('../../middleware/authenticateJWT');

// // Route to create a new contract
// router.post('/create', async (req, res) => {
//     try {
//         const { farmerId, companyName, contractDetails, startDate, endDate, duration, pricePerUnit } = req.body;

//         const newContract = new Contract({
//             farmerId,
//             companyName,
//             contractDetails,
//             startDate,
//             endDate,
//             duration,
//             pricePerUnit,
//             status: 'pending' // Status set to 'pending' initially
//         });

//         await newContract.save();
//         res.status(201).json({ message: 'Contract created successfully' });
//     } catch (error) {
//         console.error('Error creating contract:', error);
//         res.status(500).json({ error: 'Failed to create contract' });
//     }
// });

// // Fetch all pending contracts for a specific farmer

// router.get('/farmer/contracts', authenticateJWT, async (req, res) => {
//     console.log('pending hitted');
//     const farmerId = '66e7ee8ffd3a73548f47f2b7';  // Retrieved from JWT middleware
//     console.log(farmerId);
//     try {
//         const pendingContracts = await Contract.find({ farmerId, status: 'pending' });
//         res.json(pendingContracts);
//     } catch (error) {
//         console.error('Error fetching contracts:', error);
//         res.status(500).json({ error: 'Failed to fetch contracts' });
//     }
// });

// module.exports = router;


