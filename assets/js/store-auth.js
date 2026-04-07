(function () {
  const ALLOWED_DOMAINS = [
    "connect.hku.hk",
    "hku.hk",
    "link.cuhk.edu.hk",
    "cuhk.edu.hk",
    "connect.ust.hk",
    "ust.hk",
    "my.cityu.edu.hk",
    "cityu.edu.hk",
    "connect.polyu.hk",
    "polyu.edu.hk",
    "student.hkbu.edu.hk",
    "hkbu.edu.hk",
    "ln.edu.hk",
    "ln.hk",
    "eduhk.hk",
    "eduhk.edu.hk",
    "hkmu.edu.hk",
    "ouhk.edu.hk",
    "hsu.hk",
    "hsu.edu.hk",
    "twc.edu.hk",
    "cihe.edu.hk",
    "chuhai.edu.hk",
    "sfu.edu.hk",
    "hsuhk.edu.hk",
    "hsbcuhk.edu.hk"
  ];

  const sessionKey = "studyswap_session_v1";
  const ordersKey = "studyswap_orders_v1";

  function getDomain(email) {
    const e = String(email || "")
      .trim()
      .toLowerCase();
    const at = e.lastIndexOf("@");
    if (at < 0) return "";
    return e.slice(at + 1);
  }

  function usernameFromEmail(email) {
    const e = String(email || "").trim();
    const at = e.indexOf("@");
    const name = (at >= 0 ? e.slice(0, at) : e).trim();
    return name || "student";
  }

  function universityFromDomain(domain) {
    const d = String(domain || "").toLowerCase();
    if (d.endsWith("connect.hku.hk") || d.endsWith("hku.hk")) return "The University of Hong Kong (HKU)";
    if (d.endsWith("link.cuhk.edu.hk") || d.endsWith("cuhk.edu.hk")) return "The Chinese University of Hong Kong (CUHK)";
    if (d.endsWith("connect.ust.hk") || d.endsWith("ust.hk")) return "The Hong Kong University of Science and Technology (HKUST)";
    if (d.endsWith("my.cityu.edu.hk") || d.endsWith("cityu.edu.hk")) return "City University of Hong Kong (CityU)";
    if (d.endsWith("connect.polyu.hk") || d.endsWith("polyu.edu.hk")) return "The Hong Kong Polytechnic University (PolyU)";
    if (d.endsWith("student.hkbu.edu.hk") || d.endsWith("hkbu.edu.hk")) return "Hong Kong Baptist University (HKBU)";
    if (d.endsWith("ln.edu.hk") || d.endsWith("ln.hk")) return "Lingnan University";
    if (d.endsWith("eduhk.hk") || d.endsWith("eduhk.edu.hk")) return "The Education University of Hong Kong (EdUHK)";
    if (d.endsWith("hkmu.edu.hk") || d.endsWith("ouhk.edu.hk")) return "Hong Kong Metropolitan University (HKMU)";
    if (d.endsWith("hsu.hk") || d.endsWith("hsu.edu.hk") || d.endsWith("hsuhk.edu.hk") || d.endsWith("hsbcuhk.edu.hk")) return "Hang Seng University of Hong Kong (HSUHK)";
    if (d.endsWith("twc.edu.hk")) return "Tung Wah College";
    if (d.endsWith("cihe.edu.hk")) return "Caritas Institute of Higher Education";
    if (d.endsWith("chuhai.edu.hk")) return "Hong Kong Chu Hai College";
    if (d.endsWith("sfu.edu.hk")) return "Saint Francis University (Hong Kong)";
    return "Hong Kong University";
  }

  window.StoreAuth = {
    sessionKey,
    ordersKey,
    usernameFromEmail,
    universityFromEmail(email) {
      return universityFromDomain(getDomain(email));
    },

    isUniversityEmail(email) {
      const domain = getDomain(email);
      if (!domain) return false;
      const e = String(email).trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return false;
      return ALLOWED_DOMAINS.some((a) => domain === a || domain.endsWith("." + a));
    },

    getAllowedDomainsHint() {
      return "Examples: @connect.hku.hk, @cuhk.edu.hk, @ln.edu.hk, @my.cityu.edu.hk";
    },

    getSession() {
      try {
        const raw = localStorage.getItem(sessionKey);
        if (!raw) return null;
        const s = JSON.parse(raw);
        if (!s || !s.email) return null;
        return s;
      } catch {
        return null;
      }
    },

    setSession(email) {
      const em = String(email).trim().toLowerCase();
      localStorage.setItem(sessionKey, JSON.stringify({ email: em, since: Date.now() }));
    },

    logout() {
      localStorage.removeItem(sessionKey);
    },

    validateLogin(email, password) {
      if (!String(email).trim()) return "Enter your university email.";
      if (!this.isUniversityEmail(email)) {
        return "Only official Hong Kong university emails are accepted (e.g. @ln.edu.hk, @connect.hku.hk).";
      }
      if (!password || String(password).length < 8) return "Password must be at least 8 characters.";
      return null;
    },

    login(email, password) {
      const err = this.validateLogin(email, password);
      if (err) return { ok: false, error: err };
      this.setSession(email);
      return { ok: true };
    },

    signup(email, password, confirmPassword) {
      if (String(password) !== String(confirmPassword)) return { ok: false, error: "Passwords do not match." };
      return this.login(email, password);
    },

    getOrders() {
      try {
        return JSON.parse(localStorage.getItem(ordersKey)) || [];
      } catch {
        return [];
      }
    },

    saveOrder(order) {
      const list = this.getOrders();
      list.unshift(order);
      localStorage.setItem(ordersKey, JSON.stringify(list.slice(0, 30)));
    },

    updateNav() {
      const session = this.getSession();
      const profileLink = document.getElementById("profileLink");
      const profileMenu = document.getElementById("profileMenu");
      const logoutBtn = document.getElementById("logoutBtn");
      const profileEmail = document.getElementById("profileEmail");
      if (profileEmail) profileEmail.textContent = session?.email || "";

      if (profileLink) {
        if (session) {
          profileLink.href = "profile.html";
          profileLink.setAttribute("aria-label", "Profile");
        } else {
          profileLink.href = "login.html";
          profileLink.setAttribute("aria-label", "Log in");
        }
      }

      if (profileMenu) {
        profileMenu.classList.toggle("logged-in", Boolean(session));
        profileMenu.classList.toggle("logged-out", !session);
      }

      if (logoutBtn) {
        logoutBtn.hidden = !session;
        logoutBtn.onclick = (e) => {
          e.preventDefault();
          this.logout();
          window.location.href = "index.html";
        };
      }
    }
  };
})();
