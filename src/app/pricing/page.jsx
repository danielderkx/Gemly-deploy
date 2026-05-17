'use client';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

const PACKAGES = [
  {
    name: 'Starter',
    price: '€4,99',
    searches: 10,
    priceId: 'price_1TY4j5Iy2dxBbN1t9i4D39r6',
    perSearch: '€0,50',
    highlight: false,
  },
  {
    name: 'Plus',
    price: '€11,99',
    searches: 30,
    priceId: 'price_1TY4kbIy2dxBbN1tAvOpw9IT',
    perSearch: '€0,40',
    highlight: true,
  },
  {
    name: 'Pro',
    price: '€29,99',
    searches: 100,
    priceId: 'price_1TY4ljIy2dxBbN1tUdUGl47a',
    perSearch: '€0,30',
    highlight: false,
  },
];

export default function PricingPage() {
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
    }
    setLoading(null);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F5F0E8', fontFamily: "'Outfit', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@200;300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .pkg-btn { width: 100%; background: #1A1612; color: #fff; border: none; padding: 13px; font-size: 11px; font-family: 'Outfit', sans-serif; font-weight: 400; letter-spacing: .2em; text-transform: uppercase; cursor: pointer; transition: background .2s; border-radius: 2px; }
        .pkg-btn:hover { background: #3A3028; }
        .pkg-btn:disabled { background: #C8C0B4; cursor: not-allowed; }
        .pkg-btn.highlight { background: #1A1612; }
        .nav-link { font-size: 11px; font-weight: 300; letter-spacing: .15em; text-transform: uppercase; color: #9A9080; text-decoration: none; transition: color .2s; }
        .nav-link:hover { color: #1A1612; }
      `}</style>

      {/* Nav */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2.5rem', borderBottom: '1px solid #E8E0D4', background: '#F5F0E8' }}>
        <a href="/" style={{ fontSize: 16, fontWeight: 400, letterSpacing: '.12em', textTransform: 'uppercase', color: '#1A1612', textDecoration: 'none' }}>Gemly</a>
        <a href="/scan" className="nav-link">← Back to scanner</a>
      </nav>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '3rem 1.5rem' }}>

        {/* Success/cancel messages */}
        {paymentSuccess && (
          <div style={{ background: '#EEF4EE', border: '1px solid #C8D8C8', borderRadius: 2, padding: '1rem 1.25rem', marginBottom: '2rem', fontSize: 14, color: '#3A6A3A', fontWeight: 300 }}>
            ✓ Payment successful — your searches have been added!{' '}
            <a href="/scan" style={{ color: '#1A1612', fontWeight: 400 }}>Start scanning →</a>
          </div>
        )}
        {paymentCancelled && (
          <div style={{ background: '#FDF0EE', border: '1px solid #E8C8C0', borderRadius: 2, padding: '1rem 1.25rem', marginBottom: '2rem', fontSize: 14, color: '#8A3A30', fontWeight: 300 }}>
            Payment cancelled — no charges were made.
          </div>
        )}

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <p style={{ fontSize: 10, fontWeight: 300, letterSpacing: '.25em', textTransform: 'uppercase', color: '#9A9080', marginBottom: '0.5rem' }}>Pricing</p>
          <h1 style={{ fontSize: 'clamp(28px,5vw,42px)', fontWeight: 200, letterSpacing: '-.02em', color: '#1A1612', lineHeight: 1.1, marginBottom: '0.75rem' }}>
            Get more searches.
          </h1>
          <p style={{ fontSize: 14, fontWeight: 300, color: '#9A9080', lineHeight: 1.6 }}>
            One-time payment. No subscription. Credits never expire.
          </p>
        </div>

        {/* Packages */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: '2rem' }}>
          {PACKAGES.map(pkg => (
            <div key={pkg.name} style={{
              background: '#fff',
              border: pkg.highlight ? '1px solid #1A1612' : '1px solid #EDEAE4',
              borderRadius: 2,
              padding: '1.75rem 1.5rem',
              position: 'relative',
            }}>
              {pkg.highlight && (
                <div style={{ position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)', background: '#1A1612', color: '#fff', fontSize: 9, fontWeight: 400, letterSpacing: '.15em', textTransform: 'uppercase', padding: '3px 12px' }}>
                  Most popular
                </div>
              )}
              <p style={{ fontSize: 10, fontWeight: 300, letterSpacing: '.2em', textTransform: 'uppercase', color: '#9A9080', marginBottom: '0.5rem', marginTop: pkg.highlight ? '0.5rem' : 0 }}>{pkg.name}</p>
              <p style={{ fontSize: 36, fontWeight: 200, color: '#1A1612', letterSpacing: '-.02em', marginBottom: '0.25rem' }}>{pkg.price}</p>
              <p style={{ fontSize: 13, fontWeight: 300, color: '#9A9080', marginBottom: '1.5rem' }}>{pkg.searches} searches · {pkg.perSearch} each</p>

              <div style={{ borderTop: '1px solid #EDEAE4', paddingTop: '1.25rem', marginBottom: '1.5rem' }}>
                {[
                  `${pkg.searches} search credits`,
                  'All EU platforms',
                  'Never expires',
                  'Local shop finder',
                ].map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: '#5A7A5A' }}>✓</span>
                    <span style={{ fontSize: 13, fontWeight: 300, color: '#1A1612' }}>{f}</span>
                  </div>
                ))}
              </div>

              <button
                className={`pkg-btn${pkg.highlight ? ' highlight' : ''}`}
                onClick={() => handleCheckout(pkg.priceId, pkg.name)}
                disabled={loading === pkg.priceId}
              >
                {loading === pkg.priceId ? 'Redirecting…' : `Get ${pkg.name}`}
              </button>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <p style={{ textAlign: 'center', fontSize: 12, fontWeight: 300, color: '#9A9080', lineHeight: 1.6 }}>
          Secure payment via Stripe · Your first 2 searches are free
        </p>
      </div>
    </div>
  );
}
