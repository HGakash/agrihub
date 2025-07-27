document.getElementById('loginForm').addEventListener('submit', async function (event) {
    event.preventDefault(); // Prevent the default form submission

    // Collect form data
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;

    // Create a request body
    const formData = { email, password, role };

    try {
        // Send POST request to the backend
        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const result = await response.json();
        if (response.ok) {
            // Store token in local storage
            localStorage.setItem('token', result.token);
            console.log(result.token)
            console.log('Login successful:', result);
            alert('Login successful! Redirecting to dashboard...');
            
            // Decode token to get user role
            const tokenPayload = JSON.parse(atob(result.token.split('.')[1]));
            const userRole = tokenPayload.role;
            
            // Redirect based on role
            if (userRole === 'farmer') {
                window.location.href = '/Public/farmer-dashboard.html';
            } else if (userRole === 'dealer') {
                window.location.href = '/Public/dealer-dashboard.html';
            } else {
                window.location.href = '/Public/dashboard.html'; // Fallback
            }
        } else {
            console.error('Error during login:', result.message);
            alert(`Error: ${result.message}`);
        }
    } catch (error) {
        console.error('Error connecting to server:', error);
        alert('Failed to connect to server. Please try again later.');
    }
});




// document.getElementById('loginForm').addEventListener('submit', async function (event) {
//     event.preventDefault(); // Prevent the default form submission

//     // Collect form data
//     const email = document.getElementById('email').value;
//     const password = document.getElementById('password').value;
//     const role = document.getElementById('role').value;

//     // Create a request body
//     const formData = {
//         email: email,
//         password: password,
//         role: role
//     };

//     try {
//         // Send POST request to the backend
//         const response = await fetch('http://localhost:3000/api/login', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify(formData)
//         });

//         // Parse the response
//         const result = await response.json();

//         // Check for successful login
//         if (response.ok) {
//             console.log('User logged in successfully:', result);
//             alert('Login successful! Redirecting...');
//             window.location.href = '/Public/dashboard.html'; // Redirect to a dashboard or another page
//         } else {
//             console.error('Error during login:', result.message);
//             alert(`Error: ${result.message}`);
//         }
//     } catch (error) {
//         console.error('Error connecting to server:', error);
//         alert('Failed to connect to server. Please try again later.');
//     }
// });


