'use client';
import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

const PACKAGES = [
  {
    name: 'Starter',
    price: '€5,99',
    searches: 10,
    priceId: 'price_1TYoLOIy2dxBbN1tDEDjrvAo',
    perSearch: '€0,60',
    highlight: false,
  },
  {
    name: 'Plus',
    price: '€12,99',
    searches: 30,
    priceId: 'price_1TYoMIIy2dxBbN1tMsacEGz0',
    perSearch: '€0,43',
    highlight: true,
  },
  {
    name: 'Pro',
    price: '€34,99',
    searches: 100,
    priceId: 'price_1TY4ljIy2dxBbN1tUdUGl47a',
    perSearch: '€0,35',
    highlight: false,
  },
];

function PricingContent() {
  const [loading, setLoading] = useState(null);
  const searchParams = useSearchParams();
  const paymentSuccess = searchParams.get('payment') === 'success';
  const paymentCancelled = searchParams.get('payment') === 'cancelled';

  const handleCheckout = async (priceId, name) => {
    setLoading(priceId);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else if (data.error === 'Not authenticated') {
        window.location.href = '/login';
      } else {
        alert('Something went wrong. Please try again.');
      }
    } catch {
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
      <div style={{ textAlign: 'center', padding: '4rem 2rem 2rem' }}>
        {paymentSuccess && (
          <div style={{ display: 'inline-block', background: '#E8F5E9', color: '#2E7D32', fontSize: 13, padding: '8px 16px', borderRadius: 2, marginBottom: '1.5rem', letterSpacing: '.05em' }}>
            Payment successful — credits added to your account.
          </div>
        )}
        {paymentCancelled && (
          <div style={{ display: 'inline-block', background: '#FFF3E0', color: '#E65100', fontSize: 13, padding: '8px 16px', borderRadius: 2, marginBottom: '1.5rem', letterSpacing: '.05em' }}>
            Payment cancelled.
          </div>
        )}
        <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '.15em', textTransform: 'uppercase', color: '#9A9080', marginBottom: '1rem' }}>PRICING</p>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 300, color: '#1A1612', margin: '0 0 1rem', lineHeight: 1.1 }}>Get more searches.</h1>
        <p style={{ fontSize: 14, color: '#9A9080', fontWeight: 300, letterSpacing: '.05em' }}>One-time payment. No subscription. Credits never expire.</p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', padding: '2rem', flexWrap: 'wrap', maxWidth: 960, margin: '0 auto' }}>
        {PACKAGES.map((pkg) => (
          <div key={pkg.priceId} style={{
            background: '#FFFFFF',
            border: pkg.highlight ? '1.5px solid #1A1612' : '0.5px solid #E8E4DE',
            borderRadius: 2,
            padding: '2rem 1.75rem',
            flex: '1 1 260px',
            maxWidth: 300,
            position: 'relative',
          }}>
            {pkg.highlight && (
              <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: '#1A1612', color: '#FAF8F5', fontSize: 10, fontWeight: 500, letterSpacing: '.12em', textTransform: 'uppercase', padding: '4px 14px' }}>
                Most Popular
              </div>
            )}
            <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '.15em', textTransform: 'uppercase', color: '#9A9080', marginBottom: '0.75rem' }}>{pkg.name}</p>
            <p style={{ fontSize: 36, fontWeight: 300, color: '#1A1612', margin: '0 0 4px' }}>{pkg.price}</p>
            <p style={{ fontSize: 12, color: '#9A9080', marginBottom: '1.5rem', letterSpacing: '.03em' }}>{pkg.searches} searches · {pkg.perSearch} each</p>
            <div style={{ borderTop: '0.5px solid #E8E4DE', paddingTop: '1.25rem', marginBottom: '1.5rem' }}>
              {[`${pkg.searches} search credits`, 'All EU platforms', 'Never expires', 'Local shop finder'].map((f) => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ color: '#1A1612', fontSize: 12 }}>✓</span>
                  <span style={{ fontSize: 13, color: '#5A524A', fontWeight: 300 }}>{f}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => handleCheckout(pkg.priceId, pkg.name)}
              disabled={loading === pkg.priceId}
              style={{
                width: '100%',
                background: '#1A1612',
                color: '#FAF8F5',
                border: 'none',
                padding: '12px',
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: '.12em',
                textTransform: 'uppercase',
                cursor: loading === pkg.priceId ? 'not-allowed' : 'pointer',
                opacity: loading === pkg.priceId ? 0.6 : 1,
                borderRadius: 2,
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              {loading === pkg.priceId ? 'Loading...' : `Get ${pkg.name}`}
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

export default function PricingPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#FAF8F5', fontFamily: "'Outfit', sans-serif" }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 2rem', borderBottom: '0.5px solid #E8E4DE' }}>
        <a href="/" style={{ fontSize: 14, fontWeight: 500, letterSpacing: '.15em', textTransform: 'uppercase', color: '#1A1612', textDecoration: 'none' }}>GEMLY</a>
        <a href="/scan" style={{ fontSize: 11, fontWeight: 400, letterSpacing: '.12em', textTransform: 'uppercase', color: '#9A9080', textDecoration: 'none' }}>← Back to Scanner</a>
      </nav>
      <Suspense fallback={null}>
        <PricingContent />
      </Suspense>
    </div>
  );
}
