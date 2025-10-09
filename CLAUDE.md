# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `npm run dev` (uses Turbopack for faster builds)
- **Production build**: `npm run build --turbopack`
- **Linting**: `npm run lint`
- **Production start**: `npm start`
- **Vercel deployment**: `vercel --prod`

## Architecture Overview

### Core Technology Stack
- **Framework**: Next.js 15.5.3 with App Router and Turbopack
- **Authentication**: Supabase Auth with custom profiles table
- **Database**: Supabase (PostgreSQL)
- **State Management**: Zustand with persistence middleware
- **Styling**: Tailwind CSS v4
- **Forms**: React Hook Form with Yup validation
- **Charts**: Recharts for admin analytics

### Application Structure

This is a **금니깨비 (Gold Purchase Platform)** - a Korean gold buying service with customer and admin portals.

#### Route Structure
- **Public Routes** (`/`, `/login`, `/signup`)
- **Customer Routes** (`/dashboard`, `/apply`, `/history`, `/reviews`, `/settlements`, `/tracking/[id]`)
- **Admin Routes** (`/admin/*`) - Dashboard, user management, request processing, settlements, analytics

#### Key Architectural Patterns

**1. Role-Based Layouts**
- `src/app/(public)/layout.tsx` - Public pages
- `src/app/(customer)/layout.tsx` - Customer dashboard with auth protection
- `src/app/(admin)/layout.tsx` - Admin dashboard with role verification

**2. Authentication Flow**
- Zustand store (`src/stores/authStore.ts`) manages global auth state
- Automatic auth listener setup/cleanup prevents memory leaks
- Role-based route protection with fallback redirects
- Email verification disabled for immediate signup→login flow

**3. Database Integration**
- Supabase client in `src/lib/supabase/client.ts`
- Auth functions in `src/lib/supabase/auth.ts`
- Database operations in `src/lib/supabase/database.ts`
- Type-safe operations with TypeScript interfaces

### Critical Stability Patterns

**Auth Listener Management**
- Single auth listener per app instance via `setupAuthListener()`
- Cleanup on component unmount to prevent memory leaks
- Duplicate call prevention with `isListenerSetup` flag

**Error Boundaries**
- `ErrorBoundary` component wraps customer layout
- Graceful error handling with fallback UI
- Development vs production error display

**Safe Navigation**
- Router operations wrapped in try-catch
- Fallback to `window.location.href` on router failures

### Data Models

**Core Entities** (see `src/types/index.ts`):
- `User` - Customer/admin profiles with role-based permissions
- `PurchaseRequest` - Gold purchase applications with status workflow
- `GoldPrice` - Daily gold pricing (18k, 14k, 24k)
- `Settlement` - Payment processing and bank transfers
- `Review` - Customer feedback system

**Status Workflows**:
- Purchase: `pending` → `shipped` → `received` → `evaluating` → `evaluated` → `approved` → `confirmed` → `paid` → `deposited`
- Payment: `pending` → `processing` → `completed`/`failed`

### Key Business Logic

**Gold Purchase Flow**:
1. Customer applies via `/apply` with photos and bank details
2. Admin processes in `/admin/requests`
3. Real-time status tracking via `/tracking/[id]`
4. Settlement creation and payment processing
5. Customer reviews and admin responses

**Member Grading System**:
- Bronze/Silver/Gold/Platinum tiers based on transaction volume
- Rate bonuses: 0.4% → 0.45% (see `MEMBER_GRADES` in types)

### Environment Configuration

**Required Environment Variables**:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Supabase configured for no email confirmation (immediate signup→login)

### MCP Server Integration

The project supports Supabase MCP server for database operations:
- `mcp__supabase__*` functions for database queries
- Direct SQL execution capabilities
- Branch management for development

### Build Considerations

- Turbopack enabled for faster development builds
- Static generation for public pages
- Dynamic rendering for authenticated routes
- Image optimization configured for localhost and Vercel domains
- Security headers including X-Frame-Options: SAMEORIGIN

### Deployment

- Primary deployment target: Vercel
- Production URL pattern: `*.vercel.app`
- Environment variables must be configured in Vercel dashboard
- Build warnings are acceptable (no errors should exist)