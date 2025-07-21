document.addEventListener('DOMContentLoaded', async () => {
    const contractsList = document.getElementById('contractsList');
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'loading';
    loadingDiv.className = 'text-center text-green-600 mb-6';
    loadingDiv.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i>Loading contracts...`;
    contractsList.appendChild(loadingDiv);

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            alert("Please log in first.");
            window.location.href = '/login';
            return;
        }

        const response = await fetch('http://localhost:3000/contracts/farmer/mycontract', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch contracts');

        const contracts = await response.json();
        loadingDiv.remove();

        if (contracts.length === 0) {
            contractsList.innerHTML = `
                <p class="text-center text-gray-500 text-lg mt-6">
                    No pending contracts available.
                </p>`;
            return;
        }

        contracts.forEach(contract => {
            const contractCard = document.createElement('div');
            contractCard.className = "bg-white p-6 rounded-xl shadow-md border border-gray-200 floating-box";

            contractCard.innerHTML = `
                <div class="mb-4">
                    <div class="flex items-center">
                        <div class="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center mr-4">
                            <i class="fas fa-building text-green-700"></i>
                        </div>
                        <div>
                            <p class="text-lg font-semibold text-green-700">${contract.companyName}</p>
                            <p class="text-sm text-gray-600">GSTIN: ${contract.gstNumber}</p>
                            <p class="text-xs text-gray-500">Dealer</p>
                        </div>
                    </div>
                </div>

                <div class="text-sm text-gray-700 space-y-2">
                    <p><strong>Produce:</strong> ${contract.farmerProduce}</p>
                    <p><strong>Contract Details:</strong> ${contract.contractDetails}</p>
                    <p><strong>Price Per Unit:</strong> ₹${contract.pricePerUnit}</p>
                    <p><strong>Start:</strong> ${new Date(contract.startDate).toLocaleDateString()}</p>
                    <p><strong>End:</strong> ${new Date(contract.endDate).toLocaleDateString()}</p>
                    <p><strong>Duration:</strong> ${contract.duration} years</p>
                </div>

                <div class="mt-4 flex justify-between">
                    <button onclick="acceptContract('${contract._id}')" class="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg shadow">
                        <i class="fas fa-check mr-2"></i>Accept
                    </button>
                    <button onclick="rejectContract('${contract._id}')" class="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg shadow">
                        <i class="fas fa-times mr-2"></i>Reject
                    </button>
                </div>
            `;

            contractsList.appendChild(contractCard);
        });

    } catch (error) {
        console.error('Error fetching contracts:', error);
        contractsList.innerHTML = `
            <div class="text-center mt-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded">
                <p class="font-semibold">Failed to load contracts. Please try again later.</p>
            </div>`;
    }
});

async function acceptContract(contractId) {
    try {
        const response = await fetch(`http://localhost:3000/contracts/accept/${contractId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
                // 'Authorization': `Bearer ${token}`
            }
        });

        const result = await response.json();

        if (response.ok) {
            alert('✅ Contract accepted!');
            window.location.href = '/Public/dashboard.html';
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
            window.location.reload(); // ✅ Simple fix
        } else {
            alert(`❌ Error: ${result.error}`);
        }
    } catch (error) {
        console.error('Error rejecting contract:', error);
        alert('❌ Failed to reject contract. Try again later.');
    }
}
