# ⚙️ CampusCrate Backend

Server-side REST API for **CampusCrate** built with Node.js, Express 5, MongoDB, JWT Authentication, and Cloudinary.

For the complete project documentation, architecture, API endpoints, and full-stack setup, please refer to the [Root README](../README.md).

---

## 🛠️ Tech Stack
- **Node.js** & **Express 5**
- **MongoDB & Mongoose** (Database & ODM)
- **JWT (`jsonwebtoken`) & bcryptjs** (Authentication & password hashing)
- **Multer & Cloudinary** (Image handling and cloud media storage)
- **Google Auth Library** (Google OAuth token verification)

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your `PORT`, `MONGODB_URI`, `JWT_SECRET`, `CLOUDINARY_*`, and `GOOGLE_CLIENT_ID` values.

### 3. Run Server

**Development Mode (Nodemon):**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```
