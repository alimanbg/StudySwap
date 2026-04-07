(() => {
  const root = document.getElementById("productView");
  const cartCount = document.getElementById("productCartCount");
  if (!root) return;

  const id = new URLSearchParams(window.location.search).get("id");
  const product = window.StoreAPI.getProductById(id);
  let selectedSize = null;

  function formatPrice(amount) {
    return window.Store.formatHKD(amount);
  }

  function renderCount() {
    if (cartCount) cartCount.textContent = String(window.StoreAPI.cartCount());
  }

  function peerKey() {
    return window.StoreAPI.peerKeyForProduct(product);
  }

  function peerName() {
    return product.owner || "Student owner";
  }

  if (!product) {
    root.innerHTML = `<div class="empty"><p class="micro">PRODUCT NOT FOUND</p><a href="index.html">Back to shop</a></div>`;
    return;
  }

  const uniLine = product.university
    ? `<p class="micro">${product.university.replace(/</g, "&lt;")}</p>`
    : "";
  const courseLine = product.courseCode
    ? `<p class="micro product-course-line">COURSE <span class="course-code-strong">${product.courseCode.replace(/</g, "&lt;")}</span></p>`
    : "";

  const wantedLine =
    product.exchangeOnly && product.wantedInExchange
      ? `<p class="micro product-wanted">WANTED: ${String(product.wantedInExchange).replace(/</g, "&lt;")}</p>`
      : "";

  const priceLine = product.exchangeOnly
    ? `<p class="price">EXCHANGE ONLY</p>`
    : `<p class="price">${formatPrice(product.price)}</p>`;

  root.innerHTML = `
    <section class="product-two-col">
      <div class="product-image-side">
        <img src="${product.image_url}" alt="${product.name}" class="product-image" />
      </div>
      <div class="product-info-side">
        <div class="stack">
          <div>
            <h1 class="title">${product.name}</h1>
            <p class="micro">${product.color}</p>
            ${courseLine}
            ${uniLine}
            ${wantedLine}
          </div>
          ${priceLine}
          <p class="desc">${product.description}</p>
          <p class="micro">OWNER: ${peerName()}</p>
          <div class="size-wrap">
            <p class="micro">SIZE</p>
            <div class="sizes">
              ${(product.sizes || ["ONE SIZE"]).map((s) => `<button type="button" class="size-btn" data-size="${s}">${s}</button>`).join("")}
            </div>
          </div>
          <div class="owner-actions">
            <button type="button" id="addBtn" class="btn full">${product.exchangeOnly ? "ADD TO CART (0 HKD)" : "ADD TO CART"}</button>
            <button type="button" id="exchangeBtn" class="ghost exchange-btn">REQUEST EXCHANGE</button>
            <p id="exchangeFeedback" class="exchange-feedback" hidden role="status">YOU HAVE REQUESTED EXCHANGE</p>
            <textarea id="ownerMessage" placeholder="Message owner about this book..."></textarea>
            <div class="product-chat-actions">
              <button type="button" id="sendMsgBtn" class="ghost">SEND MESSAGE</button>
              <a class="micro product-open-chat" href="chat.html?peer=${encodeURIComponent(peerKey())}">OPEN CHAT</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;

  root.addEventListener("click", (e) => {
    const t = e.target;
    if (!(t instanceof HTMLElement)) return;
    if (t.classList.contains("size-btn")) {
      selectedSize = t.dataset.size;
      root.querySelectorAll(".size-btn").forEach((x) => x.classList.remove("active"));
      t.classList.add("active");
    }
    if (t.id === "addBtn") {
      window.StoreAPI.addToCart(product, selectedSize);
      renderCount();
    }
    if (t.id === "exchangeBtn") {
      const btn = document.getElementById("exchangeBtn");
      const feedback = document.getElementById("exchangeFeedback");
      window.StoreAPI.setThreadMeta(peerKey(), {
        kind: "offer",
        listingId: product.id,
        listingOwnerEmail: product.ownerEmail || "",
        listingName: product.name
      });
      window.StoreAPI.addMessage(
        peerKey(),
        peerName(),
        true,
        `Exchange request for “${product.name}”. Are you open to a swap?`
      );
      btn?.classList.add("exchange-pressed");
      window.setTimeout(() => btn?.classList.remove("exchange-pressed"), 280);
      if (feedback) {
        feedback.hidden = false;
        feedback.classList.add("exchange-feedback-visible");
      }
      if (btn) {
        btn.disabled = true;
        btn.textContent = "EXCHANGE REQUESTED";
        btn.setAttribute("aria-disabled", "true");
      }
    }
    if (t.id === "sendMsgBtn") {
      const input = document.getElementById("ownerMessage");
      const text = String(input?.value || "").trim();
      if (!text) return;
      window.StoreAPI.addMessage(peerKey(), peerName(), true, text);
      if (input) input.value = "";
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") renderCount();
  });

  renderCount();
})();
