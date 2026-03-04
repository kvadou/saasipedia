# SaaSipedia Industry Authority Plan
## Make SaaSipedia the best place to find industry-specific software

**Date:** 2026-03-03
**Status:** Draft

---

## Vision

When someone in healthcare searches "best CRM for dental offices," they land on SaaSipedia
and see a **ranked, curated list** of the most relevant products — not a generic dump of 59 CRMs.
They trust it because it's comprehensive, specific to their business type, and clearly organized.

At the bottom: "Can't find what you need? **Build your own** or **get consulting help**."

### Marketing Psychology at Play

- **Authority Bias**: Comprehensive, curated lists signal expertise
- **Paradox of Choice**: Ranked by relevance = less overwhelm, more trust
- **Jobs to Be Done**: Frame around "software for your dental office" not "CRM features"
- **Social Proof**: "Most used by dental offices" markers
- **Endowment Effect**: "Build your own" gives ownership feeling
- **Foot-in-the-Door**: Free directory → consult → paid engagement

---

## Phase 1: Category Normalization (Data Layer)

### Problem
542 unique categories for 1,000 products. Most have 1-2 items.
The `industries.ts` maps to ~40 clean category names, but the DB is chaotic.

### Solution
Add a `normalized_category` column to `reaper_products` that maps the 542 raw categories
down to ~50 clean categories matching the industry taxonomy.

### Category Mapping (Raw → Normalized)
```
"CRM" → "CRM"
"CRM Platform" → "CRM"
"CRM / Business Management Software" → "CRM"
"CRM/ERP" → "CRM"
"CRM and Project Management Software" → "CRM"
"ATS (Applicant Tracking System)" → "Applicant Tracking System (ATS)"
"ATS/Recruitment Software" → "Applicant Tracking System (ATS)"
"Accounting Software" → "Accounting Software"
"Accounting & Bookkeeping" → "Accounting Software"
"Accounting & Finance" → "Accounting Software"
... etc
```

### Implementation
1. Create mapping table or migration script
2. Add `normalized_category` to Supabase
3. Update `industries.ts` category references to match
4. Update all queries to use `normalized_category`

**Estimated effort:** 1 session

---

## Phase 2: Industry Relevance Data Model

### Problem
Products are sorted by `quality_score` which measures data completeness,
not industry relevance. A dental office doesn't care that Salesforce has the most features.

### Solution
Add an `industry_product_relevance` table to Supabase:

```sql
CREATE TABLE industry_product_relevance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES reaper_products(id),
  industry_slug TEXT NOT NULL,
  business_type_slugs TEXT[], -- which business types this is relevant to
  relevance_rank INTEGER, -- 1 = most relevant for this industry
  market_position TEXT CHECK (market_position IN ('leader', 'challenger', 'niche')),
  industry_specific BOOLEAN DEFAULT false, -- true = built for this industry
  notes TEXT, -- e.g., "Most popular among dental offices"
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(product_id, industry_slug)
);
```

### Data Population
Use the research from NotebookLM (12 notebooks, 739 sources) + our gap analysis
to populate this table. Products get ranked per industry.

**Estimated effort:** 1 session for schema, 2-3 sessions for data population

---

## Phase 3: Ranked List View Component

### Design: `/category/crm?industry=healthcare`

