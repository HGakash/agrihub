// farmer-list.js

document.addEventListener("DOMContentLoaded", async () => {
    const farmerList = document.getElementById("farmerList");

    try {
        const response = await fetch("http://localhost:3000/api/farmers");
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const farmers = await response.json();

        if (!farmers || farmers.length === 0) {
            farmerList.innerHTML = `
                <div class="col-span-full text-center">
                    <p class="text-green-700 text-lg mb-4">No farmers registered yet.</p>
                    <p class="text-green-600">Please register some farmers first to see them here.</p>
                </div>
            `;
            return;
        }

        farmers.forEach(farmer => {
            const farmerCard = document.createElement('div');
            farmerCard.className = 'farmer-card p-6 rounded-xl shadow-lg';
            farmerCard.innerHTML = `
                <h2 class="text-xl font-bold mb-3 text-green-800">
                    <i class="fas fa-user text-green-600 mr-2"></i>
                    ${farmer.name || 'Unknown Farmer'}
                </h2>
                <div class="space-y-2">
                    <p class="text-green-700">
                        <i class="fas fa-map-marker-alt text-green-600 mr-2"></i>
                        <span class="font-semibold">Location:</span> ${farmer.location || 'Not specified'}
                    </p>
                    <p class="text-green-700">
                        <i class="fas fa-seedling text-green-600 mr-2"></i>
                        <span class="font-semibold">Produce:</span> ${farmer.produce || 'Not specified'}
                    </p>
                    <p class="text-green-700">
                        <i class="fas fa-clock text-green-600 mr-2"></i>
                        <span class="font-semibold">Experience:</span> ${farmer.experience || 0} years
                    </p>
                    <p class="text-green-700">
                        <i class="fas fa-phone text-green-600 mr-2"></i>
                        <span class="font-semibold">Contact:</span> ${farmer.contact || 'Not provided'}
                    </p>
                </div>
                <button class="mt-4 btn-primary text-white px-4 py-2 rounded-lg transition-all hover:shadow-md cursor-pointer" 
                    onclick="createContract('${farmer._id}', '${farmer.name || ''}', '${farmer.produce || ''}')">
                    <i class="fas fa-file-signature mr-2"></i>Create Contract
                </button>
            `;
            farmerList.appendChild(farmerCard);
        });
    } catch (error) {
        console.error("Error fetching farmers:", error);
        farmerList.innerHTML = `
            <div class="col-span-full text-center">
                <p class="text-red-500 text-lg mb-4">Error loading farmers: ${error.message}</p>
                <p class="text-green-600">Please ensure the server is running and try refreshing the page.</p>
                <button class="btn-primary text-white px-4 py-2 rounded-lg mt-4" onclick="location.reload()">
                    <i class="fas fa-refresh mr-2"></i>Refresh
                </button>
            </div>
        `;
    }
});

function createContract(farmerId, farmerName, farmerProduce) {
    console.log('Button clicked!');
    console.log('Farmer ID:', farmerId);
    console.log('Farmer Name:', farmerName);
    console.log('Farmer Produce:', farmerProduce);
    
    if (!farmerId) {
        alert('Invalid farmer data. Please try again.');
        return;
    }
    
    // Redirect to contract creation page with farmer details in the query string
    const url = `create-contract.html?farmerId=${encodeURIComponent(farmerId)}&farmerName=${encodeURIComponent(farmerName || '')}&farmerProduce=${encodeURIComponent(farmerProduce || '')}`;
    console.log('Redirecting to:', url);
    window.location.href = url;
}
