import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { supabase } from '@/lib/supabase';

const anthropic = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json();
    if (!question || typeof question !== 'string' || question.length > 500) {
      return NextResponse.json({ error: 'Invalid question' }, { status: 400 });
    }

    // Extract meaningful search terms (3+ chars)
    const terms = question
      .split(/\s+/)
      .filter((w: string) => w.length > 2)
      .map((w: string) => w.replace(/[^a-zA-Z0-9]/g, ''))
      .filter(Boolean);

    // Search by name/tagline
    const nameFilters = terms
      .slice(0, 5)
      .map((t: string) => `name.ilike.%${t}%,tagline.ilike.%${t}%`)
      .join(',');

    const { data: products } = await supabase
      .from('products')
      .select('name, slug, normalized_category, tagline, feature_count, quality_score')
      .eq('is_active', true)
      .or(nameFilters)
      .order('quality_score', { ascending: false })
      .limit(10);

    // Also search by category
    const categoryFilters = terms
      .slice(0, 5)
      .map((t: string) => `normalized_category.ilike.%${t}%,category.ilike.%${t}%`)
      .join(',');

    const { data: categoryProducts } = await supabase
      .from('products')
      .select('name, slug, normalized_category, tagline, feature_count, quality_score')
      .eq('is_active', true)
      .or(categoryFilters)
      .order('quality_score', { ascending: false })
      .limit(10);

    const allProducts = [...(products || []), ...(categoryProducts || [])];
    // Deduplicate by slug
    const seen = new Set<string>();
    const uniqueProducts = allProducts.filter((p) => {
      if (seen.has(p.slug)) return false;
      seen.add(p.slug);
      return true;
    }).slice(0, 15);

    const productContext =
      uniqueProducts.length > 0
        ? uniqueProducts
            .map(
              (p) =>
                `- ${p.name} (${p.normalized_category || 'Uncategorized'}): ${p.tagline || 'No description'}. ${p.feature_count} features. Quality: ${Math.round((p.quality_score ?? 0) * 100)}%. URL: /wiki/${p.slug}`
            )
            .join('\n')
        : 'No directly matching products found.';

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      system: `You are SaaSipedia's AI assistant. You help users find and understand business software products from our encyclopedia database. Be concise, helpful, and always reference specific products from our data when possible. Format product names as markdown links like [ProductName](/wiki/slug). If you don't have relevant data, say so honestly. Keep answers under 200 words.`,
      messages: [
        {
          role: 'user',
          content: `Question: ${question}\n\nRelevant products from our database:\n${productContext}`,
        },
      ],
    });

    const textBlock = message.content.find((b) => b.type === 'text');
    const answer = textBlock?.text || 'Sorry, I could not generate an answer.';

    return NextResponse.json({
      answer,
      products: uniqueProducts.slice(0, 5).map((p) => ({
        name: p.name,
        slug: p.slug,
        category: p.normalized_category,
        tagline: p.tagline,
      })),
    });
  } catch (error) {
    console.error('Ask API error:', error);
    return NextResponse.json(
      { error: 'Failed to process question' },
      { status: 500 }
    );
  }
}
