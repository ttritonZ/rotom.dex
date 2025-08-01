# Admin Setup Guide

## Understanding the 403 Forbidden Error

The 403 Forbidden error occurs when a user tries to access admin-only routes (like `/api/admin/dropdown-data`) but doesn't have admin privileges. This happens because:

1. The user's `is_admin` field in the database is `false`
2. The JWT token contains the user's admin status, but the middleware checks `req.user.is_admin`

## How to Fix the Issue

### Option 1: Create a New Admin User

1. Navigate to the backend directory:
   ```bash
   cd rotom.back
   ```

2. Run the admin creation script:
   ```bash
   node src/scripts/createAdmin.js create admin admin@example.com password123 Admin
   ```

3. Log in with the new admin credentials in the frontend.

### Option 2: Make an Existing User an Admin

1. First, check existing users:
   ```bash
   cd rotom.back
   node src/scripts/createAdmin.js check
   ```

2. Make a specific user an admin (replace `USER_ID` with the actual user ID):
   ```bash
   node src/scripts/createAdmin.js make-admin USER_ID
   ```

3. Log out and log back in to refresh your JWT token.

### Option 3: Direct Database Update

If you have direct database access, you can run this SQL query:

```sql
UPDATE "User" SET "is_admin" = true WHERE "username" = 'your_username';
```

## Debugging

The application now includes better error handling and debugging:

1. **Frontend**: The `AddPokemon.jsx` component now shows a clear access denied message if the user is not an admin
2. **Backend**: The middleware now logs detailed information about authentication and admin checks

### Checking Debug Logs

When you try to access admin routes, check the backend console for logs like:
- `authenticateJWT - decoded token: {...}`
- `isAdmin middleware - user: {...}`
- `isAdmin middleware - user.is_admin: true/false`

## Common Issues

1. **Token not refreshed**: After making a user admin, you need to log out and log back in to get a new JWT token with the updated admin status.

2. **Database connection**: Make sure your database is running and the connection is working.

3. **Environment variables**: Ensure your backend URL is correctly set in the frontend environment.

## Testing Admin Access

Once you have admin access, you should be able to:
- Access `/admin/add-pokemon`
- Access `/admin/manage-pokemon`
- Access `/admin/users`
- See the "Admin Tools" link in the navigation bar

If you still get 403 errors after following these steps, check the backend console logs for more detailed error information. 