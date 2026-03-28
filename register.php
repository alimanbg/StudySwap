<?php include 'templates/header.php'; ?>
<h2>Register</h2>
<form id="register-form">
    <div class="form-group">
        <label for="name">Full Name</label>
        <input type="text" id="name" name="name" required>
    </div>
    <div class="form-group">
        <label for="email">Email</label>
        <input type="email" id="email" name="email" required>
    </div>
    <div class="form-group">
        <label for="password">Password</label>
        <input type="password" id="password" name="password" required minlength="6">
    </div>
    <div class="form-group">
        <label for="confirm_password">Confirm Password</label>
        <input type="password" id="confirm_password" name="confirm_password" required>
    </div>
    <button type="submit">Register</button>
</form>
<p>Already have an account? <a href="login.php">Login</a></p>
<script>
    document.getElementById('register-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirm = document.getElementById('confirm_password').value;
        
        if (password !== confirm) {
            alert('Passwords do not match');
            return;
        }
        
        if (USE_MOCK) {
            alert('Mock registration successful! Please login.');
            window.location.href = 'login.php';
        } else {
            // Real registration
            const response = await fetch(API_BASE + 'register.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            const data = await response.json();
            if (data.success) {
                alert('Registration successful! Please login.');
                window.location.href = 'login.php';
            } else {
                alert('Registration failed: ' + data.message);
            }
        }
    });
</script>
<?php include 'templates/footer.php'; ?>
