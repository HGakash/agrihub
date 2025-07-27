const { Web3 } = require('web3');

// Initialize Web3 with Ganache or other provider
const web3 = new Web3(process.env.BLOCKCHAIN_PROVIDER || 'http://localhost:8545');

// Add connection debugging
web3.eth.net.isListening()
    .then(() => console.log('✅ Connected to blockchain provider'))
    .catch(err => console.error('❌ Blockchain connection failed:', err));

// Contract configuration
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || '0x1234567890abcdef1234567890abcdef12345678';
const contractABI = require('../../contract/contractABI.json');

// Initialize contract instance
const contract = new web3.eth.Contract(contractABI, CONTRACT_ADDRESS);

// Test connection
async function testConnection() {
    try {
        const accounts = await web3.eth.getAccounts();
        console.log('📋 Available accounts:', accounts);
        if (accounts.length > 0) {
            const balance = await web3.eth.getBalance(accounts[0]);
            console.log('💰 Account 0 balance:', web3.utils.fromWei(balance, 'ether'), 'ETH');
        }
    } catch (error) {
        console.error('🔴 Blockchain test failed:', error);
    }
}

// Test connection on startup
testConnection();

module.exports = {
    web3,
    contract,
    CONTRACT_ADDRESS,
    contractABI
};
