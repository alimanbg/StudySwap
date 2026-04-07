(() => {
  const listRoot = document.getElementById("chatsList");
  const tabsRoot = document.getElementById("chatTabs");
  const cartCount = document.getElementById("cartCount");
  if (!listRoot) return;
  let view = "offers";

  function getSessionEmail() {
    return window.StoreAuth.getSession()?.email?.toLowerCase() || "";
  }

  function renderList() {
    const email = getSessionEmail();
    const allThreads = window.StoreAPI.listThreads();
    const products = window.StoreAPI.getAllProducts();
    const ownerEmailFor = (thread) => {
      const direct = String(thread.meta?.listingOwnerEmail || "").toLowerCase();
      if (direct) return direct;
      const id = thread.meta?.listingId;
      const product = products.find((p) => p.id === id);
      return String(product?.ownerEmail || "").toLowerCase();
    };
    const threads = allThreads.filter((t) => t.meta?.kind === "offer" || !t.meta?.kind);
    const filtered =
      view === "offers"
        ? threads.filter((t) => ownerEmailFor(t) !== email)
        : threads.filter((t) => ownerEmailFor(t) === email);
    if (!filtered.length) {
      listRoot.innerHTML =
        view === "offers"
          ? `<div class="empty-chats"><p class="micro">NO OFFERS SENT YET</p><p class="micro">Open a book and request exchange to start.</p></div>`
          : `<div class="empty-chats"><p class="micro">NO OFFERS ON YOUR LISTINGS</p><p class="micro">When others message your listings, they appear here.</p></div>`;
      return;
    }
    listRoot.innerHTML = filtered
      .map((row) => {
        const preview = row.lastMessage
          ? `${row.lastMessage.fromMe ? "You: " : ""}${row.lastMessage.text}`
          : "No messages";
        const q = encodeURIComponent(row.peerKey);
        return `<a href="chat.html?peer=${q}" class="chat-row">
          <p class="chat-row-name">${row.peerName.replace(/</g, "&lt;")}</p>
          <p class="chat-row-preview">${preview.replace(/</g, "&lt;")}</p>
        </a>`;
      })
      .join("");
  }

  function renderCount() {
    if (cartCount) cartCount.textContent = String(window.StoreAPI.cartCount());
  }

  tabsRoot?.addEventListener("click", (e) => {
    const btn = e.target instanceof HTMLElement ? e.target.closest(".chat-tab") : null;
    if (!btn || !(btn instanceof HTMLElement)) return;
    view = btn.dataset.view || "offers";
    tabsRoot.querySelectorAll(".chat-tab").forEach((x) => x.classList.toggle("active", x === btn));
    renderList();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") renderCount();
  });

  renderList();
  renderCount();
})();
