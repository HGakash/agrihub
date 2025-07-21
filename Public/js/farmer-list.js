// farmer-list.js

document.addEventListener("DOMContentLoaded", async () => {
    const farmerList = document.getElementById("farmerList");

    try {
        const response = await fetch("http://localhost:3000/api/farmers");
        const farmers = await response.json();

        farmers.forEach(farmer => {
            const farmerCard = `
            <div class="card p-6 rounded-lg shadow-md">
                <h2 class="text-xl font-bold mb-2 text-white">Farmer Name: ${farmer.name}</h2>
                <p class="text-white"><span class="font-bold">Location:</span>  ${farmer.location}</p>
                <p class="text-white"><span class="font-bold">Produce:</span> ${farmer.produce}</p>
                <p class="text-white"><span class="font-bold">Experience:</span> ${farmer.experience} years</p>
                <p class="text-white"><span class="font-bold">Contact:</span> ${farmer.contact}</p>
                <button class="button mt-4 bg-blue-500 text-white px-4 py-2 rounded" 
                    onclick="createContract('${farmer._id}', '${farmer.name}', '${farmer.produce}')">
                    Create Contract
                </button>
            </div>`;
            farmerList.innerHTML += farmerCard;
        });
    } catch (error) {
        console.error("Error fetching farmers:", error);
    }
});

function createContract(farmerId, farmerName, farmerProduce) {
    // Redirect to contract creation page with farmer details in the query string
    window.location.href = `create-contract.html?farmerId=${farmerId}&farmerName=${encodeURIComponent(farmerName)}&farmerProduce=${encodeURIComponent(farmerProduce)}`;
}

