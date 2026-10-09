# Workshop Registration System

A full-stack workshop registration management system built to prevent overbooking, streamline attendee registrations, and provide secure, role-based access to workshop management.

**Built with React, Node.js, Express, and MongoDB.**

[Features](#-features) · [Screenshots](#-screenshots) · [Installation](#-installation-and-setup) · [API](#-api-reference) · [Testing](#-testing-the-no-overbooking-guarantee)

---

## 📌 Overview

The Workshop Registration System replaces spreadsheet-based registration workflows with a centralized web application. It allows authorized staff to manage workshop registrations while maintaining accurate seat availability, secure access control, and a complete registration audit trail.

The system uses atomic database operations to prevent concurrent registration requests from exceeding a workshop's seat capacity.

### Key Highlights

- 🔐 Secure JWT authentication with role-based authorization.
- 👥 Three user roles: Admin, Manager, and Staff.
- 🛡️ Server-side permission enforcement.
- 🎟️ Race-condition-safe seat reservations.
- 🧾 Registration history with cancellation audit records.
- 🔎 Workshop search and filtering.
- 👤 Administrative user management.

## 📸 Screenshots

Explore the application's interface and key workflows.

> **Note:** Replace the example image paths below with screenshots captured from your running application. The images will appear automatically on GitHub once the files are committed to the repository.

### Login

![Login Page](./screenshots/login.png)

*Secure login for authorized users.*

### Dashboard

![Dashboard](./screenshots/dashboard.png)

*An overview of workshop registration activities.*

### Workshop Management

![Workshop Management](./screenshots/workshops.png)

*Browse workshops, check seat availability, and manage workshop details.*

### Attendee Registration

![Attendee Registration](./screenshots/registration.png)

*Register attendees while protecting limited workshop capacity.*

### Registration History

![Registration History](./screenshots/registration-history.png)

*Review registration records, including cancelled registrations.*

### User Management

![User Management](./screenshots/user-management.png)

*Administrators can manage Manager and Staff accounts.*

---

## ✨ Features

### 🔐 Authentication and Authorization
- JWT-based authentication.
- Password hashing with bcrypt.
- Role-based access control for Admin, Manager, and Staff.
- Backend middleware to protect restricted API endpoints.

### 🗓️ Workshop Management
- Create and edit workshops.
- View workshop details and availability.
- Filter workshops by status and date range.
- Find workshops with available seats.

### 📝 Registration Management
- Register attendees for workshops.
- Prevent overbooking using atomic database updates.
- Cancel existing registrations without deleting historical records.
- Track registration and cancellation timestamps and responsible users.

### 👤 User Management
- Admin-only account creation.
- Create Manager and Staff accounts.
- Retrieve the list of registered system users.

### 🛡️ Data Integrity
- Enforce workshop capacity at the database-operation level.
- Reject registrations when a workshop is full.
- Preserve registration history for auditability.
- Enforce permissions on the backend independently of the frontend.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite |
| Routing | React Router DOM |
| HTTP Client | Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| Authentication | JSON Web Tokens (JWT) |
| Password Security | bcrypt |
| Development | npm |

---

## 👥 Role-Based Access Control

| Action | Admin | Manager | Staff |
|---|:---:|:---:|:---:|
| Log in | ✅ | ✅ | ✅ |
| Create Manager/Staff accounts | ✅ | ❌ | ❌ |
| List system users | ✅ | ❌ | ❌ |
| View workshops | ❌ | ✅ | ✅ |
| Create workshops | ❌ | ✅ | ❌ |
| Edit workshops | ❌ | ✅ | ❌ |
| Register attendees | ❌ | ✅ | ✅ |
| Cancel registrations | ❌ | ✅ | ✅ |
| View registration history | ❌ | ✅ | ✅ |

All permissions are enforced by Express middleware and protected backend routes. Hiding a button in the frontend is not considered authorization.

---

## 🏗️ Architecture

The application follows a client-server architecture.

```text
┌──────────────────────────────┐
│       React Frontend         │
│   React Router + Axios       │
└──────────────┬───────────────┘
               │
               │ HTTP / REST API
               │ JWT Authentication
               ▼
┌──────────────────────────────┐
│       Express Backend        │
│                              │
│  Authentication Middleware   │
│  Role Authorization          │
│  Controllers and Routes      │
│  Registration Logic          │
└──────────────┬───────────────┘
               │
               │ Mongoose
               ▼
┌──────────────────────────────┐
│           MongoDB            │
│                              │
│  Users                       │
│  Workshops                   │
│  Registrations               │
└──────────────────────────────┘
```

For implementation details, see [DESIGN.md](./DESIGN.md).

---

## 📁 Project Structure

```text
workshop-registration/
├── backend/
│   ├── config/
│   │   └── database connection
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── seed/
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   └── pages/
│   ├── package.json
│   └── .env.example
├── screenshots/
├── DESIGN.md
└── README.md
```

*The directory listing is illustrative. Adjust it to match the actual files in your repository.*

---

## ⚙️ Prerequisites

Before getting started, install:

- [Node.js](https://nodejs.org/) v18 or later.
- npm, included with Node.js.
- A MongoDB database, either a local instance or a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster.
- Git.

---

## 🚀 Installation and Setup

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd workshop-registration
```

Replace `<your-repository-url>` with your actual Git repository URL.

### 2. Configure the backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend/` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
```

Configure the values for your environment. Keep `.env` out of version control.

### 3. Seed the database

Run the seed script to create the initial administrator account, sample users, and sample workshops.

```bash
npm run seed
```

Ensure the database connection is configured before running the script.

### 4. Start the backend

```bash
npm run dev
```

The backend API should be available at:

`http://localhost:5000`

Keep this terminal running.

### 5. Configure the frontend

Open a second terminal from the project root:

```bash
cd frontend
npm install
```

Create a `.env` file inside the `frontend/` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

### 6. Start the frontend

```bash
npm run dev
```

Open the URL printed by Vite, typically:

`http://localhost:5173`

You should now be able to access the login page.

---

## 🔑 Development Credentials

The seed script creates development accounts for testing.

| Role | Email | Password |
|---|---|---|
| Admin | `admin@workshop.com` | `admin123` |
| Manager | `manager@workshop.com` | `manager123` |
| Staff | `staff@workshop.com` | `staff123` |

**Security note:** These are development-only credentials. Never use default credentials in a production environment. Change or disable seeded accounts before deployment.

---

## 🗓️ Sample Workshops

The seed script creates the following sample workshops.

| Workshop Code | Title | Capacity | Status |
|---|---|:---:|---|
| WS-001 | Coding Basics | 20 | Active |
| WS-002 | Pottery Making | 20 | Active |
| WS-003 | Fitness Training | 15 | Active |

Actual availability depends on the registrations stored in the database.

---

## 📡 API Reference

All endpoints are prefixed with `/api`. Protected endpoints require a valid JWT according to the application's authentication middleware.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/login` | Public | Authenticate a user |
| POST | `/api/users` | Admin | Create a user account |
| GET | `/api/users` | Admin | List users |
| GET | `/api/workshops` | Manager, Staff | List and filter workshops |
| GET | `/api/workshops/:id` | Manager, Staff | Retrieve workshop details |
| POST | `/api/workshops` | Manager | Create a workshop |
| PUT | `/api/workshops/:id` | Manager | Update a workshop |
| GET | `/api/registrations` | Manager, Staff | List registrations and history |
| POST | `/api/registrations` | Manager, Staff | Register an attendee |
| PATCH | `/api/registrations/:id/cancel` | Manager, Staff | Cancel a registration |

### Workshop Filtering

The workshop listing endpoint supports the following query parameters:

| Parameter | Description | Example |
|---|---|---|
| `status` | Filter by workshop status | `status=active` |
| `fromDate` | Filter by start date | `fromDate=2025-10-01` |
| `toDate` | Filter by end date | `toDate=2025-10-31` |
| `availableOnly` | Return workshops with available seats | `availableOnly=true` |

Example request:

```http
GET /api/workshops?status=active&availableOnly=true
```

Date filtering can be combined with other supported filters.

---

## 🎟️ Preventing Workshop Overbooking

Preventing overbooking is one of the application's core requirements.

A simple approach that reads the current seat count and then updates it can fail when multiple requests execute concurrently. Both requests may observe the same available seat before either update is saved.

The registration logic must therefore enforce capacity as part of an atomic database operation.

### Expected Behaviour

Consider a workshop with a capacity of one seat and two concurrent registration requests.

| Request | Expected result |
|---|---|
| First successful reservation | `201 Created` |
| Competing reservation after capacity is reached | `409 Conflict` |
| Final booked seats | `1` |

The backend should perform the capacity check and seat increment atomically, and create the registration record consistently with the reservation. If the implementation uses a separate workshop update and registration insert, a MongoDB transaction or an equivalent rollback strategy may be needed to keep the records consistent.

### How to Test

1. Log in as a Manager.
2. Create a workshop with a capacity of `1`.
3. Send two registration requests for that workshop at nearly the same time.
4. Verify that no more than one active registration succeeds.
5. Confirm that `bookedSeats` never exceeds the workshop's capacity.
6. Test cancellation and verify that the seat becomes available again without deleting the historical registration.

Expected outcome: one reservation succeeds, while the competing reservation is rejected once the workshop is full.

See [DESIGN.md](./DESIGN.md) for the implementation details.

---

## 🧪 Testing and Verification

Use the following scenarios to validate the main application workflows.

- [ ] Admin can log in and create Manager and Staff accounts.
- [ ] Manager can create and edit workshops.
- [ ] Staff can view workshops and register attendees.
- [ ] Users without the required role cannot access restricted API endpoints.
- [ ] A workshop cannot exceed its configured capacity under concurrent requests.
- [ ] Full workshops reject additional registrations.
- [ ] Cancellation releases a seat when appropriate.
- [ ] Cancelled registrations remain visible in the registration history.
- [ ] Workshop filters return the expected results.

These are recommended verification scenarios; mark them as complete after testing your implementation.

---

## 🔒 Security Considerations

- Hash passwords using bcrypt before storing them.
- Validate JWTs on protected API requests.
- Enforce role permissions on the server.
- Validate and sanitize incoming request data.
- Keep database credentials and JWT secrets in environment variables.
- Exclude `.env` files and other secrets from Git.
- Use strong secrets and HTTPS in production.
- Restrict database network access appropriately.
- Avoid exposing internal error details to clients.

---

## 🛠️ Troubleshooting

### MongoDB connection fails

- Verify `MONGO_URI` in `backend/.env`.
- Confirm that the MongoDB instance is running.
- For Atlas, check database credentials and Network Access rules.

### Frontend cannot reach the API

- Ensure the backend is running on port `5000`.
- Ensure the frontend is running on the Vite development port.
- Verify `VITE_API_URL` in `frontend/.env`.
- Check the browser console and backend logs for errors.

### Login succeeds but a page is blank

- Open browser developer tools and inspect the console.
- Verify that the user has the appropriate role.
- Check route guards and failed API requests.

### Registration returns a conflict

The workshop may already be full. Check its current availability and registration history before retrying.

---

## 📄 License

This project was developed as part of the **FullStack Challenge — Workshop Registration Service** technical assessment.

Add a `LICENSE` file if you intend to distribute the project under an open-source license.

---

## 👨‍💻 Author

**Your Name**

- GitHub: [@your-username](https://github.com/your-username)
- Project: [Workshop Registration System](<your-repository-url>)

---

⭐ If you find this project useful, consider giving the repository a star.
