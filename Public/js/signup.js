document.getElementById('signupForm').addEventListener('submit', async function (event) {
    event.preventDefault(); // Prevent the default form submission

    // Collect form data
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;

    // Create a request body
    const formData = { name, email, password, role };

    try {
        // Send POST request to the backend
        const response = await fetch('http://localhost:3000/api/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const result = await response.json();
        if (response.ok) {
            console.log('User signed up successfully:', result);
            alert('Sign-up successful! Redirecting to login page...');
            window.location.href = '/Public/login.html'; // Redirect to login page after signup
        } else {
            console.error('Error during signup:', result.message);
            alert(`Error: ${result.message}`);
        }
    } catch (error) {
        console.error('Error connecting to server:', error);
        alert('Failed to connect to server. Please try again later.');
    }
});





// document.getElementById('signupForm').addEventListener('submit', async function (event) {
//     event.preventDefault(); // Prevent the default form submission

//     // Collect form data
//     const name = document.getElementById('name').value;
//     const email = document.getElementById('email').value;
//     const password = document.getElementById('password').value;
//     const role = document.getElementById('role').value;

//     // Create a request body
//     const formData = {
//         name: name,
//         email: email,
//         password: password,
//         role: role
//     };

//     try {
//         // Send POST request to the backend
//         console.log('sending request');
//         const response = await fetch('http://localhost:3000/api/signup', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify(formData)
//         });

//         // Parse the response
//         const result = await response.json();

//         // Check for successful signup
//         if (response.ok) {
//             console.log('User signed up successfully:', result);
//             alert('Sign-up successful! Redirecting to login page...');
//             window.location.href = '/Public/login.html'; // Redirect to login page after signup
//         } else {
//             console.error('Error during signup:', result.message);
//             alert(`Error: ${result.message}`);
//         }
//     } catch (error) {
//         console.error('Error connecting to server:', error);
//         alert('Failed to connect to server. Please try again later.');
//     }
// });
