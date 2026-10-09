
## 📖 Overview

Training centres often manage workshop registrations through spreadsheets, which leads to overbooking when multiple staff members register attendees simultaneously for the same limited-seat workshop. This application solves that problem with:

- **Role-based access control** (Admin, Manager, Staff) enforced on the backend
- **Atomic, race-condition-safe seat reservation** — a workshop can never be overbooked, even under concurrent requests
- **Full registration history** — cancelled registrations are preserved, not deleted
- **Search & filter** tools for finding available workshops quickly

---

## 🛠 Tech Stack

| Layer     | Technology                                      |
|-----------|--------------------------------------------------|
| Frontend  | React (Vite), React Router DOM, Axios            |
| Backend   | Node.js, Express.js                              |
| Database  | MongoDB Atlas, Mongoose                          |
| Auth      | JSON Web Tokens (JWT), bcrypt password hashing   |

---

## ✨ Features

- 🔐 JWT authentication with three roles: **Admin**, **Manager**, **Staff**
- 🛡️ Backend-enforced permissions (not just hidden UI buttons)
- 🗓️ Workshop CRUD (create, edit, list) for Managers
- 📝 Attendee registration with **guaranteed no-overbooking** logic
- ❌ Registration cancellation with full audit trail (who/when registered and cancelled)
- 🔍 Filter workshops by date range, status, and seat availability
- 👤 Admin-only user management (create Manager/Staff accounts)

---

## 📁 Project Structure

```

workshop-registration/
├── backend/                 # Express REST API
│   ├── config/               # MongoDB connection
│   ├── controllers/          # Route logic
│   ├── middleware/           # Auth & role guards
│   ├── models/                # Mongoose schemas
│   ├── routes/                # API route definitions
│   ├── seed/                  # Admin + sample data seeding script
│   └── server.js
│
├── frontend/                 # React (Vite) client
│   └── src/
│       ├── api/               # Axios instance
│       ├── components/        # Reusable UI components
│       ├── context/            # Auth context
│       └── pages/               # Route-level pages
│
├── README.md
└── DESIGN.md                 # One-page design & architecture document

````

---

## ✅ Prerequisites

Before you begin, ensure you have:

- **Node.js** v18 or higher ([download](https://nodejs.org/))
- **npm** (bundled with Node.js)
- A **MongoDB connection string** — either:
  - A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster, or
  - A local MongoDB instance

---

## 🚀 Setup Instructions

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd workshop-registration
````

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string_here
JWT_SECRET=any_random_secret_string_here
```

> 💡 A `.env.example` file is provided for reference.

Seed the database with the first Admin account, sample Manager/Staff accounts, and sample workshops:

```bash
npm run seed
```

Start the backend API:

```bash
npm run dev
```

✅ Backend runs at **[http://localhost:5000](http://localhost:5000)**

### 3. Frontend Setup

Open a **new terminal window**:

```bash
cd frontend
npm install
```

Create a `.env` file inside `frontend/`:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

✅ Frontend runs at **[http://localhost:5173](http://localhost:5173)**

### 4. Open the app

Navigate to **[http://localhost:5173](http://localhost:5173)** in your browser. You'll be redirected to the login page.

---

## 🔑 Seeded Credentials

> ⚠️ Dev-only credentials, safe for local review and testing.

| Role    | Email                                                        | Password      |
| ------- | ------------------------------------------------------------- | ------------- |
| Admin   | `admin@workshop.com`                                            | `admin123`   |
| Manager | `manager@workshop.com`                                           | `manager123` |
| Staff   | `staff@workshop.com`                                             | `staff123`   |

---

## 🗓 Sample Workshops

Automatically created by the seed script:

| Code   | Title              | Capacity | Status |
| ------ | -------------------- | :------: | :----: |
| WS-001 | Coding Basics        |    20    | active |
| WS-002 | Pottery Making       |    20    | active |
| WS-003 | Fitness Training     |    15    | active |

---

## 🔐 Role Permissions

| Action                          | Admin | Manager | Staff |
| --------------------------------- | :---: | :-----: | :---: |
| Login                             |  ✅   |   ✅    |  ✅   |
| Create Manager/Staff accounts     |  ✅   |   ❌    |  ❌   |
| Create / edit workshops           |  ❌   |   ✅    |  ❌   |
| View workshops                    |  ❌   |   ✅    |  ✅   |
| Register attendees                |  ❌   |   ✅    |  ✅   |
| Cancel registrations              |  ❌   |   ✅    |  ✅   |
| View registration history         |  ❌   |   ✅    |  ✅   |

> All permissions are enforced in the **Express backend** via middleware — not just hidden in the React UI. Unauthorized API requests (e.g. from Postman) are rejected with `403 Forbidden`, regardless of what the frontend shows.

---

## 📡 API Reference

| Method | Endpoint                        | Access         | Description                   |
| ------ | ---------------------------------- | -------------- | -------------------------------- |
| POST   | `/api/auth/login`                | Public         | Log in, receive a JWT token      |
| POST   | `/api/users`                     | Admin          | Create a Manager/Staff account   |
| GET    | `/api/users`                     | Admin          | List all users                   |
| GET    | `/api/workshops`                 | Manager, Staff | List/filter workshops            |
| GET    | `/api/workshops/:id`              | Manager, Staff | Get a single workshop            |
| POST   | `/api/workshops`                 | Manager        | Create a workshop                |
| PUT    | `/api/workshops/:id`              | Manager        | Edit a workshop                  |
| GET    | `/api/registrations`              | Manager, Staff | List registrations / history     |
| POST   | `/api/registrations`              | Manager, Staff | Register an attendee             |
| PATCH  | `/api/registrations/:id/cancel`    | Manager, Staff | Cancel a registration            |

### Workshop filter query parameters (`GET /api/workshops`)

```
?status=active | cancelled | completed
?fromDate=2025-10-01&toDate=2025-10-31
?availableOnly=true
```

---

## 🧪 Verifying the No-Overbooking Guarantee

1. Log in as **Manager** and create a workshop with `capacity = 1`.
2. Fire **two registration requests** for that workshop at nearly the same time (e.g., two Thunder Client tabs, click Send on both quickly).
3. **Expected result:**
   - ✅ One request succeeds → `201 Created`
   - ❌ The other is rejected → `409 Conflict — "Workshop is full."`
   - `bookedSeats` never exceeds `capacity`, regardless of timing.

See **[DESIGN.md](./DESIGN.md)** for a full technical explanation of the atomic update strategy used to guarantee this.

---

## 🔧 Troubleshooting

**Backend fails to start / "connection refused"**
→ Check `MONGO_URI` in `backend/.env` is correct, and that your current IP is allowed in MongoDB Atlas → Network Access (use `0.0.0.0/0` for local development).

**Frontend loads but API calls fail**
→ Ensure the backend (`:5000`) and frontend (`:5173`) dev servers are both running, in separate terminals.

**Login succeeds but pages appear blank**
→ Open the browser console (F12) for errors, and confirm the logged-in user's role matches a route they're allowed to access.

---

## 📄 License

This project was built as part of a technical assessment (FullStack Challenge — Workshop Registration Service).

```

---

Just copy everything between the ` ```markdown ` fence markers (not including the fence lines themselves) into your `README.md` file. Want me to also polish `DESIGN.md` in this same style?
