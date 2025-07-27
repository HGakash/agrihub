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
            const userNameElement = document.getElementById('userName');
            if (userNameElement) {
                userNameElement.textContent = userResult.name;
            }
            if (userResult.role !== 'farmer') {
                alert('Access denied. This dashboard is for farmers only.');
                window.location.href = '/Public/login.html';
                return;
            }
        } else {
            console.error('Error fetching user info:', userResult.message);
            alert(`Error: ${userResult.message}`);
            window.location.href = '/Public/login.html';
            return;
        }

        // Load farmer-specific data
        await loadAcceptedContracts();

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

    async function loadAcceptedContracts() {
        try {
            const loadingState = document.getElementById('loadingStateAccepted');
            const emptyState = document.getElementById('emptyStateAccepted');
            const tbody = document.getElementById('acceptedContractsList');
            
            // Show loading state
            if (loadingState) loadingState.classList.remove('hidden');
            if (emptyState) emptyState.classList.add('hidden');
            if (tbody) tbody.innerHTML = '';

            const response = await fetch('http://localhost:3000/contracts/accepted', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            // Handle 404 specifically for new farmers
            if (response.status === 404) {
                console.log('No farmer record found - this is normal for new farmers');
                if (loadingState) loadingState.classList.add('hidden');
                if (emptyState) emptyState.classList.remove('hidden');
                if (tbody) tbody.innerHTML = '';
                return;
            }
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const contracts = await response.json();
            
            // Hide loading state
            if (loadingState) loadingState.classList.add('hidden');
            
            if (contracts.length === 0) {
                if (emptyState) emptyState.classList.remove('hidden');
                if (tbody) tbody.innerHTML = '';
                return;
            }

            if (emptyState) emptyState.classList.add('hidden');
            
            if (tbody) {
                tbody.innerHTML = contracts.map(contract => `
                    <tr class="hover:bg-gray-50">
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="text-sm font-medium text-gray-900">${contract.companyName}</div>
                        </td>
                        <td class="px-6 py-4">
                            <div class="text-sm text-gray-900">${contract.contractDetails}</div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${new Date(contract.startDate).toLocaleDateString()}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${new Date(contract.endDate).toLocaleDateString()}</td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                Accepted
                            </span>
                        </td>
                    </tr>
                `).join('');
            }
            
        } catch (error) {
            console.error('Error loading accepted contracts:', error);
            const loadingState = document.getElementById('loadingStateAccepted');
            const emptyState = document.getElementById('emptyStateAccepted');
            const tbody = document.getElementById('acceptedContractsList');
            
            if (loadingState) loadingState.classList.add('hidden');
            if (emptyState) emptyState.classList.remove('hidden');
            if (tbody) tbody.innerHTML = '';
        }
    }
});
