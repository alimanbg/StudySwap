// Configuration
const USE_MOCK = true;
const API_BASE = '/study-swap/api/'; // will be used when backend is ready

// Helper: fetch listings (mock or real)
async function fetchListings() {
    if (USE_MOCK) {
        const response = await fetch('/study-swap/mock/listings.json');
        return await response.json();
    } else {
        const response = await fetch(API_BASE + 'listings.php');
        return await response.json();
    }
}

// Display listings in grid
function displayListings(listings) {
    const container = document.getElementById('listings-container');
    if (!container) return;
    
    container.innerHTML = listings.map(listing => `
        <div class="listing-card">
            <img src="${listing.image_url}" alt="${listing.title}">
            <h3>${listing.title}</h3>
            <p class="price">$${listing.price}</p>
            <p class="condition">Condition: ${listing.condition}</p>
            <button class="add-to-cart" data-id="${listing.id}">Add to Cart</button>
        </div>
    `).join('');
    
    // Attach event listeners
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const listingId = btn.dataset.id;
            addToCart(listingId);
        });
    });
}

// Add to cart (mock or real)
async function addToCart(listingId) {
    if (USE_MOCK) {
        alert('Added to cart (mock)');
        updateCartCount(1);
    } else {
        try {
            const response = await fetch(API_BASE + 'cart.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ listing_id: listingId, quantity: 1 })
            });
            const data = await response.json();
            if (data.success) {
                updateCartCount(1);
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
        }
    }
}

// Update cart count display
function updateCartCount(change) {
    const countSpan = document.getElementById('cart-count');
    if (countSpan) {
        let current = parseInt(countSpan.innerText) || 0;
        countSpan.innerText = current + change;
    }
}

// Load listings on homepage
if (document.getElementById('listings-container')) {
    fetchListings().then(displayListings).catch(console.error);
}
