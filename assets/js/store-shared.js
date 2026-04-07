const COURSE_CODES = [
  "MATH1003", "COMP2011", "CHEM1040", "ECON1210", "PHYS1110", "STAT2006", "BIOL1301", "POLI1001",
  "LANG2030", "ACCT2101", "FINA2310", "MARK2120", "MGMT2110", "PSYC1001", "SOCY1001", "ENGG1200",
  "IELM1020", "CIVL1100", "ELEG1910", "MATH2012", "COMP3021", "CHEM2042", "ECON2220", "STAT3010",
  "BIOL2301", "PHYS1310", "COMP3511", "MATH2023", "FINA3103", "ECON3110"
];

const HK_UNIVERSITIES = [
  "The University of Hong Kong (HKU)",
  "The Chinese University of Hong Kong (CUHK)",
  "The Hong Kong University of Science and Technology (HKUST)",
  "City University of Hong Kong (CityU)",
  "The Hong Kong Polytechnic University (PolyU)",
  "Hong Kong Baptist University (HKBU)",
  "Lingnan University",
  "The Education University of Hong Kong (EdUHK)",
  "Hong Kong Metropolitan University (HKMU)",
  "Hang Seng University of Hong Kong (HSUHK)",
  "Tung Wah College",
  "Caritas Institute of Higher Education",
  "Hong Kong Chu Hai College",
  "Saint Francis University (Hong Kong)"
];

window.Store = {
  categories: ["all", "exchange", "buy"],
  hkUniversities: HK_UNIVERSITIES,
  listingsKey: "studyswap_user_listings_v1",
  products: Array.from({ length: 30 }).map((_, i) => {
    const covers = [
      "9781285741550", "9780321971371", "9783319110790", "9780132576277", "9781319105990",
      "9780131103627", "9780134685991", "9780262033848", "9780134092669", "9780132350884"
    ];
    const titles = [
      "Calculus I", "Organic Chemistry", "Linear Algebra", "Data Structures", "Macroeconomics",
      "Discrete Math", "Computer Networks", "AI Foundations", "Database Systems", "Operating Systems"
    ];
    const idx = i % covers.length;
    const uni = HK_UNIVERSITIES[i % HK_UNIVERSITIES.length];
    return {
      id: String(i + 1),
      name: `${titles[idx]} ${Math.floor(i / covers.length) + 1}`,
      courseCode: COURSE_CODES[i],
      price: 18 + (i % 12) * 2,
      exchangeOnly: i % 3 === 0,
      owner: `Student ${i + 1}`,
      category: i % 3 === 0 ? "exchange" : "buy",
      color: "CAMPUS EDITION",
      university: uni,
      image_url: `https://covers.openlibrary.org/b/isbn/${covers[idx]}-L.jpg`,
      description: "Student-listed textbook. Message owner or request exchange.",
      wantedInExchange: i % 3 === 0 ? "Open to swapping for a related course textbook. Message me what you have." : "",
      sizes: ["PAPERBACK", "HARDCOVER"]
    };
  }),
  cartKey: "studyswap_static_cart_v1",
  chatsKey: "studyswap_chats_v1"
};

window.Store.formatHKD = function formatHKD(amount) {
  const n = Number(amount);
  if (Number.isNaN(n)) return "HK$0.00";
  return `HK$${n.toFixed(2)}`;
};

