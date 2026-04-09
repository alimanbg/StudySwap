# StudySwap (BAI4010 Group Project)

StudySwap is a small e-business style student platform where users can post study resources and submit swap/booking requests.

## Stack
- Frontend: HTML/CSS/JavaScript
- Backend: PHP (custom routing + controllers)
- Database: MySQL

## Setup

1. Clone project and place in web root (e.g. XAMPP `htdocs/StudySwap`).
2. Create DB and tables:
   - Open phpMyAdmin
   - Import `database/schema.sql`
3. Update DB credentials in:
   - `config/database.php`
4. Start Apache + MySQL.
5. Open app in browser:
   - `http://localhost/StudySwap/public/index.php`
   - API endpoints are under `/api/*`

## API Endpoints

### Auth
- `POST /api/register`
  - `{ "full_name": "...", "email": "...", "password": "..." }`
- `POST /api/login`
  - `{ "email": "...", "password": "..." }`
- `POST /api/logout`
- `GET /api/me`

### Items
- `GET /api/items`
- `POST /api/items` (auth required)
  - `{ "title": "...", "category": "...", "description": "..." }`

### Requests
- `POST /api/requests` (auth required)
  - `{ "item_id": 1, "message": "..." }`
- `GET /api/requests/mine` (auth required)

### Admin
- `GET /api/admin/requests` (admin only)
- `POST /api/admin/requests/status` (admin only)
  - `{ "id": 1, "status": "approved" }`

## Frontend Connection

Use `public/js/api.js` in your pages:

```html
<script src="/StudySwap/public/js/api.js"></script>
```

Then call helper functions such as:
- `loginUser(email, password)`
- `getItems()`
- `createSwapRequest(itemId, message)`
- `getMyRequests()`

All requests use same-origin and include session cookies (`credentials: 'include'`).

## Demo Accounts

- Admin:
  - Email: `admin@studyswap.com`
  - Password: `Admin123!`
- Student:
  - Email: `student@studyswap.com`
  - Password: `Student123!`
