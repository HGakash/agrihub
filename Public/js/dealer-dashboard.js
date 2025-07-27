document.addEventListener('DOMContentLoaded', async function () {
    const token = localStorage.getItem('token');
    
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
            if (userResult.role !== 'dealer') {
                alert('Access denied. This dashboard is for dealers only.');
                window.location.href = '/Public/login.html';
                return;
            }
        } else {
            console.error('Error fetching user info:', userResult.message);
            alert(`Error: ${userResult.message}`);
            window.location.href = '/Public/login.html';
            return;
        }

        // Load dealer-specific data
        await loadAllContracts();

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

    async function loadAllContracts() {
        try {
            const loadingState = document.getElementById('loadingStateAll');
            const emptyState = document.getElementById('emptyStateAll');
            const tbody = document.getElementById('allContractsList');
            
            // Show loading state
            if (loadingState) loadingState.classList.remove('hidden');
            if (emptyState) emptyState.classList.add('hidden');
            if (tbody) tbody.innerHTML = '';

            console.log('Loading contracts for dealer...');
            
            const response = await fetch('http://localhost:3000/contracts/dealer/all', {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            
            const contracts = await response.json();
            console.log('Raw API response:', contracts);
            console.log('Total contracts:', contracts.length);
            
            // Check for rejected contracts specifically
            const rejectedContracts = contracts.filter(c => c.status === 'rejected');
            console.log('Rejected contracts found:', rejectedContracts.length);
            console.log('Rejected contract details:', rejectedContracts);
            
            // Hide loading state
            if (loadingState) loadingState.classList.add('hidden');
            
            if (contracts.length === 0) {
                console.log('No contracts found at all');
                if (emptyState) emptyState.classList.remove('hidden');
                if (tbody) tbody.innerHTML = '';
                return;
            }

            if (emptyState) emptyState.classList.add('hidden');
            
            // Display all contracts with clear status indicators
            const statusCounts = {
                pending: contracts.filter(c => c.status === 'pending').length,
                accepted: contracts.filter(c => c.status === 'accepted').length,
                rejected: contracts.filter(c => c.status === 'rejected').length
            };
            console.log('Final status counts:', statusCounts);
            
            if (tbody) {
                let html = '';
                contracts.forEach((contract, index) => {
                    console.log(`Contract ${index}:`, contract._id, contract.status, contract.farmerName || 'No farmer name');
                    html += `
                        <tr class="hover:bg-gray-50">
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="flex items-center">
                                    <div class="ml-4">
                                        <div class="text-sm font-medium text-gray-900">${contract.farmerName || 'Farmer ID: ' + contract.farmerId}</div>
                                        <div class="text-sm text-gray-500">${contract.farmerEmail || 'No email'}</div>
                                    </div>
                                </div>
                            </td>
                            <td class="px-6 py-4">
                                <div class="text-sm text-gray-900">${contract.contractDetails || 'No details'}</div>
                                <div class="text-sm text-gray-500">${contract.companyName || 'No company'}</div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${new Date(contract.startDate).toLocaleDateString()}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${new Date(contract.endDate).toLocaleDateString()}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹${contract.pricePerUnit || 0}</td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    contract.status === 'accepted' ? 'bg-green-100 text-green-800' : 
                                    contract.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                    contract.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                                    'bg-gray-100 text-gray-800'
                                }">
                                    ${(contract.status || 'unknown').toUpperCase()}
                                </span>
                            </td>
                        </tr>
                    `;
                });
                tbody.innerHTML = html;
                
                // Add summary row
                const summaryRow = `
                    <tr class="bg-gray-100">
                        <td colspan="6" class="px-6 py-3 text-sm text-gray-700">
                            <strong>Summary:</strong> 
                            Total: ${contracts.length} | 
                            Pending: ${statusCounts.pending} | 
                            Accepted: ${statusCounts.accepted} | 
                            Rejected: ${statusCounts.rejected}
                        </td>
                    </tr>
                `;
                tbody.insertAdjacentHTML('beforeend', summaryRow);
            }
            
        } catch (error) {
            console.error('Error loading all contracts:', error);
            const loadingState = document.getElementById('loadingStateAll');
            const emptyState = document.getElementById('emptyStateAll');
            const tbody = document.getElementById('allContractsList');
            
            if (loadingState) loadingState.classList.add('hidden');
            if (emptyState) emptyState.classList.remove('hidden');
            if (tbody) tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-red-500">Error loading contracts. Please try again.</td></tr>';
        }
    }

    
});
