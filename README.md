# Link Shortener

A modern, secure link shortener built with Next.js 16 that allows users to create, manage, and track shortened URLs with a beautiful dashboard interface.

## Features

- **Custom Short Links**: Create memorable short links with custom slugs
- **User Authentication**: Secure authentication powered by Clerk
- **Link Management**: Easy-to-use dashboard to view, edit, and delete links
- **Click Tracking**: Monitor link performance (TODO: implement analytics)
- **Copy to Clipboard**: One-click copy functionality with toast notifications
- **Dark Mode Support**: Full dark mode support with Tailwind CSS
- **Rate Limiting**: Built-in protection against spam and abuse
- **Security Hardened**: URL validation, protocol whitelisting, and authorization checks
- **Type-Safe**: Built with TypeScript in strict mode

## Tech Stack

- **Language**: TypeScript 5
- **Framework**: Next.js 16 (App Router) with React 19
- **Database**: PostgreSQL (Neon serverless)
- **ORM**: Drizzle ORM
- **Authentication**: Clerk
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Icons**: Lucide React
- **Form Handling**: React Hook Form + Zod validation
- **Notifications**: Sonner (toast notifications)

## Prerequisites

- **Node.js**: v20.x or higher
- **Package Manager**: npm, yarn, or pnpm
- **Database**: PostgreSQL database (Neon recommended)
- **Clerk Account**: For authentication ([sign up here](https://clerk.com))

## Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/gh-copilot-linkshortener.git
cd gh-copilot-linkshortener
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up the database**

Create a PostgreSQL database on [Neon](https://neon.tech) or your preferred provider.

4. **Configure environment variables** (see Configuration section below)

5. **Push database schema**

```bash
npm run db:push
```

## Configuration

Create a `.env.local` file in the root directory with the following variables:

```bash
# Base URL for shortened links
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx

# Neon Database
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
```

### Environment Variables Explained

| Variable                            | Description                                         | Safe to Commit?     |
| ----------------------------------- | --------------------------------------------------- | ------------------- |
| `NEXT_PUBLIC_BASE_URL`              | The base URL for your app (used in shortened links) | ✅ Example only     |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key (public)                      | ✅ Yes              |
| `CLERK_SECRET_KEY`                  | Clerk secret key (private)                          | ❌ **Never commit** |
| `DATABASE_URL`                      | PostgreSQL connection string                        | ❌ **Never commit** |

**Important**: Add `.env.local` to your `.gitignore` (already configured). Never commit secrets to version control.

## Running the App

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Production Build

```bash
npm run build
npm run start
```

### Linting

```bash
npm run lint
```

### Database Commands

```bash
# Generate migration files
npm run db:generate

# Push schema changes to database
npm run db:push

# Open Drizzle Studio (database GUI)
npm run db:studio
```

## Usage

### Creating a Shortened Link

1. Sign in or create an account
2. Navigate to the Dashboard
3. Click "Create Link"
4. Enter your original URL and custom slug
5. Click "Create" to generate your shortened link
6. Copy the link with the copy button

### Managing Links

- **View Links**: All your links are displayed in the dashboard
- **Copy Link**: Click the copy icon to copy the full shortened URL
- **Edit Link**: Click the edit icon to modify the slug or URL
- **Delete Link**: Click the delete icon to remove a link
- **Open Link**: Click the external link icon to test the redirect

### Using Shortened Links

Access any shortened link via:

```
http://localhost:3000/l/{your-slug}
```

Example: `http://localhost:3000/l/my-link`

## Project Structure

```
gh-copilot-linkshortener/
├── app/                      # Next.js App Router
│   ├── dashboard/           # Dashboard page and server actions
│   │   ├── actions.ts       # Server actions for CRUD operations
│   │   └── page.tsx         # Dashboard UI
│   ├── l/[shortcode]/       # Redirect route handler
│   │   └── route.ts         # Link redirect logic
│   ├── layout.tsx           # Root layout with auth
│   ├── page.tsx             # Landing page
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── ui/                  # shadcn/ui base components
│   ├── create-link-dialog.tsx
│   ├── edit-link-dialog.tsx
│   ├── delete-link-dialog.tsx
│   └── link-card.tsx        # Link display component
├── data/                    # Database queries
│   └── links.ts             # Link CRUD functions
├── db/                      # Database configuration
│   ├── index.ts             # Drizzle client
│   └── schema.ts            # Database schema
├── lib/                     # Utility functions
│   ├── rate-limit.ts        # Rate limiting utility
│   └── utils.ts             # Helper functions
├── docs/                    # Documentation
│   └── SECURITY.md          # Security implementation details
└── drizzle/                 # Database migrations
```

## Testing

TODO: Add testing framework and instructions

- [ ] Set up Jest/Vitest
- [ ] Add unit tests for server actions
- [ ] Add integration tests for link creation/redirection
- [ ] Add E2E tests with Playwright

## Deployment

### Deploy to Vercel (Recommended)

1. **Connect Repository**

   - Push your code to GitHub
   - Import project in [Vercel](https://vercel.com)

2. **Configure Environment Variables**

   - Add all variables from `.env.local` in Vercel dashboard
   - Update `NEXT_PUBLIC_BASE_URL` to your production domain

3. **Deploy**
   - Vercel will automatically build and deploy
   - Database migrations run automatically via build command

### Other Platforms

TODO: Add deployment guides for:

- [ ] Railway
- [ ] Render
- [ ] Fly.io
- [ ] Docker deployment

## Security

This application implements multiple security measures:

- ✅ URL protocol validation (prevents open redirect attacks)
- ✅ User authentication and authorization
- ✅ Link ownership verification
- ✅ Rate limiting on all operations
- ✅ Input validation with Zod schemas
- ✅ TypeScript strict mode

For detailed security documentation, see [docs/SECURITY.md](docs/SECURITY.md).

## Contributing

### Branching Strategy

- `main` - Production-ready code
- `develop` - Development branch
- `feature/*` - Feature branches
- `bugfix/*` - Bug fix branches

### Pull Request Process

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes following the code style guidelines
4. Commit with descriptive messages
5. Push to your fork and submit a PR to `develop`

### Code Style

- Follow the existing TypeScript/React patterns
- Use shadcn/ui components exclusively (no custom UI components)
- Read `.github/instructions/*.md` files before implementing features
- Run `npm run lint` before committing
- Ensure TypeScript strict mode compliance

### Important Guidelines

Before implementing features, **always read** the relevant documentation:

- [Authentication Standards](.github/instructions/authentication-standards.instructions.md)
- [Server Actions Standards](.github/instructions/server-actions.instructions.md)
- [UI Components Standards](.github/instructions/ui-components.instructions.md)
- [Data Fetching](.github/instructions/data-fetching.instructions.md)

## Troubleshooting

### Port Already in Use

```bash
# Error: Port 3000 is already in use
# Solution: Kill the process or use a different port
lsof -ti:3000 | xargs kill -9  # macOS/Linux
npx kill-port 3000             # Windows/Cross-platform
```

### Database Connection Issues

```bash
# Error: Connection refused
# Solution: Check DATABASE_URL format and network access
# Ensure your database allows connections from your IP
```

### Environment Variables Not Loading

```bash
# Solution: Ensure .env.local exists and is not in .gitignore
# Restart the dev server after changing environment variables
```

### Clerk Authentication Errors

```bash
# Error: Clerk publishable key not found
# Solution: Verify NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is set correctly
# Check that the key starts with pk_test_ or pk_live_
```

## License

TODO: Add license file (MIT recommended)

---

## TODO

- [ ] Add click analytics and charts to dashboard
- [ ] Implement link expiration dates
- [ ] Add QR code generation for links
- [ ] Set up automated testing (Jest/Vitest + Playwright)
- [ ] Add link preview/metadata fetching
- [ ] Implement bulk link operations
- [ ] Add API documentation for programmatic access
- [ ] Create Docker deployment configuration
- [ ] Add comprehensive E2E tests
- [ ] Implement link categories/tags
- [ ] Add export functionality (CSV/JSON)

---

**Built with ❤️ using Next.js 16 and TypeScript**