window.StoreAPI = {
  getAllProducts() {
    const listings = this.getUserListings();
    return [...window.Store.products, ...listings];
  },
  getProductById(id) {
    const all = this.getAllProducts();
    return all.find((p) => p.id === id) || null;
  },
  getUserListings() {
    try {
      return JSON.parse(localStorage.getItem(window.Store.listingsKey)) || [];
    } catch {
      return [];
    }
  },
  setUserListings(listings) {
    localStorage.setItem(window.Store.listingsKey, JSON.stringify(listings));
  },
  addUserListing(listing) {
    const list = this.getUserListings();
    list.unshift({ interestedCount: 0, ...(listing || {}) });
    this.setUserListings(list.slice(0, 50));
  },
  removeUserListing(id) {
    this.setUserListings(this.getUserListings().filter((x) => x.id !== id));
  },
  getCart() {
    try {
      return JSON.parse(localStorage.getItem(window.Store.cartKey)) || [];
    } catch {
      return [];
    }
  },
  setCart(cart) {
    localStorage.setItem(window.Store.cartKey, JSON.stringify(cart));
  },
  cartCount() {
    return this.getCart().reduce((sum, item) => sum + item.qty, 0);
  },
  syncCartWithCatalog() {
    const cart = this.getCart();
    let changed = false;
    const out = cart.map((item) => {
      const p = this.getProductById(item.id);
      if (!p) return item;
      const next = { ...item };
      if (next.courseCode == null && p.courseCode) {
        next.courseCode = p.courseCode;
        changed = true;
      }
      if (next.exchangeOnly === undefined) {
        next.exchangeOnly = !!p.exchangeOnly;
        changed = true;
      }
      if (next.wantedInExchange == null && p.wantedInExchange) {
        next.wantedInExchange = p.wantedInExchange;
        changed = true;
      }
      return next;
    });
    if (changed) this.setCart(out);
    return out;
  },
  enrichCartLine(item) {
    const p = this.getProductById(item.id);
    return {
      ...item,
      courseCode: item.courseCode != null ? item.courseCode : p?.courseCode ?? "—",
      exchangeOnly: item.exchangeOnly !== undefined ? item.exchangeOnly : !!p?.exchangeOnly,
      wantedInExchange: item.wantedInExchange != null ? item.wantedInExchange : p?.wantedInExchange ?? ""
    };
  },
  addToCart(product, selectedSize) {
    const size = selectedSize || (product.sizes && product.sizes[0]) || "ONE SIZE";
    const cart = this.getCart();
    const existing = cart.find((item) => item.id === product.id && item.size === size);
    if (existing) existing.qty += 1;
    else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        color: product.color,
        size,
        image_url: product.image_url,
        courseCode: product.courseCode,
        exchangeOnly: !!product.exchangeOnly,
        wantedInExchange: product.wantedInExchange || "",
        qty: 1
      });
    }
    this.setCart(cart);
    this.bumpListingInterest(product.id);
  },
  bumpListingInterest(productId) {
    const list = this.getUserListings();
    let changed = false;
    const next = list.map((l) => {
      if (l.id !== productId) return l;
      changed = true;
      return { ...l, interestedCount: Number(l.interestedCount || 0) + 1 };
    });
    if (changed) this.setUserListings(next);
  },
  updateQty(id, size, delta) {
    const cart = this.getCart();
    const item = cart.find((x) => x.id === id && x.size === size);
    if (!item) return;
    item.qty += delta;
    const filtered = cart.filter((x) => x.qty > 0);
    this.setCart(filtered);
  },
  removeItem(id, size) {
    this.setCart(this.getCart().filter((x) => !(x.id === id && x.size === size)));
  },
  getChatsState() {
    try {
      const raw = localStorage.getItem(window.Store.chatsKey);
      const parsed = raw ? JSON.parse(raw) : { threads: {} };
      if (!parsed.threads) parsed.threads = {};
      return parsed;
    } catch {
      return { threads: {} };
    }
  },
  setChatsState(state) {
    localStorage.setItem(window.Store.chatsKey, JSON.stringify(state));
  },
  peerKeyForProduct(product) {
    return `p_${product.id}`;
  },
  ensureThread(peerKey, peerName) {
    const state = this.getChatsState();
    if (!state.threads[peerKey]) {
      state.threads[peerKey] = { peerName, messages: [], meta: {} };
      this.setChatsState(state);
    } else if (peerName && state.threads[peerKey].peerName !== peerName) {
      state.threads[peerKey].peerName = peerName;
      this.setChatsState(state);
    }
    if (!state.threads[peerKey].meta) {
      state.threads[peerKey].meta = {};
      this.setChatsState(state);
    }
    return state.threads[peerKey];
  },
  setThreadMeta(peerKey, patch) {
    this.ensureThread(peerKey, "");
    const state = this.getChatsState();
    const thread = state.threads[peerKey];
    if (!thread) return null;
    thread.meta = { ...(thread.meta || {}), ...(patch || {}) };
    this.setChatsState(state);
    return thread.meta;
  },
  addMessage(peerKey, peerName, fromMe, text) {
    this.ensureThread(peerKey, peerName);
    const state = this.getChatsState();
    const thread = state.threads[peerKey];
    if (!thread) return null;
    thread.messages.push({
      fromMe: Boolean(fromMe),
      text: String(text || "").trim(),
      ts: Date.now()
    });
    this.setChatsState(state);
    return thread;
  },
  listThreads() {
    const state = this.getChatsState();
    return Object.entries(state.threads).map(([peerKey, t]) => ({
      peerKey,
      peerName: t.peerName || "Student",
      lastMessage: t.messages.length ? t.messages[t.messages.length - 1] : null,
      updatedAt: t.messages.length ? t.messages[t.messages.length - 1].ts : 0,
      meta: t.meta || {}
    })).sort((a, b) => b.updatedAt - a.updatedAt);
  },
  getThread(peerKey) {
    const state = this.getChatsState();
    return state.threads[peerKey] || null;
  },
  listThreadsForUser(email, mode) {
    const em = String(email || "").toLowerCase();
    return this.listThreads().filter((t) => {
      const owner = String(t.meta?.listingOwnerEmail || "").toLowerCase();
      if (mode === "listings") return owner === em;
      if (mode === "offers") return owner !== em;
      return true;
    });
  }
};
