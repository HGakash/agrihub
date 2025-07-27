document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById('contractForm');
    const durationYearsInput = document.getElementById('durationYears');
    const errorMessage = document.getElementById('errorMessage');
    const farmerNameInput = document.getElementById('farmerName');
    const farmerProduceInput = document.getElementById('farmerProduce');

    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const farmerId = urlParams.get('farmerId');
    const farmerName = urlParams.get('farmerName');
    const farmerProduce = urlParams.get('farmerProduce');

    // Populate input fields with URL parameters if available
    if (farmerName) farmerNameInput.value = decodeURIComponent(farmerName);
    if (farmerProduce) farmerProduceInput.value = decodeURIComponent(farmerProduce);
    
    // If no URL parameters, make farmer fields editable too
    if (!farmerName) {
        farmerNameInput.removeAttribute('readonly');
    }
    if (!farmerProduce) {
        farmerProduceInput.removeAttribute('readonly');
    }

    // Calculate and display the contract duration in years
    function calculateDuration() {
        const startDate = new Date(document.getElementById('startDate').value);
        const endDate = new Date(document.getElementById('endDate').value);
        if (startDate && endDate && endDate >= startDate) {
            const diffInMs = endDate - startDate;
            const durationInYears = (diffInMs / (1000 * 60 * 60 * 24 * 365)).toFixed(2);
            durationYearsInput.value = durationInYears;
        } else {
            durationYearsInput.value = '';
        }
    }

    // Attach event listeners to date inputs to calculate duration when dates change
    document.getElementById('startDate').addEventListener('change', calculateDuration);
    document.getElementById('endDate').addEventListener('change', calculateDuration);

    // Handle form submission
    form.addEventListener('submit', async function(event) {
        event.preventDefault();

        const companyName = document.getElementById('companyName').value.trim();
        const contractDetails = document.getElementById('contractDetails').value.trim();
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        const pricePerUnit = parseFloat(document.getElementById('pricePerUnit').value);
        const gstNumber = document.getElementById('gstNumber').value;

    // Check if token exists
    const token = localStorage.getItem('token');
    console.log('=== DEBUG INFO ===');
    console.log('Current URL:', window.location.href);
    console.log('Token in localStorage:', token);
    console.log('All localStorage items:', {...localStorage});
    console.log('=== END DEBUG ===');
    
    if (!token) {
        alert('You must be logged in to create a contract. Redirecting to login...');
        window.location.href = 'login.html';
        return;
    }

        // Validate form fields
        if (!companyName || !contractDetails || !startDate || !endDate || isNaN(pricePerUnit) || pricePerUnit <= 0 || endDate < startDate) {
            errorMessage.classList.remove('hidden');
            return;
        }

        errorMessage.classList.add('hidden');

        const contractData = {
            farmerId: farmerId || null,
            farmerName: farmerNameInput.value,
            farmerProduce: farmerProduceInput.value,
            companyName,
            contractDetails,
            startDate,
            endDate,
            duration: durationYearsInput.value,
            pricePerUnit,
            gstNumber
        };

        // Send form data to the backend
        try {
            const response = await fetch('http://localhost:3000/contracts/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(contractData)
            });

            if (response.ok) {
                alert('Contract submitted successfully!');
                window.location.href = 'dealer-dashboard.html';
            } else if (response.status === 401) {
                alert('Session expired. Please login again.');
                window.location.href = 'login.html';
            } else {
                const errorData = await response.json();
                alert('Error: ' + (errorData.error || 'Unknown error occurred'));
            }
        } catch (error) {
            console.error('Error submitting contract:', error);
            alert('Server connection error. Make sure the backend is running on localhost:3000');
        }
    });
});