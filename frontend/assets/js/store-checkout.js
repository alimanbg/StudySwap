(() => {
  const gate = document.getElementById("checkoutGate");
  const flow = document.getElementById("checkoutFlow");
  const success = document.getElementById("checkoutSuccess");
  const form = document.getElementById("checkoutForm");
  const linesEl = document.getElementById("checkoutLines");
  const subtotalEl = document.getElementById("checkoutSubtotal");
  const emailDisplay = document.getElementById("checkoutEmailDisplay");
  const errEl = document.getElementById("checkoutError");
  const successMsg = document.getElementById("successMessage");
  const cardFields = document.getElementById("cardFields");
  const cartCount = document.getElementById("cartCount");

  function formatPrice(amount) {
    return window.Store.formatHKD(amount);
  }

  function renderCount() {
    if (cartCount) cartCount.textContent = String(window.StoreAPI.cartCount());
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function syncPayFields() {
    const pay = form?.querySelector('input[name="pay"]:checked')?.value || "card";
    if (cardFields) cardFields.hidden = pay !== "card";
  }

  window.StoreAuth.updateNav();
  renderCount();

  const session = window.StoreAuth.getSession();
  if (!session) {
    gate.hidden = false;
    return;
  }

  window.StoreAPI.syncCartWithCatalog();
  const cart = window.StoreAPI.getCart().map((item) => window.StoreAPI.enrichCartLine(item));
  if (!cart.length) {
    gate.hidden = false;
    gate.innerHTML = `
      <h1 class="page-title">CHECKOUT</h1>
      <p class="checkout-gate-text micro">Your cart is empty.</p>
      <div class="checkout-gate-actions">
        <a href="index.html" class="btn full">CONTINUE SHOPPING</a>
      </div>`;
    return;
  }

  flow.hidden = false;
  emailDisplay.innerHTML = `<span class="micro">SIGNED IN AS</span><br /><strong>${escapeHtml(session.email)}</strong>`;

  linesEl.innerHTML = cart
    .map(
      (item) => `
    <div class="checkout-line">
      <span class="checkout-line-name">${escapeHtml(item.name)} <span class="checkout-line-cc">${escapeHtml(item.courseCode)}</span></span>
      <span class="checkout-line-qty">×${item.qty}</span>
      <span class="checkout-line-price">${item.exchangeOnly ? "EXCHANGE" : formatPrice(item.price * item.qty)}</span>
    </div>`
    )
    .join("");

  const total = cart.reduce((sum, i) => sum + (i.exchangeOnly ? 0 : i.price * i.qty), 0);
  subtotalEl.innerHTML = `<span>TOTAL</span><strong>${formatPrice(total)}</strong>`;

  form?.querySelectorAll('input[name="pay"]').forEach((r) => r.addEventListener("change", syncPayFields));
  syncPayFields();

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    errEl.hidden = true;
    const terms = document.getElementById("terms");
    if (!terms?.checked) {
      errEl.textContent = "Please accept the terms to continue.";
      errEl.hidden = false;
      return;
    }
    const delivery = form.querySelector('input[name="delivery"]:checked')?.value || "campus";
    const pay = form.querySelector('input[name="pay"]:checked')?.value || "card";
    const address = String(document.getElementById("address")?.value || "").trim();
    if (delivery === "mail" && address.length < 8) {
      errEl.textContent = "Enter a full shipping address for mail delivery.";
      errEl.hidden = false;
      return;
    }
    if (pay === "card") {
      const num = String(document.getElementById("cardNumber")?.value || "").replace(/\s/g, "");
      if (num.length < 12) {
        errEl.textContent = "Enter a valid-looking card number for the demo.";
        errEl.hidden = false;
        return;
      }
    }

    const order = {
      id: `ord_${Date.now()}`,
      email: session.email,
      placedAt: Date.now(),
      total,
      delivery,
      payMethod: pay,
      items: cart.map((i) => ({
        id: i.id,
        name: i.name,
        courseCode: i.courseCode,
        qty: i.qty,
        lineTotal: i.price * i.qty
      }))
    };
    window.StoreAuth.saveOrder(order);
    window.StoreAPI.setCart([]);

    flow.hidden = true;
    success.hidden = false;
    successMsg.textContent = `Order ${order.id} placed. You’ll coordinate handoff with sellers in CHATS.`;
    renderCount();
    window.StoreAuth.updateNav();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") renderCount();
  });
})();
