# Project Documentation: Auralendr

This document provides a comprehensive overview of the Auralendr project, detailing the file structure, technology stack, and core functionality for both the Backend and Frontend.

## 1. Technology Stack

### Backend
-   **Framework**: Laravel 10 (PHP)
-   **Database**: MySQL
-   **Authentication**: Laravel Sanctum (Token-based)
-   **Authorization**: Spatie Laravel Permission (Role-based)
-   **API Style**: RESTful JSON API

### Frontend
-   **Framework**: React (Vite)
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS
-   **State Management**: React Context API (`AuthContext`)
-   **Routing**: React Router DOM
-   **HTTP Client**: Axios

---

## 2. Backend Structure (`/backend`)

The backend follows the standard Laravel MVC architecture, organized by domain (e.g., `pledge`, `BranchAndUser`).

### Key Directories

#### `app/Models`
Contains Eloquent models representing database tables.
-   **`BranchAndUser/`**:
    -   `User.php`: User entity with role management.
    -   `Branch.php`: Branch entity.
-   **`pledge/`**:
    -   `Pledge.php`: Core pledge entity.
    -   `Customer.php`: Customer details.
    -   `Loan.php`: Loan financial details.
    -   `Jewel.php`: Jewel items associated with a pledge.
    -   `MediaFile.php`: Uploaded files (images/docs) linked to pledges.

#### `app/Http/Controllers`
Handles incoming HTTP requests and returns responses.
-   **`pledge/PledgeController.php`**: Manages CRUD operations for pledges.
-   **`login/LoginController.php`**: Handles user authentication (login/logout).
-   **`Admin/`**: Controllers for admin-specific tasks (Users, Branches).

#### `app/Policies`
Defines authorization logic.
-   **`pledge/PledgePolicy.php`**: Rules for who can view, update, or delete pledges based on branch and permissions.

#### `app/Http/Requests`
Form request classes for validation.
-   **`pledge/StorePledgeRequest.php`**: Validation rules for creating a pledge.
-   **`pledge/UpdatePledgeRequest.php`**: Validation rules for updating a pledge.

#### `routes`
-   **`api.php`**: Defines API endpoints (e.g., `/api/pledges`, `/api/login`).

---

## 3. Frontend Structure (`/frontend`)

The frontend is a Single Page Application (SPA) built with React and TypeScript.

### Key Directories (`src/`)

#### `components`
Reusable UI components.
-   **`Pledges/`**:
    -   `PledgeForm.tsx`: Form for creating and editing pledges.
    -   `PledgeView.tsx`: Detailed view of a single pledge.
    -   `PledgeList.tsx`: List view of pledges with filtering.
-   **`Shared/`**: Generic components like `FormField`, `FileUploader`.
-   **`ProtectedRoute.tsx`**: Wrapper to restrict access to authenticated users.

#### `context`
Global state management.
-   **`AuthContext.tsx`**: Manages user authentication state (user object, token, login/logout functions).

#### `pages`
Top-level page components corresponding to routes.
-   `LoginPage.tsx`: Login screen.
-   `Dashboard.tsx`: Main dashboard.
-   `PledgesPage.tsx`: Wrapper for pledge-related views.

#### `api`
API integration layer.
-   `axios.ts`: Configured Axios instance with interceptors for auth tokens.
-   `pledgeApi.ts`: Functions to call backend pledge endpoints.

#### `types`
TypeScript interfaces for type safety.
-   `index.ts`: Definitions for `Pledge`, `Customer`, `Loan`, `Jewel`, `User`, etc.

---

## 4. Core Functionality

### Authentication Flow
1.  **Login**: User submits credentials on Frontend -> Backend `LoginController` validates -> Returns Sanctum token.
2.  **Storage**: Frontend stores token in `localStorage`.
3.  **Requests**: Axios interceptor attaches `Authorization: Bearer <token>` to every request.
4.  **Protection**: Backend `auth:sanctum` middleware protects API routes.

### Pledge Management (CRUD)
-   **Create**: `PledgeForm` collects complex data (Customer, Loan, Jewels, Files) -> Sends `POST /api/pledges` as `FormData`. Backend wraps creation in a Database Transaction to ensure data integrity.
-   **Read**: `PledgeList` fetches paginated data. `PledgeView` fetches single pledge with relations (`load(['customer', 'loan', 'jewels', 'media'])`).
-   **Update**: `PledgeForm` pre-fills data -> Sends `POST` (spoofed as `PUT`) to update. Backend synchronizes related models (e.g., syncs jewels, deletes removed files).
-   **Delete**: Admin-only action to remove a pledge.

### Authorization
-   **Role-Based**: Users have roles (e.g., `admin`, `staff`).
-   **Policy-Based**: `PledgePolicy` ensures staff can only access pledges from their own branch. Admins have global access.

### File Handling
-   **Upload**: Files are uploaded via `FormData`.
-   **Storage**: Backend stores files in `storage/app/public/pledge_media`.
-   **Access**: `MediaFile` model generates public URLs via an accessor (`url` attribute).
