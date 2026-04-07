(() => {
  const session = window.StoreAuth.getSession();
  if (!session) {
    window.location.replace("login.html?next=my-listings.html");
    return;
  }
  const root = document.getElementById("myListingsDashboard");
  const form = document.getElementById("addListingForm");
  const errEl = document.getElementById("listingError");
  const okEl = document.getElementById("listingSuccess");
  const uniSelect = document.getElementById("listingUni");
  const exchangeOnlyCb = document.getElementById("listingExchangeOnly");
  const priceField = document.getElementById("priceField");
  const priceInput = document.getElementById("listingPrice");
  const openBtn = document.getElementById("openAddListingBtn");
  const closeBtn = document.getElementById("closeAddListingBtn");
  const sheet = document.getElementById("listingSheet");
  const cartCount = document.getElementById("cartCount");
  if (cartCount) cartCount.textContent = String(window.StoreAPI.cartCount());
  if (!root) return;

  const myEmail = String(session.email || "").toLowerCase();
  const username = window.StoreAuth.usernameFromEmail(session.email);
  const university = window.StoreAuth.universityFromEmail(session.email);
  const esc = (v) => String(v || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  if (uniSelect) {
    uniSelect.innerHTML = window.Store.hkUniversities
      .map((u) => `<option value="${u.replace(/&/g, "&amp;").replace(/\"/g, "&quot;")}">${u}</option>`)
      .join("");
    const idx = window.Store.hkUniversities.indexOf(university);
    if (idx >= 0) uniSelect.selectedIndex = idx;
  }

  function openSheet() {
    if (!sheet) return;
    sheet.hidden = false;
  }
  function closeSheet() {
    if (!sheet) return;
    sheet.hidden = true;
  }
  openBtn?.addEventListener("click", openSheet);
  closeBtn?.addEventListener("click", closeSheet);
  sheet?.addEventListener("click", (e) => {
    if (e.target === sheet) closeSheet();
  });

  function syncExchangeOnlyUI() {
    const ex = Boolean(exchangeOnlyCb?.checked);
    if (priceField) priceField.style.display = ex ? "none" : "grid";
  }
  exchangeOnlyCb?.addEventListener("change", syncExchangeOnlyUI);
  priceInput?.addEventListener("input", () => {
    priceInput.value = String(priceInput.value || "").replace(/[^\d]/g, "");
  });
  syncExchangeOnlyUI();

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (errEl) errEl.hidden = true;
    if (okEl) {
      okEl.hidden = true;
      okEl.classList.remove("show");
    }

    const title = String(document.getElementById("listingTitle")?.value || "").trim();
    const courseCode = String(document.getElementById("listingCourse")?.value || "").trim().toUpperCase();
    const exchangeOnly = Boolean(exchangeOnlyCb?.checked);
    const wantedInExchange = String(document.getElementById("listingWanted")?.value || "").trim();
    const description = String(document.getElementById("listingDesc")?.value || "").trim();
    const universityValue = String(uniSelect?.value || university);

    const rawPrice = String(document.getElementById("listingPrice")?.value || "").trim();
    const price = exchangeOnly ? 0 : Number(rawPrice || "0");

    if (!title) {
      errEl.textContent = "Enter a book title.";
      errEl.hidden = false;
      return;
    }
    if (!courseCode) {
      errEl.textContent = "Enter a course code.";
      errEl.hidden = false;
      return;
    }
    if (!exchangeOnly && (!Number.isFinite(price) || price <= 0)) {
      errEl.textContent = "Enter a valid price (HKD) for a sale listing.";
      errEl.hidden = false;
      return;
    }

    const id = `u_${Date.now()}`;
    const coverPool = ["9780131103627", "9780132350884", "9780262033848", "9780134685991"];
    const image_url = `https://covers.openlibrary.org/b/isbn/${coverPool[Math.floor(Math.random() * coverPool.length)]}-L.jpg`;

    window.StoreAPI.addUserListing({
      id,
      name: title,
      courseCode,
      price,
      exchangeOnly,
      owner: username,
      ownerEmail: session.email,
      category: exchangeOnly ? "exchange" : "buy",
      color: "YOUR LISTING",
      university: universityValue,
      image_url,
      description: description || "Student listing.",
      wantedInExchange: wantedInExchange || "",
      sizes: ["PAPERBACK", "HARDCOVER"]
    });

    form.reset();
    if (uniSelect) {
      const idx = window.Store.hkUniversities.indexOf(university);
      if (idx >= 0) uniSelect.selectedIndex = idx;
    }
    syncExchangeOnlyUI();
    renderListings();
    if (okEl) {
      okEl.hidden = false;
      requestAnimationFrame(() => okEl.classList.add("show"));
      window.setTimeout(() => {
        okEl.classList.remove("show");
        window.setTimeout(() => {
          okEl.hidden = true;
          closeSheet();
        }, 260);
      }, 1200);
    }
  });

  function renderListings() {
    const threads = window.StoreAPI.listThreadsForUser(myEmail, "listings");
    const listings = window.StoreAPI.getUserListings().filter((x) => String(x.ownerEmail || "").toLowerCase() === myEmail);

    if (!listings.length) {
      root.innerHTML = `<div class="empty-chats"><p class="micro">NO LISTINGS YET</p><p class="micro">Tap + to add your first book.</p></div>`;
      return;
    }

    root.innerHTML = listings
      .map((item) => {
        const itemThreads = threads.filter((t) => t.meta?.listingId === item.id);
        const offerCount = itemThreads.length;
        const interestCount = Number(item.interestedCount || 0);
        const chats = itemThreads.length
          ? itemThreads
              .map((t) => `<a class="chat-row" href="chat.html?peer=${encodeURIComponent(t.peerKey)}"><p class="chat-row-name">${esc(t.peerName)}</p><p class="chat-row-preview">${esc(t.lastMessage?.text || "Open chat")}</p></a>`)
              .join("")
          : `<div class="empty-chats"><p class="micro">NO CHAT OFFERS YET</p></div>`;
        return `<section class="listing-dash-card">
          <div class="listing-dash-top">
            <a href="product.html?id=${encodeURIComponent(item.id)}" class="listing-dash-image"><img src="${esc(item.image_url)}" alt="${esc(item.name)}" /></a>
            <div class="listing-dash-meta">
              <h3 class="listing-dash-title">${esc(item.name)}</h3>
              <p class="micro">${esc(item.courseCode)} · ${item.exchangeOnly ? "EXCHANGE" : "SELL"} · HK$${Number(item.price || 0).toFixed(2)}</p>
              <p class="micro">OFFERS RECEIVED: ${offerCount}</p>
              <p class="micro">ADDED TO CART: ${interestCount}</p>
            </div>
          </div>
          <div class="chat-list">${chats}</div>
        </section>`;
      })
      .join("");
  }

  renderListings();
})();

