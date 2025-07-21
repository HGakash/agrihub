const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../User');
const router = express.Router();
require('dotenv').config(); // Load environment variables

// Sign Up Route
router.post('/signup', async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({ name, email, password: hashedPassword, role });
        await newUser.save();

        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).json({ message: 'Error creating user' });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    const { email, password, role } = req.body;
    try {
        const user = await User.findOne({ email, role });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        // Create JWT token
const token = jwt.sign(
  { id: user._id, role: user.role, email: user.email },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);
        res.json({ token });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Error logging in' });
    }
});

//Middleware to verify token
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ message: 'No token provided' });

    const token = authHeader.split(' ')[1]; // This will remove the 'Bearer ' prefix
    if (!token) return res.status(401).json({ message: 'No token provided' });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ message: 'Failed to authenticate token' });
        req.userId = decoded.id;
        next();
    });
};

// Protected Route
router.get('/me', verifyToken, async (req, res) => {
    try {
        console.log('hitting');
        const user = await User.findById(req.userId);
        console.log('User ID from token:', req.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });
        console.log('User fetched from DB:', user);
        res.json({ name: user.name, email: user.email, role: user.role });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Error fetching user' });
    }
});

module.exports = { router, verifyToken };
