#!/usr/bin/env node

/**
 * AI-Powered General Category Re-ranking
 *
 * Uses Claude to generate correct product rankings per category based on
 * global market share and adoption (no industry filter).
 * Stores results in industry_product_relevance with industry_slug = 'general'.
 *
 * Usage:
 *   node scripts/rerank-general-products.mjs --dry-run --category crm
 *   node scripts/rerank-general-products.mjs --write --category crm
 *   node scripts/rerank-general-products.mjs --write --all
 */

import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── CLI Args ───────────────────────────────────────────────────────────────

const DRY_RUN = process.argv.includes('--dry-run');
const WRITE = process.argv.includes('--write');
const ALL = process.argv.includes('--all');
const categoryArg = process.argv.find((_, i, arr) => arr[i - 1] === '--category');

if (!DRY_RUN && !WRITE) {
  console.log('Usage: node scripts/rerank-general-products.mjs [--dry-run | --write] [--category <slug> | --all]');
  console.log('  --dry-run              Show JSON output without writing');
  console.log('  --write                Write rankings to DB');
  console.log('  --category <slug>      Process single category (e.g. crm)');
  console.log('  --all                  Process all categories with 3+ products');
  process.exit(0);
}

if (!ALL && !categoryArg) {
  console.error('Error: specify --category <slug> or --all');
  process.exit(1);
}

// ─── Environment ────────────────────────────────────────────────────────────

function readEnv(filePath) {
  const content = readFileSync(filePath, 'utf8');
  const env = {};
  for (const line of content.split('\n')) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      let val = match[2].trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      env[match[1].trim()] = val;
    }
  }
  return env;
}

const saasEnv = readEnv(resolve(__dirname, '../.env.local'));
const reapEnv = readEnv(resolve(__dirname, '../../ReapLabs/.env.local'));

