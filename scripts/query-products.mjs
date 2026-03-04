import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Read .env.local manually
const envContent = readFileSync('.env.local', 'utf8');
const env = {};
for (const line of envContent.split('\n')) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const { data, error } = await supabase
  .from('reaper_products')
  .select('category, name')
  .eq('is_active', true)
  .not('category', 'is', null)
  .order('category')
  .order('name');

if (error) { console.error(error); process.exit(1); }

const cats = {};
for (const row of data) {
  if (!cats[row.category]) cats[row.category] = [];
  cats[row.category].push(row.name);
}

console.log('Total products:', data.length);
console.log('Total categories:', Object.keys(cats).length);
console.log('---');
for (const [cat, products] of Object.entries(cats).sort()) {
  console.log(`${cat} (${products.length}): ${products.join(', ')}`);
}
