
# React + Laravel Fullstack Project

A full-stack application using **Laravel (Backend API)** and **React + TypeScript (Frontend)** with **JWT Token Authentication** using Axios interceptors.

---

## 🚀 Features
- Laravel REST API
- React + TypeScript frontend
- Axios instance with Authorization header (Bearer token)
- Auto token injection using interceptors
- Local development with Vite + Laravel

---

# 📦 Requirements
| Tool | Version |
|------|---------|
| PHP | 8.1+ |
| Composer | Latest |
| MySQL | Any |
| Node.js | 18+ |
| npm / yarn | Latest |

---

# 🔧 Backend Setup (Laravel API)

### 1️⃣ Navigate to backend folder
```bash
cd backend
```

### 2️⃣ Install dependencies
```bash
composer install
```

### 3️⃣ Create `.env`
```bash
cp .env.example .env
```

### 4️⃣ Generate key
```bash
php artisan key:generate
```

### 5️⃣ Configure DB in `.env`
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_db
DB_USERNAME=root
DB_PASSWORD=
```

### 6️⃣ Run migrations
```bash
php artisan migrate
```

### 7️⃣ Start backend
```bash
php artisan serve
```

Backend will run at:
👉 http://localhost:8000

---

# 🎨 Frontend Setup (React)

### 1️⃣ Navigate to frontend
```bash
cd frontend
```

### 2️⃣ Install dependencies
```bash
npm install
```

### 3️⃣ Create `.env` file  
Inside `frontend` folder:
```
VITE_API_URL=http://localhost:8000/api
```

### 4️⃣ Start development server
```bash
npm run dev
```

Frontend runs at:
👉 http://localhost:5173

---

# 🔗 Axios API Setup (with Bearer Token)

```ts
import axios from "axios";

const http = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});

http.interceptors.request.use(
  config => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

export default http;
```

---

# 📌 Example API Usage

### Login
```ts
http.post("/login", {
  email,
  password,
}).then(res => {
  localStorage.setItem("token", res.data.token);
});
```

### Fetch secure data
```ts
http.get("/user")
  .then(res => console.log(res.data));
```

---

# ✔️ Folder Structure
```
project/
├── backend/  → Laravel API
└── frontend/ → React + TS + Axios
```

---

# 🧪 Testing

### Test backend:
http://localhost:8000/api

### Test frontend:
http://localhost:5173

---

# 🛠 Common Issues

### ❌ CORS Error  
Install:
composer require fruitcake/laravel-cors

Restart server.

### ❌ Token not applied  
Check:
localStorage.getItem("token")

### ❌ API 401 Unauthorized  
Backend token invalid or expired.

