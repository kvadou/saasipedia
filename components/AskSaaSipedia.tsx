'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { MessageCircle, Send, Loader2, X, ArrowRight } from 'lucide-react';

interface SearchResult {
  name: string;
  slug: string;
  category: string | null;
  tagline: string | null;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  products?: SearchResult[];
}

/**
 * Converts markdown-style links [text](url) into anchor tags.
 * Only allows relative URLs starting with / to prevent XSS via javascript: URIs.
 */
function renderMarkdownLinks(text: string): string {
  return text.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_match, label: string, url: string) => {
      // Sanitize: only allow relative paths starting with /
      const safeUrl = url.startsWith('/') ? url : '#';
      const safeLabel = label
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
      return `<a href="${safeUrl}" class="underline font-medium hover:opacity-80">${safeLabel}</a>`;
    }
  );
}

export default function AskSaaSipedia() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const question = input.trim();
    if (!question || loading) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: question }]);
    setLoading(true);

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });

      if (!res.ok) throw new Error('Failed');

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.answer, products: data.products },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, something went wrong. Please try again.',
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(
        () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }),
        100
      );
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full bg-wiki-accent text-white shadow-lg hover:bg-wiki-accent-hover transition-colors"
      >
        <MessageCircle className="w-5 h-5" />
        <span className="text-sm font-medium">Ask SaaSipedia</span>
      </button>
    );
  }

  return (
    <div
      className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-2xl border border-wiki-border flex flex-col"
      style={{ maxHeight: '500px' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-wiki-border">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-wiki-accent" />
          <span className="text-sm font-semibold text-wiki-text">
            Ask SaaSipedia
          </span>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-wiki-text-muted hover:text-wiki-text transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{ minHeight: '200px' }}
      >
        {messages.length === 0 && (
          <div className="text-center py-6">
            <p className="text-sm text-wiki-text-muted mb-3">
              Ask me about any software category, product, or feature.
            </p>
            <div className="space-y-1.5">
              {[
                'What CRM has the most integrations?',
                'Compare project management tools',
                'Best free accounting software',
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="block w-full text-left text-xs text-wiki-accent hover:underline px-2 py-1 rounded hover:bg-wiki-bg-alt transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                msg.role === 'user'
                  ? 'bg-wiki-accent text-white'
                  : 'bg-wiki-bg-alt text-wiki-text'
              }`}
            >
              {msg.role === 'user' ? (
                <div className="whitespace-pre-wrap leading-relaxed">
                  {msg.content}
                </div>
              ) : (
                <div
                  className="whitespace-pre-wrap leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: renderMarkdownLinks(msg.content),
                  }}
                />
              )}
              {msg.products && msg.products.length > 0 && (
                <div className="mt-2 pt-2 border-t border-wiki-border/50 space-y-1">
                  {msg.products.map((p) => (
                    <Link
                      key={p.slug}
                      href={`/wiki/${p.slug}`}
                      className="flex items-center justify-between text-xs group"
                    >
                      <span className="group-hover:underline">{p.name}</span>
                      <ArrowRight className="w-3 h-3 opacity-50" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-wiki-bg-alt rounded-lg px-3 py-2">
              <Loader2 className="w-4 h-4 animate-spin text-wiki-accent" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-wiki-border p-3 flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about any software..."
          className="flex-1 text-sm px-3 py-2 rounded-lg border border-wiki-border focus:outline-none focus:border-wiki-accent"
          maxLength={500}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="px-3 py-2 rounded-lg bg-wiki-accent text-white disabled:opacity-50 hover:bg-wiki-accent-hover transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
