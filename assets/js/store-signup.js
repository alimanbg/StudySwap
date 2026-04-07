(() => {
  const form = document.getElementById("signupForm");
  const errEl = document.getElementById("authError");
  const hintEl = document.getElementById("domainHint");
  const cartCount = document.getElementById("cartCount");
  const nextParam = new URLSearchParams(window.location.search).get("next");
  if (nextParam) {
    document.querySelectorAll('a[href="login.html"]').forEach((a) => {
      a.href = `login.html?next=${encodeURIComponent(nextParam)}`;
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
    const password2 = document.getElementById("password2")?.value || "";
    const res = window.StoreAuth.signup(email, password, password2);
    if (!res.ok) {
      errEl.textContent = res.error || "Could not create account.";
      errEl.hidden = false;
      return;
    }
    const next = new URLSearchParams(window.location.search).get("next") || "index.html";
    window.location.href = next;
  });
})();
