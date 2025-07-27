const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
// Correct import for newer Web3 versions
const authRoute = require('./src/models/routes/authRoute');
const farmerRoute = require('./src/models/routes/farmerRoute');
const contractRoutes = require('./src/models/routes/contractRoute');
const weatherRoute = require('./src/models/routes/weatherRoute-fixed');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'Public')));

// Routes
app.use('/api', authRoute.router);
app.use('/api/farmers', farmerRoute);
app.use('/contracts', contractRoutes);
app.use('/api/weather', weatherRoute);

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/contract_farming', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.log('MongoDB connection error:', err));

// Test route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/Public/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Server setup
console.log(process.env.JWT_SECRET)
const PORT = process.env.PORT ;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Export for potential testing
module.exports = app;


