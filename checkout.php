<?php include 'templates/header.php'; ?>
<h2>Checkout</h2>
<div id="checkout-summary"></div>
<form id="checkout-form">
    <div class="form-group">
        <label for="address">Shipping Address</label>
        <textarea id="address" name="address" required></textarea>
    </div>
    <button type="submit">Place Order</button>
</form>
<script>
    async function loadCheckout() {
        let cartItems;
        if (USE_MOCK) {
            const response = await fetch('/study-swap/mock/cart.json');
            cartItems = await response.json();
        } else {
            const response = await fetch(API_BASE + 'cart.php');
            cartItems = await response.json();
        }
        if (cartItems.length === 0) {
            document.getElementById('checkout-summary').innerHTML = '<p>Your cart is empty. <a href="index.php">Continue shopping</a></p>';
            document.getElementById('checkout-form').style.display = 'none';
            return;
        }
        const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        document.getElementById('checkout-summary').innerHTML = `
            <h3>Order Summary</h3>
            <ul>${cartItems.map(item => `<li>${item.title} x ${item.quantity} = $${(item.price * item.quantity).toFixed(2)}</li>`).join('')}</ul>
            <p><strong>Total: $${total.toFixed(2)}</strong></p>
        `;
    }
    
    document.getElementById('checkout-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (USE_MOCK) {
            alert('Order placed! (mock)');
            window.location.href = 'order-confirmation.php';
        } else {
            // Real submit
            const formData = new FormData(e.target);
            const address = formData.get('address');
            const response = await fetch(API_BASE + 'checkout.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address })
            });
            if (response.ok) {
                window.location.href = 'order-confirmation.php';
            }
        }
    });
    
    loadCheckout();
</script>
<?php include 'templates/footer.php'; ?>