const SUPABASE_URL = reapEnv.SUPABASE_URL || saasEnv.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = reapEnv.SUPABASE_SERVICE_ROLE_KEY || saasEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const ANTHROPIC_API_KEY = reapEnv.ANTHROPIC_API_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}
if (!ANTHROPIC_API_KEY) {
  console.error('Missing ANTHROPIC_API_KEY in ReapLabs/.env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

const GENERAL_SLUG = 'general';

// ─── Fetch all categories with 3+ products ──────────────────────────────────

async function fetchCategories() {
  // Get all active products grouped by category
  let all = [];
  let page = 0;
  const pageSize = 1000;
  while (true) {
    const { data, error } = await supabase
      .from('reaper_products')
      .select('normalized_category')
      .eq('is_active', true)
      .range(page * pageSize, (page + 1) * pageSize - 1);
    if (error || !data || data.length === 0) break;
    all.push(...data);
    if (data.length < pageSize) break;
    page++;
  }

  // Count per category
  const counts = {};
  for (const row of all) {
    if (row.normalized_category) {
      counts[row.normalized_category] = (counts[row.normalized_category] || 0) + 1;
    }
  }

  // Filter to 3+ products, sort by name
  return Object.entries(counts)
    .filter(([, count]) => count >= 3)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

// ─── Fetch products by category ─────────────────────────────────────────────

async function fetchProductsByCategory(category) {
  let all = [];
  let page = 0;
  const pageSize = 1000;
  while (true) {
    const { data, error } = await supabase
      .from('reaper_products')
      .select('id, name, normalized_category, slug, tagline')
      .eq('normalized_category', category)
      .eq('is_active', true)
      .range(page * pageSize, (page + 1) * pageSize - 1);
    if (error) { console.error(`  Error fetching ${category}:`, error.message); break; }
    if (!data || data.length === 0) break;
    all.push(...data);
    if (data.length < pageSize) break;
    page++;
  }
  return all;
}

// ─── Claude API call ────────────────────────────────────────────────────────

async function rankProducts(category, existingProducts) {
  const productList = existingProducts.map(p => p.name).join('\n- ');

  const prompt = `You are a SaaS industry analyst with deep knowledge of software markets. Rank the top products in the "${category}" software category by GLOBAL market share and adoption.

Existing products in our database for "${category}":
- ${productList || '(none)'}

Return a JSON array of 10-15 products ranked by actual global market share and real-world adoption. #1 should be the most widely used product in this category worldwide.

For each product, provide:
- name: exact product name (match existing DB names where possible)
- market_position: "leader" | "challenger" | "niche"
- exists_in_db: true if the product name matches one in the list above, false if it needs to be added
- tagline: short 1-sentence product description (only needed if exists_in_db is false)

Ranking rules:
- Leaders = top 3-5 by global market share. These are the products most businesses actually use.
- Challengers = next 5 products. Strong but less dominant.
- Niche = specialized or smaller players with meaningful adoption.
- Rank by ACTUAL usage and market share, not by feature set or review scores.
- Example: For CRM, Salesforce should be #1, HubSpot #2, etc.

Return ONLY valid JSON — no markdown, no explanation. Just the array.`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text.trim();

  let json = text;
  if (json.startsWith('```')) {
    json = json.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }

  return JSON.parse(json);
}

// ─── Slug helper ────────────────────────────────────────────────────────────

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const mode = DRY_RUN ? 'DRY RUN' : 'WRITE';
  console.log(`\nMode: ${mode}\n`);

  // Get categories to process
  let categories;
  if (ALL) {
    categories = await fetchCategories();
  } else {
    // Find the category by matching slug-ified name or exact name
    const allCats = await fetchCategories();
    categories = allCats.filter(c =>
      slugify(c.name) === categoryArg.toLowerCase() ||
      c.name.toLowerCase() === categoryArg.toLowerCase()
    );
    if (categories.length === 0) {
      // Try partial match
      categories = allCats.filter(c =>
        slugify(c.name).includes(categoryArg.toLowerCase()) ||
        c.name.toLowerCase().includes(categoryArg.toLowerCase())
      );
    }
  }

  if (categories.length === 0) {
    console.error(`No categories found matching "${categoryArg}".`);
    process.exit(1);
  }

  console.log(`Processing ${categories.length} categor${categories.length === 1 ? 'y' : 'ies'}:\n`);
  for (const cat of categories) {
    console.log(`  ${cat.name} (${cat.count} products)`);
  }
  console.log('');

  // Phase 1: Wipe existing general rankings for targeted categories
  if (WRITE) {
    // Delete all general rankings — we'll re-insert
    console.log(`Deleting existing 'general' rankings...`);
    const { error } = await supabase
      .from('industry_product_relevance')
      .delete()
      .eq('industry_slug', GENERAL_SLUG);
    if (error) {
      console.error(`  Error deleting general rankings:`, error.message);
    }
    console.log('');
  }

  const allNewRows = [];
  const allNewProducts = [];
  let totalRanked = 0;
  let totalNew = 0;
  let totalLeaders = 0;
  let totalChallengers = 0;
  let totalNiche = 0;

  // Phase 2: For each category, get AI rankings
  for (const cat of categories) {
    process.stdout.write(`  ${cat.name}... `);

    const existingProducts = await fetchProductsByCategory(cat.name);

    let ranked;
    try {
      ranked = await rankProducts(cat.name, existingProducts);
    } catch (err) {
      console.log(`ERROR: ${err.message}`);
      continue;
    }

    if (!Array.isArray(ranked)) {
      console.log('ERROR: Claude did not return an array');
      continue;
    }

    console.log(`${ranked.length} products ranked`);

    // Build name->product lookup
    const existingByName = new Map();
    for (const p of existingProducts) {
      existingByName.set(p.name.toLowerCase(), p);
    }

    for (let i = 0; i < ranked.length; i++) {
      const item = ranked[i];
      const rank = i + 1;
      const nameLower = item.name.toLowerCase();

      let productId;
      const matchedProduct = existingByName.get(nameLower);

      if (matchedProduct) {
        productId = matchedProduct.id;
      } else {
        const newProduct = {
          name: item.name,
          slug: slugify(item.name),
          tagline: item.tagline || `${item.name} - ${cat.name} solution`,
          normalized_category: cat.name,
          source: 'ai-rerank',
          quality_score: 0.1,
          is_active: true,
        };
        allNewProducts.push(newProduct);
        totalNew++;
        productId = null;
      }

      const position = item.market_position || (rank <= 3 ? 'leader' : rank <= 8 ? 'challenger' : 'niche');

      allNewRows.push({
        _product_name: item.name,
        _product_slug: slugify(item.name),
        _category: cat.name,
        _needs_insert: !matchedProduct,
        product_id: productId,
        industry_slug: GENERAL_SLUG,
        business_type_slugs: [],
        relevance_rank: rank,
        market_position: position,
        industry_specific: false,
        notes: null,
      });

      totalRanked++;
      if (position === 'leader') totalLeaders++;
      else if (position === 'challenger') totalChallengers++;
      else totalNiche++;
    }

    // Rate limit
    await new Promise(r => setTimeout(r, 500));
  }

  // ─── Report ─────────────────────────────────────────────────────────────────

  console.log('\n─── Summary ───────────────────────────────────────────────');
  console.log(`Categories processed: ${categories.length}`);
  console.log(`Total products ranked: ${totalRanked}`);
  console.log(`New products to add:   ${totalNew}`);
  console.log(`Leaders: ${totalLeaders}  Challengers: ${totalChallengers}  Niche: ${totalNiche}`);

  if (DRY_RUN) {
    console.log('\n─── Rankings ──────────────────────────────────────────────');
    const byCategory = {};
    for (const r of allNewRows) {
      if (!byCategory[r._category]) byCategory[r._category] = [];
      byCategory[r._category].push(r);
    }
    for (const [cat, rows] of Object.entries(byCategory)) {
      console.log(`\n  ${cat}:`);
      for (const r of rows.slice(0, 5)) {
        const newTag = r._needs_insert ? ' [NEW]' : '';
        console.log(`    ${String(r.relevance_rank).padStart(2)}. ${r._product_name} (${r.market_position})${newTag}`);
      }
      if (rows.length > 5) console.log(`    ... and ${rows.length - 5} more`);
    }

    console.log('\n✓ Dry run complete. Use --write to insert rows.');
    return;
  }

  // ─── Phase 3: Insert missing products ───────────────────────────────────────

  if (allNewProducts.length > 0) {
    console.log(`\nInserting ${allNewProducts.length} new products...`);

    // Deduplicate by slug
    const uniqueProducts = new Map();
    for (const p of allNewProducts) {
      if (!uniqueProducts.has(p.slug)) {
        uniqueProducts.set(p.slug, p);
      }
    }
    const deduped = Array.from(uniqueProducts.values());

    const batchSize = 50;
    const insertedProducts = new Map();

    for (let i = 0; i < deduped.length; i += batchSize) {
      const batch = deduped.slice(i, i + batchSize);

      const slugs = batch.map(p => p.slug);
      const { data: existing } = await supabase
        .from('reaper_products')
        .select('id, slug, name')
        .in('slug', slugs);

      if (existing) {
        for (const e of existing) {
          insertedProducts.set(e.slug, e.id);
        }
      }

      const toInsert = batch.filter(p => !insertedProducts.has(p.slug));
      if (toInsert.length > 0) {
        const { data, error } = await supabase
          .from('reaper_products')
          .insert(toInsert)
          .select('id, slug');

        if (error) {
          console.error(`  Error inserting products batch:`, error.message);
        } else if (data) {
          for (const d of data) {
            insertedProducts.set(d.slug, d.id);
          }
        }
      }
    }

    console.log(`  ✓ ${insertedProducts.size} products in DB`);

    // Resolve product IDs for new rows
    for (const row of allNewRows) {
      if (!row.product_id && row._needs_insert) {
        row.product_id = insertedProducts.get(row._product_slug) || null;
      }
    }
  }

  // ─── Phase 4: Insert relevance rows ─────────────────────────────────────────

  const validRows = allNewRows.filter(r => r.product_id);
  const invalidCount = allNewRows.length - validRows.length;
  if (invalidCount > 0) {
    console.log(`\n⚠ Skipping ${invalidCount} rows with unresolved product IDs`);
  }

  // Deduplicate: keep best rank per product (same product may appear if AI returns dupes)
  const dedupedRows = new Map();
  for (const row of validRows) {
    const key = `${row.product_id}:${row.industry_slug}`;
    const existing = dedupedRows.get(key);
    if (!existing || row.relevance_rank < existing.relevance_rank) {
      dedupedRows.set(key, row);
    }
  }

  const finalRows = Array.from(dedupedRows.values()).map(r => ({
    product_id: r.product_id,
    industry_slug: r.industry_slug,
    business_type_slugs: r.business_type_slugs,
    relevance_rank: r.relevance_rank,
    market_position: r.market_position,
    industry_specific: r.industry_specific,
    notes: r.notes,
  }));

  console.log(`\nInserting ${finalRows.length} relevance rows...`);
  const batchSize = 200;
  let inserted = 0;
  for (let i = 0; i < finalRows.length; i += batchSize) {
    const batch = finalRows.slice(i, i + batchSize);
    const { error } = await supabase
      .from('industry_product_relevance')
      .upsert(batch, { onConflict: 'product_id,industry_slug' });

    if (error) {
      console.error(`  Error inserting relevance batch at offset ${i}:`, error.message);
    } else {
      inserted += batch.length;
    }
  }

  console.log(`✓ Inserted ${inserted} relevance rows into industry_product_relevance.`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
