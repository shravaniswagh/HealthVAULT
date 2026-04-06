# 🏥 HealthVAULT – Health Tracking Dashboard

<p align="center">
  <b>A full-stack health management platform to store, track, and manage medical data securely.</b>
</p>

---

## 🚀 Features

- 🔐 **User Authentication** – Secure Login and Signup functionality.
- 📊 **Interactive Dashboard** – Visualize and track your health metrics.
- 🗂️ **Medical Records** – Manage and store your medical history in one place.
- ⚡ **High Performance** – Fast frontend powered by Vite and Node.js backend.
- 🐳 **Docker Support** – Fully dockerized setup for easy deployment.
- 🗄️ **Robust Database** – Reliable PostgreSQL integration for data persistence.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Vite, HTML5, CSS3, JavaScript (ES6+) |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL |
| **DevOps** | Docker, Docker Compose |

---

## 📁 Project Structure

```text
HealthVAULT/
├── backend/                # Node.js + Express backend
│   ├── routes/             # API routes
│   ├── index.js            # Backend entry point
│   └── ...
├── src/                    # Frontend source files (Vite)
├── index.html              # Frontend entry point
├── Dockerfile              # Docker configuration
├── docker-compose.yml      # Docker orchestrator
├── package.json            # Project dependencies
├── guidelines/             # Documentation and guides
├── implementation_plan.md  # Project roadmap
└── README.md               # Project documentation
```

---

## 🐳 Run with Docker (Recommended)

Quickly spin up the entire stack using Docker Compose:

```bash
# Build and start containers in detached mode
docker compose up --build -d

# Start existing containers
docker compose up -d

# Stop and remove containers
docker compose down
```

---

## 💻 Run Locally (Development)

### 1️⃣ Frontend
From the root directory:
```bash
npm install
npm run dev
```
👉 **Access UI at:** `http://localhost:5173`

### 2️⃣ Backend
Navigate to the backend directory:
```bash
cd backend
npm install
node index.js
```
👉 **Backend API at:** `http://localhost:3001`

> [!TIP]
> **If port 3001 is already in use (Windows/PowerShell):**
> ```powershell
> Stop-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess -Force
> Stop-Process -Name node -Force
> ```

---

## 🔑 Test Credentials

Use these credentials to explore the platform:

| Field | Value |
| :--- | :--- |
| **Email** | `test3@gmail.com` |
| **Password** | `test123` |

---

## 📝 Important Notes

- **Vite:** The frontend development server runs on Vite for hot module replacement.
- **Port 3001:** The backend serves APIs on port 3001 by default.
- **Environment Variables:** Ensure a `.env` file is configured in the `backend/` directory. **Do not push sensitive credentials to GitHub.**
- **Docker:** The Docker setup includes both the backend server and the database.
