-- ============================================
-- CREATE ADMIN USER FOR THE COLLECTORS EXCHANGE
-- ============================================

-- STEP 1: First, sign up on the main webapp (http://localhost:5173)
--         with your email and password to create a Supabase account

-- STEP 2: Then run this command to upgrade your user to admin:

UPDATE "User" 
SET role = 'admin' 
WHERE email = 'your-email@example.com';

-- Replace 'your-email@example.com' with your actual email

-- STEP 3: Verify the update:

SELECT id, email, name, role, "kycStatus", "createdAt" 
FROM "User" 
WHERE role = 'admin';

-- ============================================
-- You can now log in to the admin dashboard at:
-- http://localhost:5174/login
-- ============================================
