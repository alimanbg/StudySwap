(() => {
  const form = document.getElementById("loginForm");
  const errEl = document.getElementById("authError");
  const hintEl = document.getElementById("domainHint");
  const cartCount = document.getElementById("cartCount");
  const nextParam = new URLSearchParams(window.location.search).get("next");
  if (nextParam) {
    document.querySelectorAll('a[href="signup.html"]').forEach((a) => {
      a.href = `signup.html?next=${encodeURIComponent(nextParam)}`;
    });
  }

  if (hintEl) hintEl.textContent = window.StoreAuth.getAllowedDomainsHint();

  if (cartCount) cartCount.textContent = String(window.StoreAPI.cartCount());

  if (window.StoreAuth.getSession()) {
    const next = new URLSearchParams(window.location.search).get("next") || "index.html";
    window.location.replace(next);
    return;
  }

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    errEl.hidden = true;
    const email = document.getElementById("email")?.value || "";
    const password = document.getElementById("password")?.value || "";
    const res = window.StoreAuth.login(email, password);
    if (!res.ok) {
      errEl.textContent = res.error || "Could not log in.";
      errEl.hidden = false;
      return;
    }
    const next = new URLSearchParams(window.location.search).get("next") || "index.html";
    window.location.href = next;
  });
})();
