document.addEventListener('DOMContentLoaded', async () => {
    const contractsList = document.getElementById('contractsList');
    const loadingDiv = document.getElementById('loading');
    loadingDiv.classList.remove('hidden');

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            alert("Please log in first.");
            window.location.href = '/login';
            return;
        }

        // First, get user role to determine which endpoint to use
        const userResponse = await fetch('http://localhost:3000/api/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const userData = await userResponse.json();
        const userRole = userData.role;

        let endpoint = '';
        if (userRole === 'dealer') {
            // For dealers: show all contracts they created
            endpoint = 'http://localhost:3000/contracts/dealer/all';
        } else {
            // For farmers: show pending contracts created for them
            endpoint = 'http://localhost:3000/contracts/farmer/mycontract';
        }

        console.log('Fetching contracts...');
        const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch contracts');
        }

        const contracts = await response.json();
        console.log('Received contracts:', contracts.length);
        loadingDiv.classList.add('hidden');

        if (contracts.length === 0) {
            contractsList.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <i class="fas fa-inbox text-6xl text-green-300 mb-4"></i>
                    <p class="text-green-700 text-lg">No pending contracts available</p>
                    <p class="text-green-600 text-sm mt-2">Dealers will create contracts for you to review</p>
                </div>`;
            return;
        }

        contracts.forEach(contract => {
            const contractCard = document.createElement('div');
            contractCard.className = "contract-card p-6";

            contractCard.innerHTML = `
                <div class="mb-4">
                    <div class="flex items-center">
                        <div class="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center mr-4">
                            <i class="fas fa-building text-green-700"></i>
                        </div>
                        <div>
                            <p class="text-lg font-semibold text-green-800">${contract.companyName}</p>
                            <p class="text-sm text-green-700">GSTIN: ${contract.gstNumber}</p>
                            <p class="text-xs text-green-600">Contract by Dealer</p>
                        </div>
                    </div>
                </div>

                <div class="text-sm text-green-800 space-y-2">
                    <p><strong>Contract Details:</strong> ${contract.contractDetails}</p>
                    <p><strong>Price Per Unit:</strong> ₹${contract.pricePerUnit}</p>
                    <p><strong>Start:</strong> ${new Date(contract.startDate).toLocaleDateString()}</p>
                    <p><strong>End:</strong> ${new Date(contract.endDate).toLocaleDateString()}</p>
                    <p><strong>Duration:</strong> ${contract.duration} years</p>
                </div>

                <div class="mt-4 flex justify-between space-x-2">
                    <button onclick="acceptContract('${contract._id}')" class="btn-primary text-white font-medium py-2 px-4 rounded-lg">
                        <i class="fas fa-check mr-2"></i>Accept
                    </button>
                    <button onclick="rejectContract('${contract._id}')" class="btn-secondary text-white font-medium py-2 px-4 rounded-lg">
                        <i class="fas fa-times mr-2"></i>Reject
                    </button>
                </div>
            `;

            contractsList.appendChild(contractCard);
        });

    } catch (error) {
        console.error('Error fetching contracts:', error);
        loadingDiv.classList.add('hidden');
        contractsList.innerHTML = `
            <div class="col-span-full text-center mt-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded">
                <p class="font-semibold">Failed to load contracts: ${error.message}</p>
                <button onclick="location.reload()" class="mt-2 bg-green-600 text-white px-4 py-2 rounded">
                    Retry
                </button>
            </div>`;
    }
});

async function acceptContract(contractId) {
    try {
        const token = localStorage.getItem('token');
        
        const response = await fetch(`http://localhost:3000/contracts/accept/${contractId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const result = await response.json();

        if (response.ok) {
            alert('✅ Contract accepted!');
            window.location.reload();
        } else {
            alert(`❌ Error: ${result.error}`);
        }
    } catch (error) {
        console.error('Error accepting contract:', error);
        alert('❌ Failed to accept contract. Try again later.');
    }
}

async function rejectContract(contractId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3000/contracts/reject/${contractId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const result = await response.json();

        if (response.ok) {
            alert('🗑️ Contract rejected!');
            window.location.reload();
        } else {
            alert(`❌ Error: ${result.error}`);
        }
    } catch (error) {
        console.error('Error rejecting contract:', error);
        alert('❌ Failed to reject contract. Try again later.');
    }
}
