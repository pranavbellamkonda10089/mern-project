fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        name: 'testuser',
        email: 'test@college.edu',
        password: 'password123'
    })
}).then(res => res.json().then(data => console.log('STATUS:', res.status, 'BODY:', data)))
    .catch(err => console.log('ERROR:', err.message));
