import { ImageResponse } from 'next/og';
import { getProductLiteBySlug } from '@/lib/data';

export const runtime = 'edge';
export const alt = 'SaaSipedia Product';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: { slug: string } }) {
  const product = await getProductLiteBySlug(params.slug);

  const name = product?.name || params.slug;
  const category = product?.normalized_category || product?.category || 'SaaS Product';
  const tagline = product?.tagline || '';
  const featureCount = product?.feature_count || 0;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Top: Category badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              fontSize: '18px',
              color: '#94a3b8',
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              padding: '6px 16px',
            }}
          >
            {category}
          </div>
        </div>

        {/* Middle: Product name + tagline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              fontSize: '64px',
              fontWeight: 700,
              color: '#f8fafc',
              lineHeight: 1.1,
            }}
          >
            {name}
          </div>
          {tagline && (
            <div
              style={{
                fontSize: '24px',
                color: '#94a3b8',
                lineHeight: 1.4,
                maxWidth: '800px',
              }}
            >
              {tagline.length > 100 ? tagline.slice(0, 100) + '...' : tagline}
            </div>
          )}
        </div>

        {/* Bottom: Stats + branding */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', gap: '32px' }}>
            {featureCount > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ fontSize: '32px', fontWeight: 700, color: '#3b82f6' }}>
                  {featureCount}
                </div>
                <div style={{ fontSize: '14px', color: '#64748b' }}>Features</div>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#f8fafc' }}>
              SaaSipedia
            </div>
            <div style={{ fontSize: '16px', color: '#64748b' }}>
              The SaaS Encyclopedia
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
