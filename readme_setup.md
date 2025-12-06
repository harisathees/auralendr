# Setup Instructions

This guide provides step-by-step instructions to set up the project after pulling from GitHub. The project consists of a **Laravel (Backend)** and a **React (Frontend)** application.

## Prerequisites

Ensure you have the following installed:
- **PHP** >= 8.2
- **Composer**
- **Node.js** & **npm**
- **Database** (MySQL or SQLite)
- **Redis** (Required for caching/sessions as per `predis` dependency)

---

## 1. Backend Setup (Laravel)

Navigate to the backend directory:
```bash
cd backend
```

### Install Dependencies
```bash
composer install
```

### Environment Configuration
Copy the example environment file and configure it:
```bash
cp .env.example .env
```
Open `.env` and update your database credentials:
```env
DB_CONNECTION=mysql # or sqlite
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_database_name
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

### Generate Application Key
```bash
php artisan key:generate
```

### Database Migration & Seeding
Run migrations to set up the database schema:
```bash
php artisan migrate
```
Run seeders to populate initial data (e.g., Admin user, Roles):
```bash
php artisan db:seed
```
*Note: This usually runs `DatabaseSeeder`, which should call `AdminSeeder` and `RolePermissionSeeder`.*

### Fix Permissions (Optional/Debug)
If you encounter permission issues or need to force-assign the admin role to User ID 1, run:
```bash
php fix_permissions.php
```

### Start Backend Server
```bash
php artisan serve
```
The API will be available at `http://localhost:8000`.

---

## 2. Frontend Setup (React + Vite)

Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
```

### Install Dependencies
```bash
npm install
```

### Environment Configuration
If needed, create a `.env` file for frontend variables (e.g., API URL). Usually, Vite uses `.env` files.
```bash
# Example content for .env
VITE_API_BASE_URL=http://localhost:8000
```

### Start Frontend Server
```bash
npm run dev
```
The application will be accessible at the URL shown in the terminal (usually `http://localhost:5173`).

---

## Troubleshooting

- **Permissions Error**: Ensure `storage` and `bootstrap/cache` directories in `backend` are writable.
- **Database Error**: Ensure your database server is running and credentials in `.env` are correct.
- **Redis Error**: If you don't have Redis installed, you can change `CACHE_STORE` and `SESSION_DRIVER` to `file` in `backend/.env` for local development.

