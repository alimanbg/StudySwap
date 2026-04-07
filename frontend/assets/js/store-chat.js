(() => {
  const params = new URLSearchParams(window.location.search);
  const peerKey = params.get("peer");
  const titleEl = document.getElementById("chatPeerTitle");
  const bubblesEl = document.getElementById("chatBubbles");
  const form = document.getElementById("chatForm");
  const input = document.getElementById("chatInput");
  const chatMain = document.getElementById("chatMain");
  const cartCount = document.getElementById("cartCount");

  function renderCount() {
    if (cartCount) cartCount.textContent = String(window.StoreAPI.cartCount());
  }

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") renderCount();
  });

  renderCount();

  function resolvePeerName(key) {
    const m = /^p_(.+)$/.exec(key || "");
    if (m) {
      const p = window.Store.products.find((x) => x.id === m[1]);
      if (p) return p.owner || "Student";
    }
    const t = window.StoreAPI.getThread(key);
    return t?.peerName || "Student";
  }

  if (!peerKey || !bubblesEl || !form || !input) {
    if (chatMain) {
      chatMain.innerHTML = `<div class="empty" style="padding: 72px 16px 40px"><p class="micro">NO CHAT SELECTED</p><a href="chats.html">Back to chats</a></div>`;
    }
    return;
  }

  const peerName = resolvePeerName(peerKey);
  window.StoreAPI.ensureThread(peerKey, peerName);
  titleEl.textContent = peerName.toUpperCase();

  function escapeHtml(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function renderBubbles() {
    const t = window.StoreAPI.getThread(peerKey);
    const msgs = t?.messages || [];
    bubblesEl.innerHTML = msgs
      .map(
        (m) =>
          `<div class="bubble ${m.fromMe ? "me" : "them"}">${escapeHtml(m.text)}</div>`
      )
      .join("");
    bubblesEl.scrollTop = bubblesEl.scrollHeight;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    window.StoreAPI.addMessage(peerKey, peerName, true, text);
    input.value = "";
    renderBubbles();
  });

  renderBubbles();
})();
