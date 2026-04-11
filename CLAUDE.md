# Tourism Gallery

A full-stack tourism discovery app built with Next.js + Tailwind CSS.

## What it does

Users search for restaurants, attractions, hotels, and other businesses by city/location using the Yelp Fusion API. Results display in a visual gallery. Authenticated users can save favorites to their account (stored in Supabase).

## Tech Stack

- **Framework:** Next.js (App Router) + TypeScript
- **Styling:** Tailwind CSS
- **Auth:** Clerk (sign up, sign in, sign out)
- **Database:** Supabase (PostgreSQL)
- **External API:** Yelp Fusion API v3

## Data Model

### `favorites` table (Supabase)

| Column       | Type        | Description                    |
|-------------|-------------|--------------------------------|
| id          | uuid (PK)   | Auto-generated                 |
| user_id     | text         | Clerk user ID                  |
| yelp_id     | text         | Business ID from Yelp          |
| name        | text         | Business name                  |
| image_url   | text         | Photo URL                      |
| rating      | numeric      | Yelp rating (1-5)              |
| review_count| integer      | Number of reviews              |
| location    | text         | Display address                |
| categories  | text         | Comma-separated categories     |
| price       | text         | Price level ($, $$, etc.)      |
| url         | text         | Yelp business page URL         |
| created_at  | timestamptz  | When user saved it             |

## Style Preferences

- Clean, modern UI with generous whitespace
- Responsive grid layout for business cards
- Warm color palette (amber/orange tones for tourism theme)
- Bold typography for headings

@AGENTS.md
