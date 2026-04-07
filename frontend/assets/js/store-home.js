(() => {
  const categoryNav = document.getElementById("categoryNav");
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const desktopMenuBtn = document.getElementById("desktopMenuBtn");
  const productGrid = document.getElementById("productGrid");
  const cartCount = document.getElementById("cartCount");

  const filterModal = document.getElementById("filterModal");
  const closeFilterModal = document.getElementById("closeFilterModal");
  const filterMinRange = document.getElementById("filterMinRange");
  const filterMaxRange = document.getElementById("filterMaxRange");
  const filterPriceReadout = document.getElementById("filterPriceReadout");
  const filterRangeFill = document.getElementById("filterRangeFill");
  const filterUniList = document.getElementById("filterUniList");
  const applyFilterBtn = document.getElementById("applyFilterBtn");
  const clearFilterBtn = document.getElementById("clearFilterBtn");

  const prices = window.StoreAPI.getAllProducts().map((p) => p.price);
  const PRICE_FLOOR = Math.min(...prices);
  const PRICE_CEIL = Math.max(...prices);

  const initialCat = new URLSearchParams(window.location.search).get("cat");
  let activeCategory =
    initialCat && window.Store.categories.includes(initialCat) ? initialCat : "all";
  let zoomed = false;
  let filterState = {
    min: PRICE_FLOOR,
    max: PRICE_CEIL,
    universityKeys: []
  };

  function formatPrice(amount) {
    return window.Store.formatHKD(amount);
  }

  function renderCount() {
    if (cartCount) cartCount.textContent = String(window.StoreAPI.cartCount());
  }

  function categoryLabel(c) {
    return c.toUpperCase();
  }

  function escapeAttr(s) {
    return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
  }

  function renderCategoryButtons(root) {
    const catHtml = window.Store.categories
      .map(
        (c) =>
          `<button type="button" class="link ${activeCategory === c ? "active" : ""}" data-category="${c}">${categoryLabel(c)}</button>`
      )
      .join("");
    const extra = `
      <a href="search.html" class="link">SEARCH</a>
      <button type="button" class="link" id="openFilterModal">FILTER</button>
    `;
    root.innerHTML = catHtml + extra;
  }

  function passesFilters(p) {
    if (p.price < filterState.min || p.price > filterState.max) return false;
    if (filterState.universityKeys.length) {
      if (!filterState.universityKeys.includes(p.university)) return false;
    }
    return true;
  }

  function renderProducts() {
    let products = window.StoreAPI.getAllProducts().filter(passesFilters);
    if (activeCategory === "exchange") products = products.filter((p) => p.exchangeOnly);
    if (activeCategory === "buy") products = products.filter((p) => !p.exchangeOnly);
    productGrid.innerHTML = products
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

  function syncRangeInputs() {
    let lo = Number(filterMinRange.value);
    let hi = Number(filterMaxRange.value);
    if (lo > hi) {
      if (document.activeElement === filterMinRange) filterMaxRange.value = String(lo);
      else filterMinRange.value = String(hi);
      lo = Number(filterMinRange.value);
      hi = Number(filterMaxRange.value);
    }
    filterPriceReadout.textContent = `${formatPrice(lo)} — ${formatPrice(hi)}`;
    const minBound = Number(filterMinRange.min);
    const maxBound = Number(filterMinRange.max);
    const span = maxBound - minBound;
    if (filterRangeFill && span > 0) {
      const pLo = ((lo - minBound) / span) * 100;
      const pHi = ((hi - minBound) / span) * 100;
      filterRangeFill.style.left = `${pLo}%`;
      filterRangeFill.style.width = `${Math.max(0, pHi - pLo)}%`;
    }
  }

  function renderUniChips() {
    filterUniList.innerHTML = window.Store.hkUniversities
      .map((name, i) => {
        const checked = filterState.universityKeys.includes(name);
        return `<label class="uni-chip" for="uni_cb_${i}"><input type="checkbox" name="uni" value="${escapeAttr(name)}" id="uni_cb_${i}" ${checked ? "checked" : ""} /><span>${name.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</span></label>`;
      })
      .join("");
  }

  function readUniSelection() {
    return Array.from(filterUniList.querySelectorAll('input[name="uni"]:checked')).map((el) => el.value);
  }

  function openFilterModalFn() {
    filterModal.hidden = false;
    filterMinRange.min = String(PRICE_FLOOR);
    filterMinRange.max = String(PRICE_CEIL);
    filterMaxRange.min = String(PRICE_FLOOR);
    filterMaxRange.max = String(PRICE_CEIL);
    filterMinRange.step = "1";
    filterMaxRange.step = "1";
    filterMinRange.value = String(Math.min(filterState.max, Math.max(filterState.min, PRICE_FLOOR)));
    filterMaxRange.value = String(Math.min(PRICE_CEIL, Math.max(filterState.max, filterState.min)));
    renderUniChips();
    syncRangeInputs();
  }

  function closeFilterModalFn() {
    filterModal.hidden = true;
  }

  filterMinRange?.addEventListener("input", syncRangeInputs);
  filterMaxRange?.addEventListener("input", syncRangeInputs);
  filterMinRange?.addEventListener("pointerdown", () => {
    if (filterMinRange) filterMinRange.style.zIndex = "4";
    if (filterMaxRange) filterMaxRange.style.zIndex = "3";
  });
  filterMaxRange?.addEventListener("pointerdown", () => {
    if (filterMaxRange) filterMaxRange.style.zIndex = "4";
    if (filterMinRange) filterMinRange.style.zIndex = "3";
  });

  applyFilterBtn?.addEventListener("click", () => {
    filterState.min = Number(filterMinRange.value);
    filterState.max = Number(filterMaxRange.value);
    filterState.universityKeys = readUniSelection();
    closeFilterModalFn();
    renderProducts();
  });

  clearFilterBtn?.addEventListener("click", () => {
    filterState.min = PRICE_FLOOR;
    filterState.max = PRICE_CEIL;
    filterState.universityKeys = [];
    filterMinRange.value = String(PRICE_FLOOR);
    filterMaxRange.value = String(PRICE_CEIL);
    renderUniChips();
    syncRangeInputs();
    renderProducts();
  });

  closeFilterModal?.addEventListener("click", closeFilterModalFn);
  filterModal?.addEventListener("click", (e) => {
    if (e.target === filterModal) closeFilterModalFn();
  });

  categoryNav.addEventListener("click", (e) => {
    const t = e.target;
    if (!(t instanceof HTMLElement)) return;
    if (t.id === "openFilterModal") {
      openFilterModalFn();
      return;
    }
    if (!t.dataset.category) return;
    activeCategory = t.dataset.category;
    renderCategoryButtons(categoryNav);
    renderProducts();
  });

  function toggleZoom() {
    zoomed = !zoomed;
    productGrid.classList.toggle("zoomed", zoomed);
  }
  mobileMenuBtn.addEventListener("click", toggleZoom);
  desktopMenuBtn.addEventListener("click", toggleZoom);

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") renderCount();
  });

  renderCategoryButtons(categoryNav);
  renderProducts();
  renderCount();
})();
