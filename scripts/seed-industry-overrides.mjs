import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// ─── Config ──────────────────────────────────────────────────────────────────

const DRY_RUN = process.argv.includes('--dry-run');
const WRITE = process.argv.includes('--write');

if (!DRY_RUN && !WRITE) {
  console.log('Usage: node scripts/seed-industry-overrides.mjs [--dry-run | --write]');
  console.log('  --dry-run  Report what would be updated');
  console.log('  --write    Update rows in DB');
  process.exit(0);
}

// ─── Supabase Client ─────────────────────────────────────────────────────────

const envContent = readFileSync('.env.local', 'utf8');
const env = {};
for (const line of envContent.split('\n')) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// ─── Research-based overrides ────────────────────────────────────────────────
// Extracted from docs/industry-software-research.md — products with "Yes" or "Partial"
// Format: { productName, industrySlug, marketPosition, businessTypeSlugs, industrySpecific }

const OVERRIDES = [
  // Healthcare
  { productName: 'Keap', industrySlug: 'healthcare', marketPosition: 'challenger', businessTypeSlugs: [], industrySpecific: false },
  { productName: 'HubSpot', industrySlug: 'healthcare', marketPosition: 'leader', businessTypeSlugs: [], industrySpecific: false },
  { productName: 'Acuity Scheduling', industrySlug: 'healthcare', marketPosition: 'challenger', businessTypeSlugs: [], industrySpecific: false },
  { productName: 'Podium', industrySlug: 'healthcare', marketPosition: 'challenger', businessTypeSlugs: [], industrySpecific: false },
  { productName: 'Birdeye', industrySlug: 'healthcare', marketPosition: 'challenger', businessTypeSlugs: [], industrySpecific: false },

  // Financial Services
  { productName: 'HubSpot', industrySlug: 'financial-services', marketPosition: 'leader', businessTypeSlugs: [], industrySpecific: false },
  { productName: 'QuickBooks', industrySlug: 'financial-services', marketPosition: 'leader', businessTypeSlugs: [], industrySpecific: false },
  { productName: 'Xero', industrySlug: 'financial-services', marketPosition: 'leader', businessTypeSlugs: [], industrySpecific: false },

  // Real Estate
  { productName: 'Follow Up Boss', industrySlug: 'real-estate', marketPosition: 'leader', businessTypeSlugs: ['real-estate-agent', 'brokerage'], industrySpecific: true },
  { productName: 'Wise Agent', industrySlug: 'real-estate', marketPosition: 'challenger', businessTypeSlugs: ['real-estate-agent'], industrySpecific: true },
  { productName: 'CINC', industrySlug: 'real-estate', marketPosition: 'challenger', businessTypeSlugs: ['real-estate-agent', 'brokerage'], industrySpecific: true },
  { productName: 'Propertybase', industrySlug: 'real-estate', marketPosition: 'challenger', businessTypeSlugs: ['brokerage'], industrySpecific: true },
  { productName: 'IXACT Contact', industrySlug: 'real-estate', marketPosition: 'niche', businessTypeSlugs: ['real-estate-agent'], industrySpecific: true },

  // Professional Services
  { productName: 'HubSpot', industrySlug: 'professional-services', marketPosition: 'leader', businessTypeSlugs: [], industrySpecific: false },
  { productName: 'Salesforce', industrySlug: 'professional-services', marketPosition: 'leader', businessTypeSlugs: ['consulting-firm', 'it-services'], industrySpecific: false },
  { productName: 'HoneyBook', industrySlug: 'professional-services', marketPosition: 'challenger', businessTypeSlugs: ['freelancer'], industrySpecific: false },
  { productName: 'FreshBooks', industrySlug: 'professional-services', marketPosition: 'leader', businessTypeSlugs: ['freelancer'], industrySpecific: false },

  // Construction
  { productName: 'Procore', industrySlug: 'construction-trades', marketPosition: 'leader', businessTypeSlugs: ['general-contractor', 'commercial-builder'], industrySpecific: true },
  { productName: 'Buildertrend', industrySlug: 'construction-trades', marketPosition: 'leader', businessTypeSlugs: ['remodeler', 'general-contractor'], industrySpecific: true },
  { productName: 'CoConstruct', industrySlug: 'construction-trades', marketPosition: 'leader', businessTypeSlugs: ['remodeler'], industrySpecific: true },
  { productName: 'Fieldwire', industrySlug: 'construction-trades', marketPosition: 'challenger', businessTypeSlugs: [], industrySpecific: true },
  { productName: 'PlanSwift', industrySlug: 'construction-trades', marketPosition: 'leader', businessTypeSlugs: [], industrySpecific: true },
  { productName: 'STACK', industrySlug: 'construction-trades', marketPosition: 'challenger', businessTypeSlugs: [], industrySpecific: true },
  { productName: 'Bluebeam', industrySlug: 'construction-trades', marketPosition: 'leader', businessTypeSlugs: ['commercial-builder'], industrySpecific: true },
  { productName: 'JobNimbus', industrySlug: 'construction-trades', marketPosition: 'leader', businessTypeSlugs: ['specialty-trade', 'remodeler'], industrySpecific: true },
  { productName: 'FOUNDATION', industrySlug: 'construction-trades', marketPosition: 'leader', businessTypeSlugs: ['general-contractor', 'commercial-builder'], industrySpecific: true },
  { productName: 'QuickBooks', industrySlug: 'construction-trades', marketPosition: 'leader', businessTypeSlugs: [], industrySpecific: false },
  { productName: 'Viewpoint Vista', industrySlug: 'construction-trades', marketPosition: 'challenger', businessTypeSlugs: ['commercial-builder'], industrySpecific: true },

  // Education
  { productName: 'Kajabi', industrySlug: 'education', marketPosition: 'leader', businessTypeSlugs: ['online-course-creator'], industrySpecific: true },
  { productName: 'Podia', industrySlug: 'education', marketPosition: 'challenger', businessTypeSlugs: ['online-course-creator'], industrySpecific: true },
  { productName: 'Acuity Scheduling', industrySlug: 'education', marketPosition: 'challenger', businessTypeSlugs: ['tutoring-service'], industrySpecific: false },

  // Fitness & Wellness
  { productName: 'Mindbody', industrySlug: 'fitness-wellness', marketPosition: 'leader', businessTypeSlugs: ['gym', 'yoga-pilates-studio', 'spa-salon'], industrySpecific: true },
  { productName: 'Vagaro', industrySlug: 'fitness-wellness', marketPosition: 'leader', businessTypeSlugs: ['yoga-pilates-studio', 'spa-salon'], industrySpecific: true },
  { productName: 'Fresha', industrySlug: 'fitness-wellness', marketPosition: 'leader', businessTypeSlugs: ['spa-salon'], industrySpecific: true },
  { productName: 'Booksy', industrySlug: 'fitness-wellness', marketPosition: 'challenger', businessTypeSlugs: ['spa-salon'], industrySpecific: true },
  { productName: 'GlossGenius', industrySlug: 'fitness-wellness', marketPosition: 'challenger', businessTypeSlugs: ['spa-salon'], industrySpecific: true },
  { productName: 'Meevo', industrySlug: 'fitness-wellness', marketPosition: 'challenger', businessTypeSlugs: ['spa-salon'], industrySpecific: true },
  { productName: 'Pike13', industrySlug: 'fitness-wellness', marketPosition: 'challenger', businessTypeSlugs: ['gym', 'yoga-pilates-studio'], industrySpecific: true },

  // Home Services
  { productName: 'Jobber', industrySlug: 'home-services', marketPosition: 'leader', businessTypeSlugs: [], industrySpecific: true },
  { productName: 'Service Autopilot', industrySlug: 'home-services', marketPosition: 'challenger', businessTypeSlugs: ['cleaning-service', 'landscaping'], industrySpecific: true },

  // Technology & SaaS
  { productName: 'HubSpot', industrySlug: 'technology-saas', marketPosition: 'leader', businessTypeSlugs: ['saas-startup', 'software-agency'], industrySpecific: false },
  { productName: 'Salesforce', industrySlug: 'technology-saas', marketPosition: 'leader', businessTypeSlugs: ['enterprise-software'], industrySpecific: false },
  { productName: 'Close CRM', industrySlug: 'technology-saas', marketPosition: 'challenger', businessTypeSlugs: ['saas-startup'], industrySpecific: false },
  { productName: 'Heap', industrySlug: 'technology-saas', marketPosition: 'challenger', businessTypeSlugs: ['saas-startup'], industrySpecific: false },
  { productName: 'Gainsight', industrySlug: 'technology-saas', marketPosition: 'leader', businessTypeSlugs: ['enterprise-software'], industrySpecific: false },
  { productName: 'ChurnZero', industrySlug: 'technology-saas', marketPosition: 'challenger', businessTypeSlugs: ['saas-startup'], industrySpecific: false },
  { productName: 'Vitally', industrySlug: 'technology-saas', marketPosition: 'niche', businessTypeSlugs: ['saas-startup'], industrySpecific: false },
  { productName: 'Intercom', industrySlug: 'technology-saas', marketPosition: 'leader', businessTypeSlugs: [], industrySpecific: false },
  { productName: 'AWS', industrySlug: 'technology-saas', marketPosition: 'leader', businessTypeSlugs: [], industrySpecific: false },
  { productName: 'Chargebee', industrySlug: 'technology-saas', marketPosition: 'leader', businessTypeSlugs: ['saas-startup'], industrySpecific: false },
  { productName: 'Recurly', industrySlug: 'technology-saas', marketPosition: 'challenger', businessTypeSlugs: ['saas-startup'], industrySpecific: false },
];

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\nMode: ${DRY_RUN ? 'DRY RUN' : 'WRITE'}\n`);

  // Fetch all products to build name -> id map
  let allProducts = [];
  let page = 0;
  const pageSize = 1000;
  while (true) {
    const { data, error } = await supabase
      .from('reaper_products')
      .select('id, name')
      .eq('is_active', true)
      .range(page * pageSize, (page + 1) * pageSize - 1);
    if (error || !data || data.length === 0) break;
    allProducts.push(...data);
    if (data.length < pageSize) break;
    page++;
  }

  // Build case-insensitive name -> product map
  const productMap = new Map();
  for (const p of allProducts) {
    productMap.set(p.name.toLowerCase(), p);
  }

  console.log(`Loaded ${allProducts.length} products from DB`);
  console.log(`Processing ${OVERRIDES.length} research-based overrides\n`);

  let matched = 0;
  let notFound = 0;
  let updated = 0;

  for (const override of OVERRIDES) {
    const product = productMap.get(override.productName.toLowerCase());
    if (!product) {
      console.log(`  ✗ NOT FOUND: "${override.productName}" for ${override.industrySlug}`);
      notFound++;
      continue;
    }

    matched++;

    if (DRY_RUN) {
      console.log(`  ✓ MATCH: "${product.name}" → ${override.industrySlug} (${override.marketPosition}${override.industrySpecific ? ', industry-specific' : ''})`);
      continue;
    }

    // Update the existing row
    const { error } = await supabase
      .from('industry_product_relevance')
      .update({
        market_position: override.marketPosition,
        business_type_slugs: override.businessTypeSlugs,
        industry_specific: override.industrySpecific,
        notes: 'research-verified',
      })
      .eq('product_id', product.id)
      .eq('industry_slug', override.industrySlug);

    if (error) {
      console.log(`  ⚠ UPDATE ERROR: "${product.name}" for ${override.industrySlug}: ${error.message}`);
    } else {
      updated++;
      console.log(`  ✓ UPDATED: "${product.name}" → ${override.industrySlug} (${override.marketPosition})`);
    }
  }

  // Boost leaders to top ranks
  if (WRITE) {
    console.log('\nBoosting leaders to top ranks...');
    for (const override of OVERRIDES) {
      if (override.marketPosition !== 'leader') continue;
      const product = productMap.get(override.productName.toLowerCase());
      if (!product) continue;

      // Get current rank
      const { data: row } = await supabase
        .from('industry_product_relevance')
        .select('relevance_rank')
        .eq('product_id', product.id)
        .eq('industry_slug', override.industrySlug)
        .single();

      if (row && row.relevance_rank > 3) {
        // Move to rank 1 by shifting others down
        const { error } = await supabase
          .from('industry_product_relevance')
          .update({ relevance_rank: 0 }) // temporary
          .eq('product_id', product.id)
          .eq('industry_slug', override.industrySlug);

        if (!error) {
          // Set to rank 1 (will share rank with others — that's fine for display)
          await supabase
            .from('industry_product_relevance')
            .update({ relevance_rank: 1 })
            .eq('product_id', product.id)
            .eq('industry_slug', override.industrySlug);
        }
      }
    }
  }

  console.log(`\n─── Override Summary ───────────────────────────`);
  console.log(`  Matched:   ${matched}`);
  console.log(`  Not found: ${notFound}`);
  if (WRITE) {
    console.log(`  Updated:   ${updated}`);
  }
  console.log(`  Total:     ${OVERRIDES.length}`);

  if (DRY_RUN) {
    console.log('\n✓ Dry run complete. Use --write to apply overrides.');
  } else {
    console.log('\n✓ Overrides applied.');
  }
}

main().catch(console.error);
