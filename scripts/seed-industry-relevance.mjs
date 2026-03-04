import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// ─── Config ──────────────────────────────────────────────────────────────────

const DRY_RUN = process.argv.includes('--dry-run');
const WRITE = process.argv.includes('--write');

if (!DRY_RUN && !WRITE) {
  console.log('Usage: node scripts/seed-industry-relevance.mjs [--dry-run | --write]');
  console.log('  --dry-run  Report what would be written');
  console.log('  --write    Write rows to DB');
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

// ─── Industry → Category Mappings (extracted from lib/industries.ts) ─────────

const INDUSTRY_MAPPINGS = [
  { slug: 'healthcare', categoryMappings: [
    { category: 'CRM', businessTypes: [] },
    { category: 'Scheduling & Booking', businessTypes: [] },
    { category: 'Accounting Software', businessTypes: [] },
    { category: 'Payment Processing', businessTypes: [] },
    { category: 'Cybersecurity', businessTypes: [] },
    { category: 'Healthcare IT', businessTypes: ['dental-office','plastic-surgery-clinic','physical-therapy'] },
    { category: 'Marketing Automation', businessTypes: ['plastic-surgery-clinic','dental-office','veterinary'] },
    { category: 'Website Builder', businessTypes: ['plastic-surgery-clinic','dental-office','physical-therapy','veterinary'] },
    { category: 'Email Marketing', businessTypes: ['dental-office','veterinary','plastic-surgery-clinic','physical-therapy'] },
    { category: 'Customer Support', businessTypes: ['dental-office','plastic-surgery-clinic'] },
  ]},
  { slug: 'financial-services', categoryMappings: [
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
  { slug: 'legal', categoryMappings: [
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
  { slug: 'real-estate', categoryMappings: [
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
    { category: 'Accounting Software', businessTypes: ['real-estate-investor','property-manager'] },
  ]},
  { slug: 'restaurant-hospitality', categoryMappings: [
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
  { slug: 'retail-ecommerce', categoryMappings: [
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
  { slug: 'professional-services', categoryMappings: [
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
  { slug: 'construction-trades', categoryMappings: [
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
  { slug: 'education', categoryMappings: [
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
  { slug: 'fitness-wellness', categoryMappings: [
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
  { slug: 'home-services', categoryMappings: [
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
  { slug: 'technology-saas', categoryMappings: [
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

// ─── Fetch all products ──────────────────────────────────────────────────────

async function fetchAllProducts() {
  let all = [];
  let page = 0;
  const pageSize = 1000;
  while (true) {
    const { data, error } = await supabase
      .from('reaper_products')
      .select('id, name, normalized_category, quality_score')
      .eq('is_active', true)
      .not('normalized_category', 'is', null)
      .range(page * pageSize, (page + 1) * pageSize - 1);
    if (error || !data || data.length === 0) break;
    all.push(...data);
    if (data.length < pageSize) break;
    page++;
  }
  return all;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\nMode: ${DRY_RUN ? 'DRY RUN' : 'WRITE'}\n`);

  const products = await fetchAllProducts();
  console.log(`Fetched ${products.length} active products from DB\n`);

  // Build product index by normalized_category
  const productsByCategory = {};
  for (const p of products) {
    const cat = p.normalized_category;
    if (!productsByCategory[cat]) productsByCategory[cat] = [];
    productsByCategory[cat].push(p);
  }
  // Sort each category by quality_score DESC
  for (const cat of Object.keys(productsByCategory)) {
    productsByCategory[cat].sort((a, b) => (b.quality_score || 0) - (a.quality_score || 0));
  }

  const allRows = [];
  const stats = {};

  for (const industry of INDUSTRY_MAPPINGS) {
    const industrySlug = industry.slug;
    stats[industrySlug] = { total: 0, leaders: 0, challengers: 0, niche: 0 };

    // Track best rank per product within this industry (handle duplicates across categories)
    const bestByProduct = new Map(); // product_id -> row

    // Deduplicate category mappings (some appear twice with different businessTypes)
    const seenCategories = new Map(); // category -> merged businessTypes
    for (const mapping of industry.categoryMappings) {
      const existing = seenCategories.get(mapping.category);
      if (existing) {
        // Merge business types
        existing.businessTypes = [...new Set([...existing.businessTypes, ...mapping.businessTypes])];
      } else {
        seenCategories.set(mapping.category, { ...mapping, businessTypes: [...mapping.businessTypes] });
      }
    }

    for (const [, mapping] of seenCategories) {
      const catProducts = productsByCategory[mapping.category] || [];
      if (catProducts.length === 0) continue;

      const businessTypeSlugs = mapping.businessTypes;
      const total = catProducts.length;
      const leaderCutoff = Math.max(1, Math.ceil(total * 0.1));
      const challengerCutoff = Math.max(leaderCutoff + 1, Math.ceil(total * 0.4));

      for (let i = 0; i < catProducts.length; i++) {
        const p = catProducts[i];
        const rank = i + 1;
        const marketPosition =
          rank <= leaderCutoff ? 'leader' :
          rank <= challengerCutoff ? 'challenger' : 'niche';

        const row = {
          product_id: p.id,
          industry_slug: industrySlug,
          business_type_slugs: businessTypeSlugs,
          relevance_rank: rank,
          market_position: marketPosition,
          industry_specific: false,
          notes: null,
        };

        // Keep highest rank (lowest number) if product appears in multiple categories
        const existing = bestByProduct.get(p.id);
        if (!existing || rank < existing.relevance_rank) {
          if (existing && existing.business_type_slugs.length > 0 && businessTypeSlugs.length > 0) {
            row.business_type_slugs = [...new Set([...existing.business_type_slugs, ...businessTypeSlugs])];
          } else if (existing && existing.business_type_slugs.length > 0) {
            row.business_type_slugs = existing.business_type_slugs;
          }
          bestByProduct.set(p.id, row);
        } else if (existing && businessTypeSlugs.length > 0) {
          existing.business_type_slugs = [...new Set([...existing.business_type_slugs, ...businessTypeSlugs])];
        }
      }
    }

    // Collect and re-rank
    const industryRows = Array.from(bestByProduct.values());
    industryRows.sort((a, b) => a.relevance_rank - b.relevance_rank);
    for (let i = 0; i < industryRows.length; i++) {
      industryRows[i].relevance_rank = i + 1;
      const total = industryRows.length;
      const leaderCutoff = Math.max(1, Math.ceil(total * 0.1));
      const challengerCutoff = Math.max(leaderCutoff + 1, Math.ceil(total * 0.4));
      const rank = i + 1;
      industryRows[i].market_position =
        rank <= leaderCutoff ? 'leader' :
        rank <= challengerCutoff ? 'challenger' : 'niche';
    }

    allRows.push(...industryRows);
    stats[industrySlug].total = industryRows.length;
    stats[industrySlug].leaders = industryRows.filter(r => r.market_position === 'leader').length;
    stats[industrySlug].challengers = industryRows.filter(r => r.market_position === 'challenger').length;
    stats[industrySlug].niche = industryRows.filter(r => r.market_position === 'niche').length;
  }

  // Report
  console.log('─── Industry Relevance Summary ───────────────────────────');
  console.log(`${'Industry'.padEnd(25)} ${'Total'.padStart(6)} ${'Leader'.padStart(7)} ${'Challngr'.padStart(9)} ${'Niche'.padStart(6)}`);
  console.log('─'.repeat(60));
  let grandTotal = 0;
  for (const [slug, s] of Object.entries(stats)) {
    console.log(`${slug.padEnd(25)} ${String(s.total).padStart(6)} ${String(s.leaders).padStart(7)} ${String(s.challengers).padStart(9)} ${String(s.niche).padStart(6)}`);
    grandTotal += s.total;
  }
  console.log('─'.repeat(60));
  console.log(`${'TOTAL'.padEnd(25)} ${String(grandTotal).padStart(6)}`);

  if (DRY_RUN) {
    console.log('\n✓ Dry run complete. Use --write to insert rows.');
    return;
  }

  // Write to DB in batches
  console.log(`\nInserting ${allRows.length} rows...`);
  const batchSize = 500;
  let inserted = 0;
  for (let i = 0; i < allRows.length; i += batchSize) {
    const batch = allRows.slice(i, i + batchSize);
    const { error } = await supabase
      .from('industry_product_relevance')
      .upsert(batch.map(r => ({
        product_id: r.product_id,
        industry_slug: r.industry_slug,
        business_type_slugs: r.business_type_slugs,
        relevance_rank: r.relevance_rank,
        market_position: r.market_position,
        industry_specific: r.industry_specific,
        notes: r.notes,
      })), { onConflict: 'product_id,industry_slug' });

    if (error) {
      console.error(`Error inserting batch at offset ${i}:`, error.message);
    } else {
      inserted += batch.length;
    }
  }

  console.log(`✓ Inserted ${inserted} rows into industry_product_relevance.`);
}

main().catch(console.error);
