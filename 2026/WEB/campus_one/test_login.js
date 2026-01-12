// Native fetch used


async function testLogin() {
    try {
        const res = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'student@campus.edu', password: 'password123' })
        });

        console.log("Status:", res.status);
        const data = await res.json();
        console.log("Body:", data);

        if (res.status === 200 && data.success) {
            console.log("SUCCESS: Login worked and DB should be seeded.");
        } else {
            console.log("FAILURE");
        }
    } catch (e) {
        console.error("Error:", e.message);
    }
}

testLogin();
