import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  // Sanitize query for ilike (escape special chars)
  const sanitized = q.replace(/[%_\\]/g, '\\$&');

  // Try full-text search first
  const tsQuery = q
    .split(/\s+/)
    .filter((w) => w.length > 0)
    .map((w) => w.replace(/[^a-zA-Z0-9]/g, '') + ':*')
    .filter((w) => w.length > 2)
    .join(' & ');

  if (tsQuery) {
    const { data: ftsData } = await supabase
      .from('reaper_products')
      .select('id, name, slug, category, normalized_category, tagline, feature_count, quality_score')
      .eq('is_active', true)
      .textSearch('search_vector', tsQuery)
      .order('quality_score', { ascending: false })
      .limit(10);

    if (ftsData && ftsData.length > 0) {
      return NextResponse.json({ results: ftsData });
    }
  }

  // Fallback to ilike
  const { data } = await supabase
    .from('reaper_products')
    .select('id, name, slug, category, normalized_category, tagline, feature_count, quality_score')
    .eq('is_active', true)
    .or(`name.ilike.%${sanitized}%,tagline.ilike.%${sanitized}%,category.ilike.%${sanitized}%,normalized_category.ilike.%${sanitized}%,description.ilike.%${sanitized}%`)
    .order('quality_score', { ascending: false })
    .limit(10);

  return NextResponse.json({ results: data ?? [] });
}
