#!/usr/bin/env node

/**
 * AI-Powered Industry Relevance Re-ranking
 *
 * Uses Claude to generate correct product rankings per industry x category,
 * then seeds them to Supabase's industry_product_relevance table.
 *
 * Usage:
 *   node scripts/rerank-industry-products.mjs --dry-run --industry healthcare
 *   node scripts/rerank-industry-products.mjs --write --industry healthcare
 *   node scripts/rerank-industry-products.mjs --write --all
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
const industryArg = process.argv.find((_, i, arr) => arr[i - 1] === '--industry');

if (!DRY_RUN && !WRITE) {
  console.log('Usage: node scripts/rerank-industry-products.mjs [--dry-run | --write] [--industry <slug> | --all]');
  console.log('  --dry-run              Show JSON output without writing');
  console.log('  --write                Write rankings to DB');
  console.log('  --industry <slug>      Process single industry (e.g. healthcare)');
  console.log('  --all                  Process all industries');
  process.exit(0);
}

if (!ALL && !industryArg) {
  console.error('Error: specify --industry <slug> or --all');
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
      // Strip surrounding quotes
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

// ─── Industry Mappings (from lib/industries.ts) ─────────────────────────────

const INDUSTRY_MAPPINGS = [
  { slug: 'healthcare', name: 'Healthcare', businessTypes: ['dental-office','plastic-surgery-clinic','physical-therapy','veterinary','optometry','mental-health','hospital-health-system','urgent-care-clinic'], categoryMappings: [
    { category: 'CRM', businessTypes: [] },
    { category: 'Scheduling & Booking', businessTypes: [] },
    { category: 'Accounting Software', businessTypes: [] },
    { category: 'Payment Processing', businessTypes: [] },
    { category: 'Cybersecurity', businessTypes: [] },
    { category: 'Healthcare IT', businessTypes: ['dental-office','plastic-surgery-clinic','physical-therapy','veterinary','optometry','mental-health','hospital-health-system','urgent-care-clinic'] },
    { category: 'Marketing Automation', businessTypes: ['plastic-surgery-clinic','dental-office','veterinary'] },
    { category: 'Website Builder', businessTypes: ['plastic-surgery-clinic','dental-office','physical-therapy','veterinary'] },
    { category: 'Email Marketing', businessTypes: ['dental-office','veterinary','plastic-surgery-clinic','physical-therapy'] },
    { category: 'Customer Support', businessTypes: ['dental-office','plastic-surgery-clinic'] },
  ]},
  { slug: 'financial-services', name: 'Financial Services', businessTypes: ['financial-advisor','accounting-firm','insurance-agency','mortgage-broker'], categoryMappings: [
    { category: 'CRM', businessTypes: [] },
    { category: 'Accounting Software', businessTypes: [] },
    { category: 'Cybersecurity', businessTypes: [] },
    { category: 'Document Management', businessTypes: [] },
    { category: 'Financial Management', businessTypes: ['financial-advisor','accounting-firm'] },
    { category: 'Marketing Automation', businessTypes: ['insurance-agency','mortgage-broker','financial-advisor'] },
    { category: 'Email Marketing', businessTypes: ['financial-advisor','insurance-agency'] },
    { category: 'Website Builder', businessTypes: ['financial-advisor','mortgage-broker'] },
    { category: 'Business Intelligence', businessTypes: ['financial-advisor','accounting-firm'] },
    { category: 'Expense Management', businessTypes: ['accounting-firm'] },
    { category: 'Scheduling & Booking', businessTypes: ['financial-advisor','mortgage-broker'] },
    { category: 'Invoicing & Billing', businessTypes: ['accounting-firm'] },
  ]},
  { slug: 'legal', name: 'Legal', businessTypes: ['law-firm','solo-attorney','legal-services'], categoryMappings: [
    { category: 'Legal Tech', businessTypes: [] },
    { category: 'Legal Practice Management', businessTypes: [] },
    { category: 'CRM', businessTypes: [] },
    { category: 'Document Management', businessTypes: [] },
    { category: 'Accounting Software', businessTypes: [] },
    { category: 'Time Tracking & Productivity', businessTypes: ['law-firm','solo-attorney'] },
    { category: 'Website Builder', businessTypes: ['solo-attorney','law-firm'] },
    { category: 'Cybersecurity', businessTypes: ['law-firm','legal-services'] },
    { category: 'Scheduling & Booking', businessTypes: ['solo-attorney','law-firm'] },
    { category: 'Email Marketing', businessTypes: ['law-firm'] },
    { category: 'Project Management', businessTypes: ['legal-services'] },
  ]},
  { slug: 'real-estate', name: 'Real Estate', businessTypes: ['real-estate-agent','brokerage','property-manager','real-estate-investor'], categoryMappings: [
    { category: 'CRM', businessTypes: [] },
    { category: 'Accounting Software', businessTypes: [] },
    { category: 'Document Management', businessTypes: [] },
    { category: 'Marketing Automation', businessTypes: ['real-estate-agent','brokerage'] },
    { category: 'Website Builder', businessTypes: ['real-estate-agent','brokerage'] },
    { category: 'Email Marketing', businessTypes: ['real-estate-agent','brokerage'] },
    { category: 'Social Media Management', businessTypes: ['real-estate-agent','brokerage'] },
    { category: 'Property Management', businessTypes: ['property-manager','real-estate-investor'] },
    { category: 'Scheduling & Booking', businessTypes: ['real-estate-agent','brokerage'] },
    { category: 'Financial Management', businessTypes: ['real-estate-investor'] },
  ]},
  { slug: 'restaurant-hospitality', name: 'Restaurant & Hospitality', businessTypes: ['restaurant','coffee-shop','bar-nightlife','catering','hotel'], categoryMappings: [
    { category: 'Point of Sale', businessTypes: [] },
    { category: 'Accounting Software', businessTypes: [] },
    { category: 'Payment Processing', businessTypes: [] },
    { category: 'Inventory Management', businessTypes: ['restaurant','bar-nightlife','catering'] },
    { category: 'Scheduling & Booking', businessTypes: ['restaurant','hotel','catering'] },
    { category: 'Social Media Management', businessTypes: ['restaurant','coffee-shop','bar-nightlife'] },
    { category: 'Email Marketing', businessTypes: ['restaurant','bar-nightlife','hotel'] },
    { category: 'Website Builder', businessTypes: ['restaurant','coffee-shop','catering','hotel'] },
    { category: 'HR & Payroll', businessTypes: ['restaurant','hotel','bar-nightlife'] },
    { category: 'Event Management', businessTypes: ['catering','restaurant','hotel'] },
    { category: 'Property Management', businessTypes: ['hotel'] },
    { category: 'CRM', businessTypes: ['catering','hotel'] },
  ]},
  { slug: 'retail-ecommerce', name: 'Retail & E-commerce', businessTypes: ['online-store','brick-and-mortar','omnichannel-retailer','subscription-box'], categoryMappings: [
    { category: 'Inventory Management', businessTypes: [] },
    { category: 'Payment Processing', businessTypes: [] },
    { category: 'CRM', businessTypes: [] },
    { category: 'Accounting Software', businessTypes: [] },
    { category: 'E-commerce', businessTypes: ['online-store','omnichannel-retailer','subscription-box'] },
    { category: 'Marketing Automation', businessTypes: ['online-store','omnichannel-retailer','subscription-box','brick-and-mortar'] },
    { category: 'Email Marketing', businessTypes: ['subscription-box','online-store','omnichannel-retailer'] },
    { category: 'Social Media Management', businessTypes: ['subscription-box','online-store','omnichannel-retailer'] },
    { category: 'SEO', businessTypes: ['online-store','omnichannel-retailer'] },
    { category: 'Customer Support', businessTypes: ['online-store','subscription-box','omnichannel-retailer'] },
    { category: 'Point of Sale', businessTypes: ['brick-and-mortar','omnichannel-retailer'] },
    { category: 'Logistics & Shipping', businessTypes: ['online-store','omnichannel-retailer','subscription-box'] },
  ]},
  { slug: 'professional-services', name: 'Professional Services', businessTypes: ['marketing-agency','consulting-firm','freelancer','it-services'], categoryMappings: [
    { category: 'Project Management', businessTypes: [] },
    { category: 'CRM', businessTypes: [] },
    { category: 'Time Tracking & Productivity', businessTypes: [] },
    { category: 'Accounting Software', businessTypes: [] },
    { category: 'Team Collaboration', businessTypes: ['marketing-agency','consulting-firm','it-services'] },
    { category: 'Invoicing & Billing', businessTypes: ['freelancer','consulting-firm'] },
    { category: 'Marketing Automation', businessTypes: ['marketing-agency','consulting-firm'] },
    { category: 'Website Builder', businessTypes: ['freelancer','marketing-agency','consulting-firm'] },
    { category: 'Social Media Management', businessTypes: ['marketing-agency'] },
    { category: 'Design & Prototyping', businessTypes: ['marketing-agency'] },
    { category: 'IT Service Management', businessTypes: ['it-services'] },
    { category: 'Cybersecurity', businessTypes: ['it-services'] },
    { category: 'Scheduling & Booking', businessTypes: ['freelancer','consulting-firm'] },
  ]},
  { slug: 'construction-trades', name: 'Construction & Trades', businessTypes: ['general-contractor','remodeler','specialty-trade','commercial-builder'], categoryMappings: [
    { category: 'Project Management', businessTypes: [] },
    { category: 'Accounting Software', businessTypes: [] },
    { category: 'CRM', businessTypes: [] },
    { category: 'Invoicing & Billing', businessTypes: [] },
    { category: 'Construction Management', businessTypes: ['general-contractor','commercial-builder'] },
    { category: 'Field Service Management', businessTypes: ['specialty-trade'] },
    { category: 'Scheduling & Booking', businessTypes: ['specialty-trade','remodeler','general-contractor','commercial-builder'] },
    { category: 'Time Tracking & Productivity', businessTypes: ['commercial-builder','general-contractor','specialty-trade'] },
    { category: 'Website Builder', businessTypes: ['remodeler','specialty-trade','general-contractor'] },
    { category: 'HR & Payroll', businessTypes: ['commercial-builder'] },
  ]},
  { slug: 'education', name: 'Education', businessTypes: ['online-course-creator','tutoring-service','private-school','training-company'], categoryMappings: [
    { category: 'Learning Management System', businessTypes: [] },
    { category: 'CRM', businessTypes: [] },
    { category: 'Payment Processing', businessTypes: [] },
    { category: 'Accounting Software', businessTypes: [] },
    { category: 'Scheduling & Booking', businessTypes: ['tutoring-service'] },
    { category: 'E-commerce', businessTypes: ['online-course-creator'] },
    { category: 'Website Builder', businessTypes: ['online-course-creator','tutoring-service','private-school','training-company'] },
    { category: 'Email Marketing', businessTypes: ['online-course-creator','private-school','training-company'] },
    { category: 'Marketing Automation', businessTypes: ['online-course-creator','training-company'] },
    { category: 'Social Media Management', businessTypes: ['online-course-creator','tutoring-service'] },
    { category: 'Project Management', businessTypes: ['training-company'] },
  ]},
  { slug: 'fitness-wellness', name: 'Fitness & Wellness', businessTypes: ['gym','personal-trainer','yoga-pilates-studio','spa-salon'], categoryMappings: [
    { category: 'Scheduling & Booking', businessTypes: [] },
    { category: 'CRM', businessTypes: [] },
    { category: 'Payment Processing', businessTypes: [] },
    { category: 'Marketing Automation', businessTypes: ['gym','yoga-pilates-studio'] },
    { category: 'Email Marketing', businessTypes: ['gym','yoga-pilates-studio','spa-salon'] },
    { category: 'Website Builder', businessTypes: ['personal-trainer','gym','yoga-pilates-studio','spa-salon'] },
    { category: 'Social Media Management', businessTypes: ['personal-trainer','gym','yoga-pilates-studio'] },
    { category: 'Accounting Software', businessTypes: ['gym','yoga-pilates-studio','spa-salon'] },
    { category: 'Point of Sale', businessTypes: ['gym','yoga-pilates-studio','spa-salon'] },
    { category: 'Invoicing & Billing', businessTypes: ['personal-trainer'] },
    { category: 'Inventory Management', businessTypes: ['spa-salon'] },
  ]},
  { slug: 'home-services', name: 'Home Services', businessTypes: ['cleaning-service','landscaping','pest-control','handyman'], categoryMappings: [
    { category: 'Field Service Management', businessTypes: [] },
    { category: 'CRM', businessTypes: [] },
    { category: 'Scheduling & Booking', businessTypes: [] },
    { category: 'Accounting Software', businessTypes: [] },
    { category: 'Payment Processing', businessTypes: ['handyman','cleaning-service','landscaping','pest-control'] },
    { category: 'Marketing Automation', businessTypes: ['pest-control','landscaping','cleaning-service'] },
    { category: 'Email Marketing', businessTypes: ['landscaping','pest-control'] },
    { category: 'Website Builder', businessTypes: ['cleaning-service','pest-control','landscaping','handyman'] },
    { category: 'SEO', businessTypes: ['cleaning-service','pest-control','landscaping','handyman'] },
    { category: 'Invoicing & Billing', businessTypes: ['handyman','landscaping'] },
    { category: 'HR & Payroll', businessTypes: ['cleaning-service'] },
  ]},
  { slug: 'technology-saas', name: 'Technology & SaaS', businessTypes: ['saas-startup','enterprise-software','software-agency','mobile-app'], categoryMappings: [
    { category: 'Project Management', businessTypes: [] },
    { category: 'Team Collaboration', businessTypes: [] },
    { category: 'CRM', businessTypes: [] },
    { category: 'DevOps', businessTypes: ['saas-startup','enterprise-software','mobile-app'] },
    { category: 'Analytics', businessTypes: ['saas-startup','enterprise-software','mobile-app'] },
    { category: 'Customer Support', businessTypes: ['saas-startup','enterprise-software'] },
    { category: 'Cybersecurity', businessTypes: ['saas-startup','enterprise-software'] },
    { category: 'Customer Success', businessTypes: ['saas-startup','enterprise-software'] },
    { category: 'Marketing Automation', businessTypes: ['saas-startup','software-agency'] },
    { category: 'Business Intelligence', businessTypes: ['saas-startup','enterprise-software'] },
    { category: 'Time Tracking & Productivity', businessTypes: ['software-agency'] },
    { category: 'Invoicing & Billing', businessTypes: ['software-agency'] },
    { category: 'Applicant Tracking System (ATS)', businessTypes: ['saas-startup','enterprise-software'] },
    { category: 'Knowledge Management', businessTypes: ['enterprise-software','software-agency'] },
  ]},
];

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

async function rankProducts(industryName, industrySlug, category, existingProducts, businessTypes) {
  const productList = existingProducts.map(p => p.name).join('\n- ');

  const prompt = `You are a SaaS industry analyst with deep knowledge of software markets. For the "${industryName}" industry, rank the top products in the "${category}" software category.

Existing products in our database for "${category}":
- ${productList || '(none)'}

Return a JSON array of 10-15 products ranked by actual market share and real-world adoption in the ${industryName} industry. This is critical — rank by how widely each product is actually used in ${industryName}, not generic popularity.

For each product, provide:
- name: exact product name (match existing DB names where possible)
- market_position: "leader" | "challenger" | "niche"
- industry_specific: true if the product was built specifically for ${industryName}
- business_type_slugs: array of applicable business types from: [${businessTypes.join(', ')}] (empty array [] if it applies to all)
- exists_in_db: true if the product name matches one in the list above, false if it needs to be added
- tagline: short 1-sentence product description (only needed if exists_in_db is false)

Ranking rules:
- Leaders = top 3-5 by market share in ${industryName}. These must be products that ${industryName} professionals actually use most.
- Challengers = next 5 products. Strong but less dominant.
- Niche = specialized or smaller players. Still relevant to ${industryName}.
- ${industryName}-specific products should rank ABOVE generic ones when they have meaningful adoption in the industry.
- Do NOT include products that are irrelevant to ${industryName} just because they're popular generically.

Return ONLY valid JSON — no markdown, no explanation. Just the array.`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text.trim();

  // Try to parse — handle potential markdown wrapping
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

  // Filter industries
  const industries = ALL
    ? INDUSTRY_MAPPINGS
    : INDUSTRY_MAPPINGS.filter(i => i.slug === industryArg);

  if (industries.length === 0) {
    console.error(`Industry "${industryArg}" not found. Available: ${INDUSTRY_MAPPINGS.map(i => i.slug).join(', ')}`);
    process.exit(1);
  }

  console.log(`Processing ${industries.length} industry(ies): ${industries.map(i => i.slug).join(', ')}\n`);

  // Phase 1: Wipe existing data for targeted industries
  if (WRITE) {
    for (const industry of industries) {
      console.log(`Deleting existing rows for ${industry.slug}...`);
      const { error } = await supabase
        .from('industry_product_relevance')
        .delete()
        .eq('industry_slug', industry.slug);
      if (error) {
        console.error(`  Error deleting ${industry.slug}:`, error.message);
      }
    }
    console.log('');
  }

  const allNewRows = [];
  const allNewProducts = [];
  const stats = {};

  // Phase 2-3: For each industry, for each category, get AI rankings
  for (const industry of industries) {
    console.log(`═══ ${industry.name} (${industry.slug}) ═══`);
    stats[industry.slug] = { categories: 0, products: 0, newProducts: 0, leaders: 0, challengers: 0, niche: 0 };

    // Deduplicate categories
    const seenCategories = new Map();
    for (const mapping of industry.categoryMappings) {
      const existing = seenCategories.get(mapping.category);
      if (existing) {
        existing.businessTypes = [...new Set([...existing.businessTypes, ...mapping.businessTypes])];
      } else {
        seenCategories.set(mapping.category, { ...mapping, businessTypes: [...mapping.businessTypes] });
      }
    }

    for (const [categoryName, mapping] of seenCategories) {
      process.stdout.write(`  ${categoryName}... `);

      // Fetch existing products in this category
      const existingProducts = await fetchProductsByCategory(categoryName);

      // Ask Claude for rankings
      let ranked;
      try {
        ranked = await rankProducts(
          industry.name,
          industry.slug,
          categoryName,
          existingProducts,
          industry.businessTypes
        );
      } catch (err) {
        console.log(`ERROR: ${err.message}`);
        continue;
      }

      if (!Array.isArray(ranked)) {
        console.log('ERROR: Claude did not return an array');
        continue;
      }

      console.log(`${ranked.length} products ranked`);
      stats[industry.slug].categories++;

      // Build name->product lookup from existing
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
        } else if (!item.exists_in_db || !matchedProduct) {
          // New product — needs to be inserted
          const newProduct = {
            name: item.name,
            slug: slugify(item.name),
            tagline: item.tagline || `${item.name} - ${categoryName} solution`,
            normalized_category: categoryName,
            source: 'ai-rerank',
            quality_score: 0.1,
            is_active: true,
          };
          allNewProducts.push(newProduct);
          stats[industry.slug].newProducts++;
          // productId will be resolved after insert
          productId = null;
        }

        allNewRows.push({
          _product_name: item.name,
          _product_slug: slugify(item.name),
          _category: categoryName,
          _needs_insert: !matchedProduct,
          product_id: productId,
          industry_slug: industry.slug,
          business_type_slugs: item.business_type_slugs || mapping.businessTypes || [],
          relevance_rank: rank,
          market_position: item.market_position || (rank <= 3 ? 'leader' : rank <= 8 ? 'challenger' : 'niche'),
          industry_specific: item.industry_specific || false,
          notes: null,
        });

        stats[industry.slug].products++;
        if (item.market_position === 'leader') stats[industry.slug].leaders++;
        else if (item.market_position === 'challenger') stats[industry.slug].challengers++;
        else stats[industry.slug].niche++;
      }

      // Rate limit: small delay between API calls
      await new Promise(r => setTimeout(r, 500));
    }
    console.log('');
  }

  // ─── Report ─────────────────────────────────────────────────────────────────

  console.log('─── Summary ───────────────────────────────────────────────');
  console.log(`${'Industry'.padEnd(25)} ${'Cats'.padStart(5)} ${'Prods'.padStart(6)} ${'New'.padStart(5)} ${'Lead'.padStart(5)} ${'Chal'.padStart(5)} ${'Niche'.padStart(6)}`);
  console.log('─'.repeat(65));
  let grandProducts = 0, grandNew = 0;
  for (const [slug, s] of Object.entries(stats)) {
    console.log(`${slug.padEnd(25)} ${String(s.categories).padStart(5)} ${String(s.products).padStart(6)} ${String(s.newProducts).padStart(5)} ${String(s.leaders).padStart(5)} ${String(s.challengers).padStart(5)} ${String(s.niche).padStart(6)}`);
    grandProducts += s.products;
    grandNew += s.newProducts;
  }
  console.log('─'.repeat(65));
  console.log(`${'TOTAL'.padEnd(25)} ${''.padStart(5)} ${String(grandProducts).padStart(6)} ${String(grandNew).padStart(5)}`);

  if (DRY_RUN) {
    // Show sample of what would be written
    console.log('\n─── Sample Rankings (first 3 per industry) ────────────────');
    for (const industry of industries) {
      console.log(`\n  ${industry.name}:`);
      const industryRows = allNewRows.filter(r => r.industry_slug === industry.slug);
      // Group by category
      const byCategory = {};
      for (const r of industryRows) {
        if (!byCategory[r._category]) byCategory[r._category] = [];
        byCategory[r._category].push(r);
      }
      for (const [cat, rows] of Object.entries(byCategory)) {
        console.log(`    ${cat}:`);
        for (const r of rows.slice(0, 5)) {
          const newTag = r._needs_insert ? ' [NEW]' : '';
          console.log(`      ${String(r.relevance_rank).padStart(2)}. ${r._product_name} (${r.market_position})${r.industry_specific ? ' [industry-specific]' : ''}${newTag}`);
        }
        if (rows.length > 5) console.log(`      ... and ${rows.length - 5} more`);
      }
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
    const insertedProducts = new Map(); // slug -> id

    for (let i = 0; i < deduped.length; i += batchSize) {
      const batch = deduped.slice(i, i + batchSize);

      // Check which slugs already exist (may have been added by another category)
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

  // Filter out rows with no product_id
  const validRows = allNewRows.filter(r => r.product_id);
  const invalidCount = allNewRows.length - validRows.length;
  if (invalidCount > 0) {
    console.log(`\n⚠ Skipping ${invalidCount} rows with unresolved product IDs`);
  }

  // Deduplicate: keep best rank per product+industry
  const deduped = new Map();
  for (const row of validRows) {
    const key = `${row.product_id}:${row.industry_slug}`;
    const existing = deduped.get(key);
    if (!existing || row.relevance_rank < existing.relevance_rank) {
      deduped.set(key, row);
    } else if (existing && row.business_type_slugs.length > 0) {
      existing.business_type_slugs = [...new Set([...existing.business_type_slugs, ...row.business_type_slugs])];
    }
  }

  const finalRows = Array.from(deduped.values()).map(r => ({
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
