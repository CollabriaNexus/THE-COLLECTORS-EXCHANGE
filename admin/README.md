# Admin Dashboard - The Collectors Exchange

React-based admin panel for managing THE COLLECTORS EXCHANGE platform.

## Features

- ✅ KYC Request Management (Approve/Reject with Aadhar and PAN verification)
- 🔄 User Management (Coming Soon)
- 🔄 Product Management (Coming Soon)
- 🔄 Order Management (Coming Soon)

## Setup

### 1. Install Dependencies

```bash
cd x:\THE-COLLECTORS-EXCHANGE\admin
npm install
```

### 2. Create Admin User

Before logging in, you need to create an admin user in the database. Run this SQL command in your PostgreSQL database:

```sql
-- First, sign up via the main webapp to create a Supabase account
-- Then update the user's role to admin:

UPDATE "User" 
SET role = 'admin' 
WHERE email = 'your-admin-email@example.com';
```

**Important**: Replace `your-admin-email@example.com` with your actual email address that you used to sign up.

### 3. Start the Admin Dashboard

```bash
npm run dev
```

The admin dashboard will run on `http://localhost:5174`

### 4. Login

- Navigate to `http://localhost:5174/login`
- Use your admin credentials (email and password from Supabase)
- Only users with `role: "admin"` can access the dashboard

## Development

- Main app: `http://localhost:5173`
- Admin dashboard: `http://localhost:5174`
- Backend API: `http://localhost:3000`

## Tech Stack

- React 19.2.0
- Vite 7.2.4
- TanStack React Query
- React Router DOM
- Axios
- TailwindCSS
- Lucide React Icons
- Supabase Auth

## API Endpoints

All admin endpoints require authentication with `role: "admin"`.

### KYC Management

- `GET /api/admin/kyc/requests` - List all KYC requests
- `GET /api/admin/kyc/requests/:id` - Get KYC request detail
- `PATCH /api/admin/kyc/requests/:id/approve` - Approve KYC
- `PATCH /api/admin/kyc/requests/:id/reject` - Reject KYC
