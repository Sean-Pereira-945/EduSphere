# 🎓 EduSphere — Learning Management System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v18-blue.svg)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-teal.svg)](https://neon.tech/)

> A modern, full-stack Learning Management System with role-based dashboards, file uploads via Cloudinary, and a premium glassmorphism UI.

---

## 🚀 Project Overview

**EduSphere** is a full-stack LMS built for colleges and universities. It provides a seamless experience for both students and teachers:

- **Students** can browse the course catalog, enroll in courses, view syllabi, access module materials, and submit assignments.
- **Teachers** can create and manage courses (with logo + syllabus uploads), add modules and materials, post assignments with PDF attachments, grade submissions, and approve/reject enrollment requests.

The platform is built on a **React + Express monorepo** with a **Neon PostgreSQL** database and **Cloudinary** for all file storage.

---

## ✨ Key Features

### 👨‍🎓 Student Portal
- Browse the full course catalog with search & category filters
- One-click enrollment with pending/approved status tracking
- Course workspace: access modules, materials, announcements, and assignments
- Submit assignments directly in the browser

### 👩‍🏫 Teacher Dashboard
- Create / edit / delete courses with drag-and-drop logo and syllabus uploads
- Add course modules and upload lecture materials (PDFs, images)
- Post assignments with optional PDF attachments
- View and grade student submissions
- Approve or reject enrollment requests in real time

### 🎨 Design & UX
- Premium glassmorphism dark-mode UI
- Custom-themed dropdowns (no native OS widgets)
- 3D Spline robot on the landing and login pages
- Smooth micro-animations and loading states throughout

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Vanilla CSS |
| Backend | Node.js, Express |
| Database | PostgreSQL (Neon serverless) |
| File Storage | Cloudinary |
| Auth | JWT (7-day expiry) |
| 3D / Animation | Spline |

---

## ⚙️ Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/Sean-Pereira-945/EduSphere.git
cd EduSphere
```

### 2. Install dependencies
```bash
# Root (concurrently runs both servers)
npm install

# Backend
cd backend && npm install

# Frontend
cd client && npm install
```

### 3. Configure environment variables
```bash
cp backend/.env.example backend/.env
```
Open `backend/.env` and fill in your credentials:
- **DATABASE_URL** — your Neon (or any Postgres) connection string
- **JWT_SECRET** — any long random string
- **CLOUDINARY_*** — your Cloudinary cloud name, API key, and secret

### 4. Run in development
```bash
# From the project root — starts both backend (port 5000) and frontend (port 5173)
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📁 Project Structure

```
EduSphere/
├── backend/
│   ├── server.js          # Express app, all API routes
│   ├── db/
│   │   └── migrate.js     # Auto-migration on startup
│   ├── validators/        # Joi validation schemas
│   ├── utils/             # Email helper, etc.
│   └── .env.example       # Environment variable template
├── client/
│   ├── src/
│   │   ├── App.jsx        # Root component, routing, auth state
│   │   ├── components/    # All page-level and shared components
│   │   └── index.css      # Global design system & animations
│   └── index.html         # Entry HTML (tab title, meta, fonts)
├── package.json           # Root scripts (concurrently)
└── vercel.json            # Deployment config
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "feat: describe your change"`
4. Push your branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📜 License

This project is licensed under the **MIT License** — free to use, modify, and distribute.

---

## 📧 Contact

For questions or feedback:
- 📩 [seanpereira945@gmail.com](mailto:seanpereira945@gmail.com)

---

*Thank you for exploring **EduSphere**! Built with ❤️ for students and educators.*
