<?php include 'templates/header.php'; ?>
<h2>Shopping Cart</h2>
<div id="cart-container">
    <p>Loading...</p>
</div>
<div id="cart-total" class="cart-total"></div>
<button id="checkout-btn" style="display: none;">Proceed to Checkout</button>
<script>
    async function fetchCart() {
        let cartItems;
        if (USE_MOCK) {
            const response = await fetch('/study-swap/mock/cart.json');
            cartItems = await response.json();
        } else {
            const response = await fetch(API_BASE + 'cart.php');
            cartItems = await response.json();
        }
        displayCart(cartItems);
        return cartItems;
    }
    
    function displayCart(items) {
        const container = document.getElementById('cart-container');
        const checkoutBtn = document.getElementById('checkout-btn');
        if (items.length === 0) {
            container.innerHTML = '<p>Your cart is empty.</p>';
            checkoutBtn.style.display = 'none';
            return;
        }
        container.innerHTML = items.map(item => `
            <div class="cart-item" data-id="${item.listing_id}">
                <img src="${item.image_url}" width="50">
                <h3>${item.title}</h3>
                <p>$${item.price}</p>
                <input type="number" value="${item.quantity}" min="1" class="cart-qty" data-id="${item.listing_id}">
                <button class="remove-item" data-id="${item.listing_id}">Remove</button>
            </div>
        `).join('');
        
        const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        document.getElementById('cart-total').innerHTML = `<strong>Total: $${total.toFixed(2)}</strong>`;
        checkoutBtn.style.display = 'block';
        
        // Add event listeners for quantity and remove
        document.querySelectorAll('.cart-qty').forEach(input => {
            input.addEventListener('change', (e) => {
                const listingId = e.target.dataset.id;
                const newQty = parseInt(e.target.value);
                updateCartQuantity(listingId, newQty);
            });
        });
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const listingId = btn.dataset.id;
                removeFromCart(listingId);
            });
        });
    }
    
    async function updateCartQuantity(listingId, quantity) {
        if (USE_MOCK) {
            alert('Mock: quantity updated');
            fetchCart(); // refresh
        } else {
            // Real update
        }
    }
    
    async function removeFromCart(listingId) {
        if (USE_MOCK) {
            alert('Mock: item removed');
            fetchCart();
        } else {
            // Real remove
        }
    }
    
    document.getElementById('checkout-btn')?.addEventListener('click', () => {
        window.location.href = 'checkout.php';
    });
    
    fetchCart();
</script>
<?php include 'templates/footer.php'; ?>
