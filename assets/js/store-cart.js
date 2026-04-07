(() => {
  const root = document.getElementById("cartPageContent");
  const totalEl = document.getElementById("cartPageTotal");
  const cartCount = document.getElementById("cartCount");
  if (!root || !totalEl) return;

  function formatPrice(amount) {
    return window.Store.formatHKD(amount);
  }

  function renderCount() {
    if (cartCount) cartCount.textContent = String(window.StoreAPI.cartCount());
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function escAttr(s) {
    return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
  }

  function escUrlAttr(u) {
    return String(u).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
  }

  function render() {
    window.StoreAPI.syncCartWithCatalog();
    const cart = window.StoreAPI.getCart().map((item) => window.StoreAPI.enrichCartLine(item));
    if (!cart.length) {
      root.innerHTML = `<div class="cart-empty">
        <p class="micro">YOUR CART IS EMPTY</p>
        <a href="index.html" class="btn full cart-empty-link">BACK TO SHOP</a>
      </div>`;
      totalEl.hidden = true;
      renderCount();
      return;
    }

    const header = `
      <div class="cart-table-head" aria-hidden="true">
        <span>BOOK</span>
        <span>COURSE</span>
        <span>TYPE</span>
        <span>STATUS</span>
        <span>QTY</span>
        <span>LINE TOTAL</span>
      </div>`;

    const rows = cart
      .map((item) => {
        const typeLabel = item.exchangeOnly ? "EXCHANGE" : "PURCHASE";
        const typeClass = item.exchangeOnly ? "cart-tag cart-tag-exchange" : "cart-tag cart-tag-buy";
        const statusMain = "IN CART";
        const statusSub = item.exchangeOnly ? "Swap listing" : "Buy listing";
        const idAttr = escAttr(item.id);
        const sizeAttr = escAttr(item.size);
        const lineTotal = item.exchangeOnly ? "EXCHANGE" : formatPrice(item.price * item.qty);
        return `
      <article class="cart-line">
        <div class="cart-line-book">
          <a href="product.html?id=${encodeURIComponent(item.id)}" class="cart-line-thumb"><img src="${escUrlAttr(item.image_url)}" alt="" /></a>
          <div class="cart-line-titles">
            <a href="product.html?id=${encodeURIComponent(item.id)}" class="cart-line-name">${escapeHtml(item.name)}</a>
            <p class="micro cart-line-meta">${escapeHtml(item.color)} · ${escapeHtml(item.size)}</p>
          </div>
        </div>
        <div class="cart-line-course"><span class="cart-course-pill">${escapeHtml(item.courseCode)}</span></div>
        <div class="cart-line-type"><span class="${typeClass}">${typeLabel}</span></div>
        <div class="cart-line-status">
          <span class="cart-status-main">${statusMain}</span>
          <span class="cart-status-sub">${statusSub}</span>
        </div>
        <div class="cart-line-qty">
          <div class="qty-box">
            <button type="button" class="qty-btn" data-id="${idAttr}" data-size="${sizeAttr}" data-delta="-1">-</button>
            <span>${item.qty}</span>
            <button type="button" class="qty-btn" data-id="${idAttr}" data-size="${sizeAttr}" data-delta="1">+</button>
          </div>
          <button type="button" class="cart-remove" data-id="${idAttr}" data-size="${sizeAttr}">REMOVE</button>
        </div>
        <div class="cart-line-total">${lineTotal}</div>
      </article>`;
      })
      .join("");

    root.innerHTML = `<div class="cart-table">${header}${rows}</div>`;
    const total = cart.reduce((sum, i) => sum + (i.exchangeOnly ? 0 : i.price * i.qty), 0);
    totalEl.innerHTML = `<div class="cart-total-inner"><span>TOTAL</span><strong>${formatPrice(total)}</strong></div>
      <div class="cart-checkout-row"><a href="checkout.html" class="btn full cart-checkout-btn">PROCEED TO CHECKOUT</a></div>`;
    totalEl.hidden = false;
    renderCount();
  }

  root.addEventListener("click", (e) => {
    const t = e.target;
    if (!(t instanceof HTMLElement)) return;
    const id = t.dataset.id;
    const size = t.dataset.size;
    if (!id || !size) return;
    if (t.classList.contains("cart-remove")) {
      window.StoreAPI.removeItem(id, size);
      render();
      return;
    }
    if (t.classList.contains("qty-btn")) {
      window.StoreAPI.updateQty(id, size, Number(t.dataset.delta || 0));
      render();
    }
  });

  render();
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") render();
  });
})();
