(() => {
  const input = document.getElementById("searchQuery");
  const grid = document.getElementById("searchResults");
  const alphaRoot = document.getElementById("alphaLetters");
  const cartCount = document.getElementById("cartCount");
  if (!input || !grid || !alphaRoot) return;

  let activeLetter = null;

  function formatPrice(amount) {
    return window.Store.formatHKD(amount);
  }

  function renderCount() {
    if (cartCount) cartCount.textContent = String(window.StoreAPI.cartCount());
  }

  function normCode(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/\s+/g, "");
  }

  function matchesQuery(p, query) {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    if (p.name.toLowerCase().includes(q)) return true;
    const code = normCode(p.courseCode);
    return code.includes(normCode(q));
  }

  function firstLetter(name) {
    const s = String(name || "").trim();
    if (!s.length) return "";
    return s[0].toUpperCase();
  }

  function renderResults() {
    const query = String(input.value || "").toLowerCase().trim();
    const hasIntent = activeLetter !== null || query.length > 0;
    if (!hasIntent) {
      grid.innerHTML = "";
      return;
    }
    let products = window.StoreAPI.getAllProducts();
    if (activeLetter) {
      products = products.filter((p) => firstLetter(p.name) === activeLetter);
    }
    if (query) {
      products = products.filter((p) => matchesQuery(p, query));
    }
    grid.innerHTML = products
      .map(
        (p) => `
      <a href="product.html?id=${p.id}" class="product-card-link">
        <article class="product-card">
          <div class="product-thumb"><img src="${p.image_url}" alt="${p.name}" /></div>
          <div class="product-meta">
            <p class="product-name">${p.name}</p>
            <p class="product-course-code">${p.courseCode}</p>
            <p class="product-price">${p.exchangeOnly ? "EXCHANGE ONLY" : formatPrice(p.price)}</p>
          </div>
        </article>
      </a>
    `
      )
      .join("");
  }

  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  alphaRoot.innerHTML = [
    `<button type="button" class="alpha-btn alpha-btn-all" data-letter="all" title="Clear letter filter">ALL</button>`,
    ...letters.map(
      (L) =>
        `<button type="button" class="alpha-btn" data-letter="${L}" title="Titles starting with ${L}">${L}</button>`
    )
  ].join("");

  alphaRoot.addEventListener("click", (e) => {
    const btn = e.target instanceof HTMLElement ? e.target.closest(".alpha-btn") : null;
    if (!btn || btn.dataset.letter === undefined) return;
    const raw = btn.dataset.letter;
    activeLetter = raw === "all" ? null : raw;
    alphaRoot.querySelectorAll(".alpha-btn").forEach((b) => {
      const v = b.dataset.letter;
      const isAll = v === "all";
      const isActive = isAll ? activeLetter === null : activeLetter === v;
      b.classList.toggle("active", isActive);
    });
    renderResults();
  });

  let t = 0;
  input.addEventListener("input", () => {
    clearTimeout(t);
    t = setTimeout(() => renderResults(), 120);
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") renderCount();
  });

  alphaRoot.querySelector(".alpha-btn-all")?.classList.add("active");
  renderResults();
  renderCount();
})();
