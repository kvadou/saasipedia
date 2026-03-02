import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;

  if (!slug) {
    return NextResponse.json({ count: 0, recent_builders: [] });
  }

  // Get count of public builds for this product
  const { count, error: countError } = await supabase
    .from('shipyard_builds')
    .select('*', { count: 'exact', head: true })
    .eq('product_slug', slug)
    .eq('is_public', true);

  if (countError) {
    console.error('shipyard count error:', countError);
    return NextResponse.json({ count: 0, recent_builders: [] });
  }

  // Get recent builders (limit 5)
  const { data: recentBuilds, error: buildsError } = await supabase
    .from('shipyard_builds')
    .select('display_name, status')
    .eq('product_slug', slug)
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(5);

  if (buildsError) {
    console.error('shipyard recent builders error:', buildsError);
    return NextResponse.json({ count: count ?? 0, recent_builders: [] });
  }

  return NextResponse.json({
    count: count ?? 0,
    recent_builders: (recentBuilds ?? []).map((b) => ({
      display_name: b.display_name,
      status: b.status,
    })),
  });
}
