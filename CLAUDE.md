# Tourism Gallery

A full-stack tourism discovery app where users search any city to discover famous landmarks, museums, restaurants, and attractions. Authenticated users can save their favorite places to a personal list.

**Live URL:** https://build-ship-a3.vercel.app

## Tech Stack

- **Framework:** Next.js 16 (App Router) + TypeScript
- **Styling:** Tailwind CSS 4
- **Auth:** Clerk (`@clerk/nextjs` v7)
- **Database:** Supabase (PostgreSQL)
- **External API:** OpenTripMap API v0.1

## Requirements

- [x] Built with Next.js + Tailwind CSS
- [x] User authentication via Clerk (sign up, log in, sign out)
- [x] Data stored in Supabase, scoped to the logged-in user
- [x] Fetches data from an external API (OpenTripMap)
- [x] Users can search/browse API data and save items to their account
- [x] Users can view their saved items
- [x] Environment variables in `.env.local`, not hardcoded
- [x] Supabase MCP server configured
- [x] Multiple git commits showing iteration
- [x] Deployed to Vercel with environment variables set
- [x] Live URL works — classmates can create accounts and use it

## Project Structure

```
tourism-gallery/
├── CLAUDE.md                           # Project overview and build guide
├── .env.local                          # Environment variables (gitignored)
├── package.json
├── src/
│   ├── proxy.ts                        # Clerk middleware (protects /favorites)
│   ├── lib/
│   │   └── supabase.ts                 # Supabase server client (lazy init)
│   ├── components/
│   │   ├── Navbar.tsx                  # Top nav with auth state (Sign In/Up or UserButton)
│   │   ├── SearchBar.tsx               # City search input + category filter buttons
│   │   ├── BusinessCard.tsx            # PlaceCard component for search results
│   │   └── PlaceImage.tsx              # Image component with lazy loading + error fallback
│   └── app/
│       ├── layout.tsx                  # Root layout with ClerkProvider
│       ├── globals.css                 # Tailwind imports + theme variables
│       ├── page.tsx                    # Home page (search + community favorites)
│       ├── favorites/
│       │   └── page.tsx                # My Favorites page (protected by auth)
│       ├── sign-in/[[...sign-in]]/
│       │   └── page.tsx                # Clerk sign-in page
│       ├── sign-up/[[...sign-up]]/
│       │   └── page.tsx                # Clerk sign-up page
│       └── api/
│           ├── search/route.ts         # GET — geocode city + fetch places from OpenTripMap
│           ├── favorites/route.ts      # GET — user or community favorites; POST — save a place
│           ├── favorites/[id]/route.ts # DELETE — remove a saved place
│           └── image/route.ts          # GET — image proxy for Wikimedia (avoids rate limits)
```

## Data Flow

1. **Search:** User types a city → `/api/search` geocodes via OpenTripMap → fetches top-rated places within 10km → returns place details with images
2. **Save:** Signed-in user clicks "Save" → `POST /api/favorites` → inserts into Supabase `favorites` table with Clerk `user_id`
3. **View Favorites:** User visits `/favorites` → `GET /api/favorites` → returns rows where `user_id` matches Clerk auth
4. **Community View:** Home page (before searching) → `GET /api/favorites?mode=community` → returns all saved places from all users
5. **Remove:** User clicks "Remove" on a favorite → `DELETE /api/favorites/[id]` → deletes row scoped to their `user_id`

## Data Model

### `favorites` table (Supabase)

| Column       | Type        | Description                    |
|-------------|-------------|--------------------------------|
| id          | uuid (PK)   | Auto-generated                 |
| user_id     | text         | Clerk user ID                  |
| place_id    | text         | OpenTripMap xid                |
| name        | text         | Place name                     |
| image_url   | text         | Preview image URL              |
| rating      | numeric      | Reserved                       |
| review_count| integer      | Reserved                       |
| location    | text         | City, State, Country           |
| categories  | text         | Place kinds (e.g. cultural)    |
| price       | text         | Reserved                       |
| url         | text         | Wikipedia or OpenTripMap URL   |
| created_at  | timestamptz  | When user saved it             |

**Unique constraint:** `(user_id, place_id)` — prevents duplicate saves.

## Environment Variables

```
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# OpenTripMap
OPENTRIPMAP_API_KEY=
```

## Key Design Decisions

- **Server-side API calls:** The OpenTripMap API is called from `/api/search` (server route), not from the browser, to protect the API key.
- **Service role key:** Supabase is accessed via the service role key on the server side. Data is scoped per user by filtering on `user_id` in every query.
- **Clerk + Supabase connected:** Clerk is configured as a third-party auth provider in Supabase via the Clerk integration.
- **Image handling:** Wikimedia images use `Special:FilePath` URLs to avoid thumbnail rate limits. The `PlaceImage` component handles loading states and broken images gracefully.

@AGENTS.md
