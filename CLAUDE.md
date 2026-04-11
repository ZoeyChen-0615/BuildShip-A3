# Tourism Gallery

A full-stack travel bucket list app built with Next.js + Tailwind CSS.

## What it does

Users search for or browse countries using the REST Countries API. Results display in a visual gallery with flags, capitals, population, languages, and currencies. Authenticated users can save countries to their travel bucket list (stored in Supabase).

## Tech Stack

- **Framework:** Next.js (App Router) + TypeScript
- **Styling:** Tailwind CSS
- **Auth:** Clerk (sign up, sign in, sign out)
- **Database:** Supabase (PostgreSQL)
- **External API:** REST Countries API v3.1 (no key needed)

## Data Model

### `favorites` table (Supabase)

| Column       | Type        | Description                    |
|-------------|-------------|--------------------------------|
| id          | uuid (PK)   | Auto-generated                 |
| user_id     | text         | Clerk user ID                  |
| place_id    | text         | Country code (cca3)            |
| name        | text         | Country name                   |
| image_url   | text         | Flag SVG URL                   |
| rating      | numeric      | (unused, reserved)             |
| review_count| integer      | (unused, reserved)             |
| location    | text         | Capital, Region                |
| categories  | text         | Subregion                      |
| price       | text         | Population (formatted)         |
| url         | text         | Google Maps URL                |
| created_at  | timestamptz  | When user saved it             |

## Style Preferences

- Clean, modern UI with generous whitespace
- Responsive grid layout for country cards
- Warm color palette (amber/orange tones for tourism theme)
- Bold typography for headings

@AGENTS.md
