document.addEventListener('DOMContentLoaded', async function () {
    const token = localStorage.getItem('token');
    let status = `<span class="text-green-600 font-bold" style="border-radius: 5px; padding: 2px 5px; background-color: #c6f7d0;">Accepted</span>`;
    if (!token) {
        alert('You must be logged in to view this page.');
        window.location.href = '/Public/login.html';
        return;
    }

    try {
        // Fetch user information
        const userResponse = await fetch('http://localhost:3000/api/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const userResult = await userResponse.json();
        if (userResponse.ok) {
            document.getElementById('userName').textContent = userResult.name;
            document.getElementById('userrole').textContent = userResult.role;
        } else {
            console.error('Error fetching user info:', userResult.message);
            alert(`Error: ${userResult.message}`);
            window.location.href = '/Public/login.html';
            return;
        }

        // Fetch accepted contracts
        const contractsResponse = await fetch('http://localhost:3000/contracts/accepted', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const contractsResult = await contractsResponse.json();
        if (contractsResponse.ok) {
            const contractsList = document.getElementById('contractsList');
            if (contractsResult.length === 0) {
                contractsList.innerHTML = '<tr><td colspan="4" class="text-center py-4">No accepted contracts found.</td></tr>';
            } else {
                contractsList.innerHTML = contractsResult.map(contract => `
                    <tr>
                        <td class="py-2 px-4 pr-4 pl-0 border-b">${contract.companyName}</td>
                        <td class="py-2 px-4 pr-4 pl-0 border-b">${contract.contractDetails}</td>
                        <td class="py-2 px-4 pr-4 pl-4 border-b">${new Date(contract.startDate).toLocaleDateString()}</td>
                        <td class="py-2 px-4 pr-4 pl-4 border-b">${new Date(contract.endDate).toLocaleDateString()}</td>
                        <td class="py-2 px-4 pr-4 pl-4 border-b">${status}</td>
                    </tr>
                `).join('');

                // Store fetched contracts on blockchain
                for (const contract of contractsResult) {
                    console.log("came inside");
                    await storeOnBlockchain(contract);
                }
            }
        } else {
            console.error('Error fetching contracts:', contractsResult.message);
            alert(`Error: ${contractsResult.message}`);
        }
    } catch (error) {
        console.error('Error connecting to server:', error);
        alert('Failed to connect to server. Please try again later.');
    }

    // Logout functionality
    document.getElementById('logout').addEventListener('click', function (e) {
        e.preventDefault();
        localStorage.removeItem('token');
        window.location.href = '/Public/login.html';
    });

    // Function to store fetched contracts on the blockchain
    async function storeOnBlockchain(contract) {
        try {
            // Connect to Web3 and Smart Contract
            const web3 = new Web3('http://127.0.0.1:7545'); // Ensure Ganache is running
            const accounts = await web3.eth.getAccounts();

            // Replace with your contract ABI and deployed address
            const contractABI = [
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_companyName",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_contractDetails",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "_startDate",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_endDate",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "_status",
				"type": "string"
			}
		],
		"name": "addContract",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "contracts",
		"outputs": [
			{
				"internalType": "string",
				"name": "companyName",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "contractDetails",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "startDate",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "endDate",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "status",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "index",
				"type": "uint256"
			}
		],
		"name": "getContract",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]
            ;
            const contractAddress = "0xd9145CCE52D386f254917e481eB44e9943F39138"; // Replace with your deployed contract address

            const blockchainContract = new web3.eth.Contract(contractABI, contractAddress);

            // Send transaction to store contract data
            const transaction = await blockchainContract.methods.addContract(
                contract.companyName,         // _companyName
                contract.contractDetails,     // _contractDetails
                Math.floor(new Date(contract.startDate).getTime() / 1000), // _startDate (Unix timestamp)
                Math.floor(new Date(contract.endDate).getTime() / 1000),   // _endDate (Unix timestamp)
                'Accepted'                    // _status
            ).send({
                from: accounts[0], // Default Ganache account
                gas: 300000
            });

            console.log(`Contract stored on blockchain. Transaction Hash: ${transaction.transactionHash}`);
            alert(`Contract "${contract.companyName}" stored on blockchain successfully!`);
        } catch (error) {
            console.error('Error storing contract on blockchain:', error);
            // alert(`Failed to store contract "${contract.companyName}" on blockchain.`);
        }
    }
});



