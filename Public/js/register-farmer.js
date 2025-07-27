// register-farmer.js

document.getElementById('farmerForm').addEventListener('submit', async function (e) {
    e.preventDefault(); // Prevent form submission from refreshing the page

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const location = document.getElementById('location').value;
    const produce = document.getElementById('produce').value;
    const experience = document.getElementById('experience').value;
    const contact = document.getElementById('contact').value;

    const farmerData = {
        name,
        email,
        location,
        produce,
        experience,
        contact
    };

    try {
        const response = await fetch('http://localhost:3000/api/farmers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(farmerData),
        });

        const result = await response.json();

        if (response.ok) {
            alert('Farmer registered successfully!');
            window.location.href = 'farmer-dashboard.html'; // Redirect to farmer dashboard on successful registration
        } else {
            alert(`Error: ${result.message}`);
        }
    } catch (error) {
        console.error('Error registering farmer:', error);
        alert('Failed to register farmer. Please try again later.');
    }
});