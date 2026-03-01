import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  // Try full-text search first
  const tsQuery = q
    .split(/\s+/)
    .map((w) => w + ':*')
    .join(' & ');

  const { data: ftsData } = await supabase
    .from('reaper_products')
    .select('id, name, slug, category, tagline, feature_count, quality_score')
    .eq('is_active', true)
    .textSearch('search_vector', tsQuery)
    .order('quality_score', { ascending: false })
    .limit(8);

  if (ftsData && ftsData.length > 0) {
    return NextResponse.json({ results: ftsData });
  }

  // Fallback to ilike
  const { data } = await supabase
    .from('reaper_products')
    .select('id, name, slug, category, tagline, feature_count, quality_score')
    .eq('is_active', true)
    .or(`name.ilike.%${q}%,tagline.ilike.%${q}%,category.ilike.%${q}%`)
    .order('quality_score', { ascending: false })
    .limit(8);

  return NextResponse.json({ results: data ?? [] });
}
