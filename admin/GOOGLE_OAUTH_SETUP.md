# Google OAuth Setup for Admin Dashboard

## What Was Added

✅ **Google Sign-In Button** on the login page  
✅ **OAuth Callback Handling** - Automatically verifies admin role after Google redirect  
✅ **Session Persistence** - Checks for existing sessions on login page load  

## Supabase Configuration Required

To enable Google OAuth, you need to configure it in your Supabase project:

### 1. Enable Google Provider in Supabase

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Navigate to **Authentication** → **Providers**
3. Find **Google** in the list
4. Toggle it **ON**
5. You'll need to provide:
   - **Client ID** (from Google Cloud Console)
   - **Client Secret** (from Google Cloud Console)

### 2. Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Choose **Web application**
6. Add **Authorized redirect URIs**:
   ```
   https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback
   ```
7. Copy the **Client ID** and **Client Secret**
8. Paste them into Supabase Authentication → Providers → Google

### 3. Configure Redirect URL in Admin Dashboard

The redirect URL is already configured to redirect to the dashboard homepage (`/`) after successful Google login.

## How It Works

1. **User clicks "Sign in with Google"** → Redirects to Google OAuth consent screen
2. **User authorizes the app** → Google redirects back to admin dashboard
3. **Supabase creates session** → Admin dashboard checks session on load
4. **Backend verifies admin role** → If user has `role: "admin"`, they're logged in
5. **Non-admin users** → Shown error message and signed out

## Testing

1. Configure Google OAuth in Supabase (see above)
2. Navigate to `http://localhost:5174/login`
3. Click "Sign in with Google"
4. Sign in with a Google account that has admin role in database
5. You should be redirected to the dashboard

**Note**: The Google account email must match a user in your database with `role: "admin"`.

## Security

- ✅ OAuth callback automatically verifies admin role
- ✅ Non-admin users are rejected and signed out
- ✅ All API calls still require JWT authentication
- ✅ Session is stored securely via Supabase
