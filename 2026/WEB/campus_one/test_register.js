async function testFlow() {
    const email = `test_user_${Math.floor(Math.random() * 1000)}@rutgers.edu`;
    const password = "test_password";

    console.log(`Trying to register: ${email}`);

    // 1. Register
    try {
        const regRes = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const regData = await regRes.json();
        console.log("Register Response:", regRes.status, regData);

        if (regRes.status !== 200) throw new Error("Registration Failed");

        // 2. Login
        console.log("Trying to login...");
        const loginRes = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const loginData = await loginRes.json();
        console.log("Login Response:", loginRes.status, loginData);

        if (loginRes.status === 200 && loginData.success) {
            console.log("SUCCESS: Full registration flow worked.");
        } else {
            console.log("FAILURE: Login after registration failed.");
        }

    } catch (e) {
        console.error("Error:", e.message);
    }
}

testFlow();
