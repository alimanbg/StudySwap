<?php include 'templates/header.php'; ?>
<h2>Login</h2>
<form id="login-form">
    <div class="form-group">
        <label for="email">Email</label>
        <input type="email" id="email" name="email" required>
    </div>
    <div class="form-group">
        <label for="password">Password</label>
        <input type="password" id="password" name="password" required>
    </div>
    <button type="submit">Login</button>
</form>
<p>Don't have an account? <a href="register.php">Register</a></p>
<script>
    document.getElementById('login-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        if (USE_MOCK) {
            alert('Mock login successful!');
            window.location.href = 'index.php';
        } else {
            // Real login
            const response = await fetch(API_BASE + 'login.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            if (data.success) {
                window.location.href = 'index.php';
            } else {
                alert('Login failed: ' + data.message);
            }
        }
    });
</script>
<?php include 'templates/footer.php'; ?>
