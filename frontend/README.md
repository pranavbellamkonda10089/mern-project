# 💻 CampusCrate Frontend

Client-side application for **CampusCrate** built with React 19, Vite, React Router v7, Framer Motion, and Lucide React.

For the complete project documentation, architecture, API endpoints, and full-stack setup, please refer to the [Root README](../README.md).

---

## 🛠️ Tech Stack
- **React 19**
- **Vite 8**
- **React Router DOM v7**
- **Framer Motion** (Smooth animations and transitions)
- **Lucide React** (Modern iconography)
- **qrcode.react** (Item QR code generation)
- **@react-oauth/google** (Google OAuth 2.0 social authentication)
- **Axios** (HTTP client for API communication)

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
Ensure `VITE_API_URL` points to your backend server (default: `http://localhost:5000`) and configure `VITE_GOOGLE_CLIENT_ID`.

### 3. Run Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```
