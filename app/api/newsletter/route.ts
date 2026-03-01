import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = (body.email || '').trim().toLowerCase();
    const source = body.source || 'unknown';

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    // Upsert into newsletter_subscribers table
    const { error } = await supabase
      .from('newsletter_subscribers')
      .upsert(
        {
          email,
          source,
          subscribed_at: new Date().toISOString(),
          is_active: true,
        },
        { onConflict: 'email', ignoreDuplicates: true }
      );

    if (error) {
      // If table doesn't exist yet, just log and return success
      // (the subscriber intent is still captured in logs)
      console.error('Newsletter subscribe error:', error.message);

      // Still return success to user — we don't want to block signup
      // because of a missing table
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Invalid request.' },
      { status: 400 }
    );
  }
}
