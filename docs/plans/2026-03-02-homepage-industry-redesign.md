# SaaSipedia Homepage & Industry Pages Redesign

## Problem

The current homepage is an encyclopedia-style directory: search bar, stats, category grid, recent products. A random visitor has no way to understand what software is relevant to *their* business. The experience doesn't help someone who doesn't already know what they're looking for.

## Vision

SaaSipedia becomes a discovery layer. Visitors identify their industry and business type, see recommended software categories with context on why each matters, browse existing SaaS products per category, and discover the option to build custom through ReapLabs.

Search stays as the fast path for people who already know what they want. The industry path is the primary experience for everyone else.

## Design

### Homepage

**Hero (top)**
- "SaaSipedia" title
- Outcome-oriented subtitle: "Find the right software for your business"
- Search bar (unchanged behavior — searches products by name/tagline/category)
- No stats under the search bar

**Industry Grid (primary path)**
- Header: "What kind of business do you run?"
- 12 industry cards in responsive grid (3x4 desktop, 2x6 tablet, 1-col mobile)
- Each card: industry name, icon, "X business types" count
- Clicking navigates to `/industry/[slug]`

**Software Categories (secondary path)**
- Header: "Or browse by software category"
- Same category grid as today, repositioned below industries

**Stats + Newsletter (bottom)**
- Stats as social proof: "Covering X products across Y categories"
- Newsletter signup

### Industry Page (`/industry/[slug]`)

**Header**
- Breadcrumb: Home > Industries > [Industry]
- Title: "Software for [Industry] Businesses"
- Description explaining the page purpose

**Business Type Selector**
- Row of clickable pills: specific business types + "All [Industry]"
- "All [Industry]" selected by default (shows full category set)
- Selecting a business type filters/reorders categories by relevance
- Client-side filtering, no page navigation

**Recommended Software Categories**
- Grid of cards, each showing:
  - Category name
  - One-line "why it matters" context
  - Top 2-3 products from SaaSipedia (linked to wiki pages)
  - "Build your own" link to ReapLabs with pre-filled context
- Ordered by relevance (essential > recommended > nice-to-have)

**Bottom**
- Related industries links
- Newsletter signup

### ReapLabs Integration

- "Or build your own" link on each category card
- Links to `/reap/start?category=[slug]&industry=[slug]&business=[slug]`
- Positioned as a peer option alongside SaaS products, not a sales pitch

## Data Model

No new database tables. A single curated TypeScript file:

### `lib/industries.ts`

```typescript
interface BusinessType {
  name: string;
  slug: string;
  description: string;
}

interface CategoryMapping {
  category: string;           // matches existing software category from Supabase
  relevance: 'essential' | 'recommended' | 'nice-to-have';
  reason: string;             // one-liner: why this category matters
  businessTypes?: string[];   // if set, only show for these business type slugs
}

interface Industry {
  name: string;
  slug: string;
  icon: string;               // lucide icon name
  description: string;
  businessTypes: BusinessType[];
  categoryMappings: CategoryMapping[];
}
```

### Starter Industries (~12)

| Industry | Example Business Types |
|----------|----------------------|
| Healthcare | Dental office, plastic surgery clinic, physical therapy, veterinary |
| Financial Services | Wealth management, accounting firm, insurance agency, financial planning |
| Legal | Law firm, solo attorney, legal services |
| Real Estate | Brokerage, property management, commercial real estate |
| Restaurant & Hospitality | Restaurant, hotel, catering, event venue |
| Retail & E-Commerce | Online store, brick-and-mortar retail, wholesale |
| Professional Services | Consulting firm, marketing agency, staffing agency |
| Construction & Trades | General contractor, HVAC, plumbing, electrical |
| Education | Tutoring company, online course creator, training center |
| Fitness & Wellness | Gym, yoga studio, spa, personal training |
| Home Services | Cleaning, landscaping, pest control, moving |
| Technology & SaaS | Software startup, dev agency, MSP/IT services |

### Category Mapping Approach

Each industry gets 6-12 software categories mapped with relevance levels. Business-type-specific overrides narrow the recommendations further. Products are queried from existing Supabase data using category names.

## Pages & Routes

| Route | Type | Description |
|-------|------|-------------|
| `/` | Modified | Redesigned homepage |
| `/industry/[slug]` | New | Industry detail with business type filtering |

## Psychology Grounding

- **Jobs to Be Done**: Frame around "what does my business need?" not "browse our catalog"
- **Hick's Law**: 12 industries is manageable. Business type pills narrow further.
- **Commitment & Consistency**: Optional self-identification creates investment
- **IKEA Effect**: Selecting your business type = building your own recommendation
- **Activation Energy**: First click is just "which industry" — trivially easy
- **Paradox of Choice**: Curated categories per business type, not the full catalog

## What This Does NOT Include

- AI-generated industry mapping (future enhancement)
- Changes to product wiki pages
- Changes to search behavior
- New database tables or migrations
- Changes to the ReapLabs intake flow (just passes query params)
