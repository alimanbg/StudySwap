<?php include 'templates/header.php'; ?>
<h2>Listing Details</h2>
<div id="listing-detail">
    <p>Loading...</p>
</div>
<script>
    // Simulate fetching single listing (can be extended later)
    const urlParams = new URLSearchParams(window.location.search);
    const listingId = urlParams.get('id');
    if (listingId) {
        fetch('/study-swap/mock/listings.json')
            .then(res => res.json())
            .then(listings => {
                const listing = listings.find(l => l.id == listingId);
                if (listing) {
                    document.getElementById('listing-detail').innerHTML = `
                        <div class="listing-card">
                            <img src="${listing.image_url}" alt="${listing.title}">
                            <h3>${listing.title}</h3>
                            <p>Seller: ${listing.seller}</p>
                            <p>Price: $${listing.price}</p>
                            <p>Condition: ${listing.condition}</p>
                            <button class="add-to-cart" data-id="${listing.id}">Add to Cart</button>
                        </div>
                    `;
                    document.querySelector('.add-to-cart').addEventListener('click', () => addToCart(listing.id));
                }
            });
    }
</script>
<?php include 'templates/footer.php'; ?>
