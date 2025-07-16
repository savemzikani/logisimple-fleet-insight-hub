# Fleet Management System - replit.md

## Overview

This is a comprehensive fleet management system built with React, TypeScript, Express.js, and PostgreSQL. The application provides tools for managing vehicles, drivers, and fleet operations with real-time analytics and reporting capabilities.

**Recent Migration:** Successfully migrated from Lovable/Supabase to Replit environment with enhanced security features (July 16, 2025).

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: Shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: React Router DOM for client-side navigation
- **Forms**: React Hook Form with Zod validation
- **Authentication**: Supabase Auth integration via context providers

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API Structure**: RESTful endpoints with `/api` prefix
- **Session Management**: PostgreSQL-backed sessions with connect-pg-simple
- **Development**: Hot module replacement via Vite middleware

### Component Architecture
- **Design System**: Consistent component library following shadcn/ui patterns
- **Layout**: Sidebar-based navigation with responsive design
- **Charts**: Recharts library for data visualization
- **Modals**: Radix UI Dialog primitives for overlays
- **Forms**: Controlled components with validation schemas

## Key Components

### Database Schema
- **Users Table**: Authentication and profile data
- **Companies Table**: Multi-tenant organization structure
- **Vehicles Table**: Fleet vehicle information and status
- **Drivers Table**: Driver profiles and certifications
- **Schema Location**: `shared/schema.ts` with Drizzle definitions

### Authentication System
- **Provider**: Supabase for user management
- **Context**: React context for auth state (`contexts/AuthContext.tsx`)
- **Protected Routes**: Route guards for authenticated content
- **Session Persistence**: Automatic session restoration

### Fleet Management Features
- **Vehicle Management**: CRUD operations for fleet vehicles
- **Driver Management**: Driver profiles with license tracking
- **Status Tracking**: Real-time vehicle and driver status
- **Analytics Dashboard**: Charts and metrics for fleet performance

### UI Component System
- **Base Components**: Atomic UI elements (buttons, inputs, cards)
- **Composite Components**: Feature-specific components (vehicle lists, driver forms)
- **Charts**: Enhanced visualization components with drill-down capabilities
- **Responsive Design**: Mobile-first approach with breakpoint management

## Data Flow

### Client-Server Communication
1. Frontend makes API calls to Express.js backend
2. Backend uses Drizzle ORM to query PostgreSQL database
3. Data is returned as JSON with proper error handling
4. TanStack Query manages caching and synchronization

### State Management Flow
1. Server state managed by TanStack Query with automatic caching
2. UI state handled by React hooks and context providers
3. Form state controlled by React Hook Form
4. Authentication state persisted via Supabase session management

### Real-time Updates
- Database changes trigger query invalidation
- Optimistic updates for better user experience
- Error boundaries for graceful failure handling

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL connection
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Headless UI primitives
- **react-hook-form**: Form management
- **zod**: Runtime type validation

### Development Dependencies
- **vite**: Build tool and dev server
- **typescript**: Type checking
- **tailwindcss**: Utility-first CSS framework
- **tsx**: TypeScript execution for Node.js

### Authentication & Database
- **Supabase**: Authentication and real-time features
- **connect-pg-simple**: PostgreSQL session store
- **ws**: WebSocket support for Neon database

## Deployment Strategy

### Build Process
1. **Frontend Build**: Vite compiles React app to static assets in `dist/public`
2. **Backend Build**: esbuild bundles Express server to `dist/index.js`
3. **Database Migration**: Drizzle Kit handles schema migrations

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (required)
- **NODE_ENV**: Environment specification (development/production)
- **Supabase Configuration**: API keys and project URL

### Production Deployment
- Express server serves both API endpoints and static frontend assets
- Database migrations run via `npm run db:push`
- Environment variables configured for production database access

### Development Setup
- Concurrent frontend/backend development via Vite middleware
- Hot module replacement for rapid iteration
- TypeScript compilation checking without emission
- Automatic database schema synchronization

The architecture supports a scalable, type-safe fleet management system with modern development practices and production-ready deployment strategies.