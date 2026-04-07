(() => {
  const session = window.StoreAuth.getSession();
  if (!session) {
    window.location.replace("login.html?next=profile.html");
    return;
  }

  const cartCount = document.getElementById("cartCount");
  if (cartCount) cartCount.textContent = String(window.StoreAPI.cartCount());

  const usernameEl = document.getElementById("profileUsername");
  const uniEl = document.getElementById("profileUniversity");
  const emailEl = document.getElementById("profileEmailInline");
  const listRoot = document.getElementById("myListings");

  const username = window.StoreAuth.usernameFromEmail(session.email);
  const university = window.StoreAuth.universityFromEmail(session.email);
  if (usernameEl) usernameEl.textContent = username;
  if (uniEl) uniEl.textContent = university;
  if (emailEl) emailEl.textContent = session.email;

  function escapeHtml(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function renderListings() {
    const mine = window.StoreAPI
      .getUserListings()
      .filter((x) => (x.ownerEmail || "").toLowerCase() === session.email.toLowerCase());
    const offersByListing = {};
    window.StoreAPI.listThreads().forEach((t) => {
      const listingId = t.meta?.listingId;
      const ownerEmail = (t.meta?.listingOwnerEmail || "").toLowerCase();
      if (!listingId || ownerEmail !== session.email.toLowerCase()) return;
      const incoming = (t.lastMessage && !t.lastMessage.fromMe) ? 1 : 0;
      offersByListing[listingId] = (offersByListing[listingId] || 0) + incoming;
    });
    if (!mine.length) {
      listRoot.innerHTML = `<div class="empty-chats"><p class="micro">NO LISTINGS YET</p><p class="micro">Add your first book below.</p></div>`;
      return;
    }
    listRoot.innerHTML = mine
      .map((p) => {
        const badge = p.exchangeOnly ? "EXCHANGE ONLY" : "FOR SALE";
        const offerCount = offersByListing[p.id] || 0;
        return `<div class="profile-listing">
          <a class="profile-listing-main" href="product.html?id=${encodeURIComponent(p.id)}">
            <div class="profile-listing-title">${escapeHtml(p.name)}</div>
            <div class="profile-listing-sub micro">${escapeHtml(p.courseCode)} · ${escapeHtml(badge)} · OFFERS ${offerCount}</div>
          </a>
          <button type="button" class="profile-del" data-id="${escapeHtml(p.id)}">REMOVE</button>
        </div>`;
      })
      .join("");
  }

  listRoot?.addEventListener("click", (e) => {
    const btn = e.target instanceof HTMLElement ? e.target.closest(".profile-del") : null;
    if (!btn || !(btn instanceof HTMLElement)) return;
    const id = btn.dataset.id;
    if (!id) return;
    window.StoreAPI.removeUserListing(id);
    renderListings();
  });

  renderListings();
})();

