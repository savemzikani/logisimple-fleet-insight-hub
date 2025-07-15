# LogiSimple - Milestone 1: Foundation Setup Guide

This document provides instructions for setting up and verifying the foundation of the LogiSimple Fleet Management application.

## Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Supabase project with the latest migrations applied
- Environment variables configured in `.env` file

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
# or
yarn install
```

### 2. Apply Database Migrations

Make sure all database migrations have been applied to your Supabase project. The migrations include:

- Initial schema setup
- RLS policies
- Helper functions
- Test data

### 3. Set Up Admin User

Run the admin setup script to create an initial admin user and company:

```bash
node scripts/setup-admin.js
```

This will output the admin credentials. Save these for logging in.

### 4. Verify RLS Policies

Run the RLS verification tests to ensure all security policies are working correctly:

```bash
node scripts/verify-rls-policies.js
```

This script will test:
- Company creation and access control
- User registration and profile management
- Vehicle CRUD operations
- Driver CRUD operations
- Vehicle tracking
- Data isolation between companies

## Testing the Application

1. Start the development server:

```bash
npm run dev
# or
yarn dev
```

2. Open http://localhost:3000 in your browser
3. Log in with the admin credentials from the setup script

## Expected Behavior

- You should be able to log in with the admin account
- The dashboard should load with sample data
- You should be able to:
  - View and manage vehicles
  - View and manage drivers
  - See vehicle tracking information
  - Manage company settings (if you have admin role)

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Ensure your Supabase URL and keys are correct
   - Verify that the user has been created in both Auth and the profiles table

2. **RLS Policy Violations**
   - Make sure all migrations have been applied
   - Check the Supabase logs for detailed error messages
   - Verify that the user has the correct role and company association

3. **Missing Data**
   - Check if the test data was properly inserted
   - Verify that the user has the correct permissions to view the data

## Next Steps

After verifying Milestone 1 is working correctly, you can proceed with implementing additional features from the implementation plan.

## Support

For any issues or questions, please refer to the project documentation or contact the development team.
