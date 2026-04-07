(() => {
  const session = window.StoreAuth.getSession();
  if (!session) {
    window.location.replace("login.html?next=my-offers.html");
    return;
  }
  const root = document.getElementById("myOffersDashboard");
  const cartCount = document.getElementById("cartCount");
  if (cartCount) cartCount.textContent = String(window.StoreAPI.cartCount());
  if (!root) return;

  const myEmail = String(session.email || "").toLowerCase();
  const esc = (v) => String(v || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const threads = window.StoreAPI.listThreadsForUser(myEmail, "offers");
  const products = window.StoreAPI.getAllProducts();

  if (!threads.length) {
    root.innerHTML = `<div class="empty-chats"><p class="micro">NO OFFERS SENT YET</p><p class="micro">Open a book and request exchange to start.</p></div>`;
    return;
  }

  root.innerHTML = threads
    .map((t) => {
      const listingId = t.meta?.listingId;
      const product = products.find((p) => p.id === listingId);
      return `<section class="listing-dash-card">
        <div class="listing-dash-top">
          <a href="product.html?id=${encodeURIComponent(listingId || "")}" class="listing-dash-image"><img src="${esc(product?.image_url || "")}" alt="${esc(product?.name || "Listing")}" /></a>
          <div class="listing-dash-meta">
            <h3 class="listing-dash-title">${esc(product?.name || t.meta?.listingName || "Book listing")}</h3>
            <p class="micro">${esc(product?.courseCode || "")} · OWNER: ${esc(t.meta?.listingOwnerName || t.peerName)}</p>
            <p class="micro">YOUR CHAT</p>
          </div>
        </div>
        <div class="chat-list">
          <a class="chat-row" href="chat.html?peer=${encodeURIComponent(t.peerKey)}">
            <p class="chat-row-name">${esc(t.peerName)}</p>
            <p class="chat-row-preview">${esc(t.lastMessage?.text || "Open chat")}</p>
          </a>
        </div>
      </section>`;
    })
    .join("");
})();

