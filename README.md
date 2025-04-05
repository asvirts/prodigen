# Prodigen - Your AI-Powered Application Suite

A Next.js 15 application with finance tracking, task management, and wellness habits features. This application implements modern best practices in React development including efficient data fetching, optimistic UI updates, error handling, and testing.

## Features

- **Finance Management:** Track transactions, manage budgets, and visualize spending patterns
- **Task Management:** Create, organize, and track tasks with deadlines and status updates
- **Wellness Habits:** Build healthy habits by tracking daily activities
- **User Authentication:** Secure authentication with Supabase
- **Subscription Management:** Subscription handling with Stripe

## Technology Stack

- **Framework:** Next.js 15 with App Router
- **UI Components:** Shadcn/UI
- **Styling:** Tailwind CSS
- **Data Fetching:** React Query and SWR for efficient caching and revalidation
- **Authentication:** Supabase Auth
- **Database:** Supabase PostgreSQL
- **Form Handling:** React Hook Form with Zod validation
- **Payments:** Stripe
- **Testing:** Jest, React Testing Library, and Cypress

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
NEXT_PUBLIC_STRIPE_PRICE_ID=your_stripe_price_id
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Testing

### Unit and Integration Testing

Run Jest tests:

```bash
npm test
npm run test:watch  # Run in watch mode
npm run test:coverage  # Generate coverage report
```

### End-to-End Testing

Run Cypress tests:

```bash
npm run cypress  # Open Cypress UI
npm run e2e  # Run end-to-end tests with UI
npm run e2e:headless  # Run end-to-end tests headlessly
```

## Key Improvements

1. **Efficient Data Fetching:** Using React Query for caching, deduplication, and background updates
2. **Error Handling:** Comprehensive error boundaries to gracefully handle failures
3. **Optimistic UI Updates:** Immediate UI updates with rollback on errors for better UX
4. **Client-Side Validation:** Enhanced form validation with both client and server validation
5. **Testing Infrastructure:** Complete testing setup with Jest and Cypress

## Deployment

This application can be deployed on Vercel or any other platform that supports Next.js applications.

## Code Quality

### Pre-commit Hooks

This project uses [husky](https://typicode.github.io/husky/) and [lint-staged](https://github.com/okonet/lint-staged) to run code quality checks before each commit:

- ESLint runs to catch any linting errors
- Prettier formats all staged files
- All tests must pass before committing

This ensures that the codebase maintains a consistent style and prevents common issues from being committed.
