# Test Scripts

This directory contains end-to-end test scripts for verifying the functionality of the LogiSimple Fleet Management System.

## Prerequisites

1. Node.js 18+ installed
2. Dependencies installed: `npm install`
3. Development server running: `npm run dev`
4. Environment variables set up in `.env` file

## Available Test Scripts

### Document Flow Tests

Tests the document upload, retrieval, and deletion functionality.

```bash
# Run document flow tests
npm run test:documents
```

### Assignment Flow Tests

Tests the vehicle assignment and management functionality.

```bash
# Run assignment flow tests
npm run test:assignments
```

### Run All Tests

Runs all available test suites.

```bash
# Run all tests
npm run test:all
```

## Test Environment Setup

1. Ensure your local development server is running:
   ```bash
   npm run dev
   ```

2. The test scripts will use the following environment variables from your `.env` file:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

## Test Data

The test scripts will create and clean up test data automatically. Test data includes:
- Test driver (ID: `test-driver-123`)
- Test vehicle (ID: `test-vehicle-123`)
- Test company (ID: `test-company-123`)
- Test user (ID: `test-user-123`)

## Debugging Tests

If a test fails, check the following:
1. Is the development server running?
2. Are the Supabase environment variables correctly set?
3. Does the test user have the necessary permissions in Supabase?
4. Check the console output for detailed error messages.

## Adding New Tests

1. Create a new TypeScript file in the `scripts` directory.
2. Export test functions that can be called independently.
3. Update `package.json` with new test scripts if needed.
4. Document the new tests in this README.

## License

This project is licensed under the MIT License.
