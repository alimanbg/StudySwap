const API_BASE = ''; // same origin

async function apiRequest(path, method = 'GET', body = null) {
  const opts = {
    method,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' }
  };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${API_BASE}${path}`, opts);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || 'Request failed');
  }
  return data;
}

/** AUTH **/
async function registerUser(full_name, email, password) {
  return apiRequest('/api/register', 'POST', { full_name, email, password });
}

async function loginUser(email, password) {
  return apiRequest('/api/login', 'POST', { email, password });
}

async function logoutUser() {
  return apiRequest('/api/logout', 'POST');
}

async function currentUser() {
  return apiRequest('/api/me', 'GET');
}

/** ITEMS **/
async function getItems() {
  return apiRequest('/api/items', 'GET');
}

async function createItem(title, category, description) {
  return apiRequest('/api/items', 'POST', { title, category, description });
}

/** REQUESTS **/
async function createSwapRequest(item_id, message) {
  return apiRequest('/api/requests', 'POST', { item_id, message });
}

async function getMyRequests() {
  return apiRequest('/api/requests/mine', 'GET');
}

/** ADMIN **/
async function getAllRequestsForAdmin() {
  return apiRequest('/api/admin/requests', 'GET');
}

async function updateRequestStatus(id, status) {
  return apiRequest('/api/admin/requests/status', 'POST', { id, status });
}
