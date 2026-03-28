// Mock listings data
const listings = [
    { id: 1, title: "Calculus Early Transcendentals", price: 45 },
    { id: 2, title: "Introduction to Algorithms", price: 60 }
];

function displayListings() {
    const container = document.getElementById('listings-container');
    if (!container) return;
    container.innerHTML = listings.map(listing => `
        <div class="listing-card">
            <h3>${listing.title}</h3>
            <p>$${listing.price}</p>
            <button onclick="addToCart(${listing.id})">Add to Cart</button>
        </div>
    `).join('');
}

function addToCart(id) {
    alert(`Added item ${id} to cart (mock)`);
}

displayListings();