```
┌──────────────────────────────────────────────────────────────────┐
│ ← Back to Healthcare                                             │
│                                                                  │
│ CRM Software for Healthcare                                      │
│ 12 products ranked by industry relevance                         │
│                                                                  │
│ ┌────┬─────────────────┬──────────────┬──────────┬─────────────┐ │
│ │ #  │ Product         │ Best For     │ Position │ Features    │ │
│ ├────┼─────────────────┼──────────────┼──────────┼─────────────┤ │
│ │ 1  │ Salesforce HC   │ All          │ ★ Leader │ 142 features│ │
│ │    │ "Cloud CRM..."  │              │          │ From $300/mo│ │
│ ├────┼─────────────────┼──────────────┼──────────┼─────────────┤ │
│ │ 2  │ HubSpot         │ All          │ ★ Leader │ 98 features │ │
│ │    │ "All-in-one..." │              │          │ Free-$50/mo │ │
│ ├────┼─────────────────┼──────────────┼──────────┼─────────────┤ │
│ │ 3  │ DrChrono        │ Dental, PT   │ Niche    │ 45 features │ │
│ │    │ "Healthcare..." │              │          │ $199/mo     │ │
│ └────┴─────────────────┴──────────────┴──────────┴─────────────┘ │
│                                                                  │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ 🔨 Can't find what you need?                                │ │
│ │                                                              │ │
│ │ [Build Your Own CRM →]  [Get Expert Help →]                  │ │
│ │                                                              │ │
│ │ Average build time: 1-2 weeks with AI tools                  │ │
│ │ Or hire a consultant starting at $2,500                      │ │
│ └──────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

### Component: `ProductListView.tsx`
- Ranked table with row numbers
- Market position badges (Leader/Challenger/Niche)
- Business type tags
- Feature count + starting price
- Expandable rows for tagline/description
- Mobile-responsive (stacks on small screens)

### When to Use
- **List view**: When `?industry=` param is present (industry-filtered)
- **Card view**: When browsing categories without industry filter (existing behavior)

**Estimated effort:** 1 session

---

## Phase 4: Add ~195 Industry-Specific Products

### Strategy
For each product to add, we need:
- Name, slug, URL
- Category (normalized)
- Tagline, description
- Features (can be scraped later)
- Industry relevance mapping

### Priority Order
1. **Healthcare** (highest search volume, most differentiated products)
2. **Restaurant & Hospitality** (very distinct software ecosystem)
3. **Real Estate** (strong existing coverage, fill gaps)
4. **Legal** (very specific, high-value products)
5. **Financial Services** (complex but high value)
6. **Construction** (decent existing coverage)
7. **Education** → **Fitness** → **Home Services** → **Professional Services** → **Tech/SaaS**

### Approach
- Use the existing Shipyard API scraper to crawl product pages
- Populate basic product info + industry_product_relevance
- Run quality enrichment later

**Estimated effort:** 3-5 sessions (can be parallelized)

---

## Phase 5: Consulting & Build CTA Funnel

### On Category Pages (industry-filtered)
Bottom CTA section with two paths:

1. **"Build Your Own"** → Links to ReapLabs with pre-filled category + industry
2. **"Get Expert Help"** → Calendly/booking link for free 15-min consult

### Psychology
- **Anchoring**: Show SaaS prices first, then "or build for $X"
- **Loss Aversion**: "Stop paying $X/month — own your software"
- **Contrast Effect**: Monthly SaaS cost vs. one-time build cost

**Estimated effort:** 1 session

---

## Phase Summary

| Phase | What | Sessions | Dependencies |
|-------|------|----------|-------------|
| 1 | Category normalization | 1 | None |
| 2 | Industry relevance data model | 1 + 2-3 data | Phase 1 |
| 3 | Ranked list view component | 1 | Phase 2 |
| 4 | Add 195 products | 3-5 | Phase 1 |
| 5 | CTA funnel | 1 | Phase 3 |

**Total: ~8-11 sessions**

---

## NotebookLM Research Assets

12 notebooks with 739 total research sources available at https://notebooklm.google.com:

| Industry | Notebook ID | Sources |
|----------|------------|---------|
| Healthcare | 465fe889-d75d-454f-b5a1-7ee47014373f | 74 |
| Financial Services | f3a50f32-7fa2-42c6-947e-2918b218dec1 | 47 |
| Legal | 06aee271-be35-4d95-aa5b-9f1970dd0720 | 58 |
| Real Estate | 505aed58-2743-4797-82f2-6ff93568f95e | 75 |
| Restaurant & Hospitality | 21b0ac86-9540-4cdd-be2f-689899396f58 | 59 |
| Retail & E-Commerce | 729c3ce7-e93f-4dc5-ac43-0d76f2bee2a1 | 78 |
| Professional Services | 2e78406f-09c6-4dce-8190-2b2761af44f9 | 62 |
| Construction & Trades | 274c9f26-6292-49ea-a5b4-4ea805ffe657 | 61 |
| Education | 5422fcfb-336c-4650-8570-e6b7d9c216a8 | 50 |
| Fitness & Wellness | c8617760-2824-4692-abea-e71ef0dae4b4 | 60 |
| Home Services | cbfc6b3b-d681-4464-8dd8-6b78802dd70c | 46 |
| Technology & SaaS | ab873e12-3fe8-4949-bd50-07a8c5a60b42 | 69 |

Gap analysis document: `docs/industry-software-research.md`
