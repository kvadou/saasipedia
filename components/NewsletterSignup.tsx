'use client';

import { useState } from 'react';
import { Mail, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';

interface NewsletterSignupProps {
  variant?: 'inline' | 'card';
  source?: string;
}

export default function NewsletterSignup({ variant = 'card', source = 'homepage' }: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }

    setStatus('loading');

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed, source }),
      });

      if (res.ok) {
        setStatus('success');
        setMessage("You're in! We'll keep you updated.");
        setEmail('');
      } else {
        const data = await res.json().catch(() => ({}));
        setStatus('error');
        setMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  }

  if (status === 'success') {
    return (
      <div className={variant === 'card' ? 'p-6 rounded-lg bg-wiki-bg-alt border border-wiki-border text-center' : ''}>
        <div className="flex items-center justify-center gap-2 text-green-600">
          <CheckCircle className="w-5 h-5" />
          <span className="text-sm font-medium">{message}</span>
        </div>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-wiki-text-muted" />
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); if (status === 'error') setStatus('idle'); }}
            placeholder="your@email.com"
            className="w-full pl-9 pr-3 py-2 text-sm border border-wiki-border rounded-lg bg-white
              text-wiki-text placeholder:text-wiki-text-muted focus:outline-none focus:ring-2
              focus:ring-wiki-accent/30 focus:border-wiki-accent"
          />
        </div>
        <button
          type="submit"
          disabled={status === 'loading'}
          className="px-4 py-2 text-sm font-medium bg-wiki-accent text-white rounded-lg
            hover:bg-wiki-accent-hover transition-colors disabled:opacity-60 shrink-0"
        >
          {status === 'loading' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            'Subscribe'
          )}
        </button>
        {status === 'error' && message && (
          <span className="text-xs text-red-500 absolute -bottom-5 left-0">{message}</span>
        )}
      </form>
    );
  }

  return (
    <div className="p-6 rounded-lg bg-wiki-bg-alt border border-wiki-border">
      <div className="flex items-center gap-2 mb-2">
        <Mail className="w-5 h-5 text-wiki-accent" />
        <h3 className="text-base font-semibold text-wiki-text">Stay Updated</h3>
      </div>
      <p className="text-sm text-wiki-text-muted mb-4">
        Get weekly updates on new SaaS products, features, and pricing changes.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); if (status === 'error') setStatus('idle'); }}
          placeholder="your@email.com"
          className="flex-1 px-3 py-2 text-sm border border-wiki-border rounded-lg bg-white
            text-wiki-text placeholder:text-wiki-text-muted focus:outline-none focus:ring-2
            focus:ring-wiki-accent/30 focus:border-wiki-accent"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium
            bg-wiki-accent text-white rounded-lg hover:bg-wiki-accent-hover transition-colors
            disabled:opacity-60 shrink-0"
        >
          {status === 'loading' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              Subscribe
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>
      {status === 'error' && message && (
        <p className="text-xs text-red-500 mt-2">{message}</p>
      )}
      <p className="text-xs text-wiki-text-muted mt-3">
        No spam. Unsubscribe anytime.
      </p>
    </div>
  );
}
