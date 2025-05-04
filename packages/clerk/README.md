# @repo/clerk

User management and authentication package using Clerk with Permit.io integration.

## Overview

This package handles user registration, authentication, and authorization flows by integrating:

- [Clerk](https://clerk.com) for authentication and identity management
- [Permit.io](https://permit.io) for authorization and access control
- Database integration for persistence

## Features

- User registration with role assignment
- Role synchronization between Clerk, Permit.io, and the database
- Test user seeding for development environment
- Consistent user metadata across all systems

## Installation

```bash
pnpm install
```

## Environment Setup

Create a `.env` file in the root of your project with the following variables:

```
# Clerk
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_JWT_KEY=your_clerk_jwt_key

# Permit.io
PERMIT_API_KEY=your_permit_api_key
PERMIT_PDP_URL=https://cloudpdp.api.permit.io

# Database
DATABASE_URL=your_postgres_connection_string
```

## Quick Start

### Run the Example

To run a complete example showing user registration and test user creation:

```bash
pnpm run -F @repo/clerk example
```

### Set Up Test Users

To create all test users with predefined credentials:

```bash
pnpm run -F @repo/clerk test:setup
```

## Usage

### Registering a User

```typescript
import { registerUser } from '@repo/clerk';

// Register a new patient user
const result = await registerUser({
  email: 'patient@example.com',
  password: 'secure_password',
  name: 'John Doe',
  role: 'patient',
});

if (result.success) {
  console.log(`User created with ID: ${result.userId}`);
} else {
  console.error(`Registration failed: ${result.error}`);
}
```

### Seeding Test Users

In development, you can seed test users with predefined credentials:

```typescript
import { seedTestUsers } from '@repo/clerk';

// Seed all test users
await seedTestUsers();
```

## Test Credentials

The following test users are created automatically in development:

### Admin Account
- Username: admin@medicalai.com
- Password: 2025DEVChallenge
- Role: admin

### Doctor Account
- Username: doctor@medicalai.com
- Password: 2025DEVChallenge
- Role: doctor

### Patient Account
- Username: patient@medicalai.com
- Password: 2025DEVChallenge
- Role: patient

### Researcher Account
- Username: researcher@medicalai.com
- Password: 2025DEVChallenge
- Role: researcher

### Regular User Account
- Username: newuser@medicalai.com
- Password: 2025DEVChallenge
- Role: patient

## API Reference

### Registration

```typescript
registerUser(data: RegistrationData): Promise<{ success: boolean; userId?: string; error?: string }>
```

Registers a new user in the system.

### User Management

```typescript
createClerkUser(data: RegistrationData): Promise<ClerkUser | null>
```

Creates a user in Clerk.

```typescript
getClerkUser(userId: string): Promise<ClerkUser | null>
```

Gets a user from Clerk by ID.

```typescript
updateUserRole(userId: string, role: UserRole): Promise<boolean>
```

Updates a user's role in Clerk.

### Synchronization

```typescript
syncUserToDatabase(clerkUserId: string): Promise<string | null>
```

Synchronizes a user from Clerk to the database.

```typescript
syncUserRoles(userId: string, clerkUserId: string, role: UserRole): Promise<boolean>
```

Synchronizes user roles to the database and Permit.io.

```typescript
syncUserToPermit(clerkUserId: string, dbUser: any, role: UserRole): Promise<any>
```

Synchronizes a user to Permit.io.

## Testing

To test the registration and authentication flow:

1. Set up required environment variables in `.env`

2. Run the test setup script:
   ```bash
   pnpm run -F @repo/clerk test:setup
   ```

3. Start the development server:
   ```bash
   pnpm run dev
   ```

4. Navigate to the sign-in page and use the provided test credentials.

5. Try different roles to verify authorization rules are working correctly.

## Integration with Front-end

In your Next.js application:

1. Use the Clerk Provider to wrap your application:
   ```typescript
   // app/layout.tsx
   import { ClerkProvider } from '@clerk/nextjs';

   export default function RootLayout({
     children,
   }: {
     children: React.ReactNode;
   }) {
     return (
       <html lang="en">
         <ClerkProvider>
           <body>{children}</body>
         </ClerkProvider>
       </html>
     );
   }
   ```

2. Create protected routes using middleware:
   ```typescript
   // middleware.ts
   import { authMiddleware } from '@clerk/nextjs';
   import { permitMiddleware } from '@repo/permit';

   export default authMiddleware({
     // Your Clerk auth configuration
     afterAuth: permitMiddleware, // Apply Permit.io middleware after authentication
   });

   export const config = {
     matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
   };
   ``` 