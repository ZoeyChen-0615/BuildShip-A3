# Tourism Gallery

A full-stack tourism discovery app built with Next.js + Tailwind CSS.

## What it does

Users type in a city name and discover famous landmarks, museums, restaurants, entertainment venues, and attractions via the OpenTripMap API. Results display in a visual gallery with images and descriptions. Authenticated users can save their favorite places to their account (stored in Supabase).

## Tech Stack

- **Framework:** Next.js (App Router) + TypeScript
- **Styling:** Tailwind CSS
- **Auth:** Clerk (sign up, sign in, sign out)
- **Database:** Supabase (PostgreSQL)
- **External API:** OpenTripMap API (free key)

## Data Model

### `favorites` table (Supabase)

| Column       | Type        | Description                    |
|-------------|-------------|--------------------------------|
| id          | uuid (PK)   | Auto-generated                 |
| user_id     | text         | Clerk user ID                  |
| place_id    | text         | OpenTripMap xid                |
| name        | text         | Place name                     |
| image_url   | text         | Preview image URL              |
| rating      | numeric      | (unused, reserved)             |
| review_count| integer      | (unused, reserved)             |
| location    | text         | City, State, Country           |
| categories  | text         | Place kinds (e.g. cultural)    |
| price       | text         | (unused, reserved)             |
| url         | text         | Wikipedia or OpenTripMap URL   |
| created_at  | timestamptz  | When user saved it             |

## Style Preferences

- Clean, modern UI with generous whitespace
- Responsive grid layout for place cards
- Warm color palette (amber/orange tones for tourism theme)
- Bold typography for headings

@AGENTS.md
