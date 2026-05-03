'use client';
import { useRef } from "react";
import Scanner from "./Scanner";

export default function Home() {
  const scannerRef = useRef(null);

  const scrollToScanner = () => {
    scannerRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400;1,500;1,700&family=Nunito:wght@300;400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #FDFAF6;
          font-family: 'Nunito', sans-serif;
          color: #2C2417;
          overflow-x: hidden;
        }

        /* ---- NAV ---- */
        .nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 2.5rem;
          background: rgba(253, 250, 246, 0.85);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(237, 232, 223, 0.6);
        }
        .nav-logo {
          font-family: 'Playfair Display', serif;
          font-size: 22px;
          font-style: italic;
          font-weight: 500;
          color: #2C2417;
          letter-spacing: -0.02em;
        }
        .nav-logo span { color: #C4924A; }
        .nav-cta {
          background: #2C2417;
          color: #FDFAF6;
          border: none;
          border-radius: 10px;
          padding: 0.65rem 1.4rem;
          font-size: 13px;
          font-family: 'Nunito', sans-serif;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s;
        }
        .nav-cta:hover { background: #C4924A; transform: translateY(-1px); }

        /* ---- HERO ---- */
        .hero {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 8rem 2rem 5rem;
          position: relative;
          overflow: hidden;
        }
        .hero-bg {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 50% 0%, rgba(196, 146, 74, 0.08) 0%, transparent 70%),
            radial-gradient(ellipse 40% 40% at 80% 80%, rgba(196, 146, 74, 0.05) 0%, transparent 60%);
          pointer-events: none;
        }
        .hero-tag {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: rgba(196, 146, 74, 0.1);
          border: 1px solid rgba(196, 146, 74, 0.25);
          border-radius: 100px;
          padding: 0.4rem 1rem;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #C4924A;
          margin-bottom: 1.75rem;
        }
        .hero-tag::before {
          content: '';
          width: 6px;
          height: 6px;
          background: #C4924A;
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(0.8)} }

        .hero-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(44px, 8vw, 88px);
          font-weight: 400;
          line-height: 1.05;
          letter-spacing: -0.03em;
          color: #2C2417;
          max-width: 900px;
          margin-bottom: 1.5rem;
        }
        .hero-title em {
          font-style: italic;
          color: #C4924A;
        }
        .hero-sub {
          font-size: clamp(15px, 2vw, 18px);
          color: #7A6E62;
          max-width: 520px;
          line-height: 1.7;
          margin-bottom: 2.5rem;
          font-weight: 400;
        }
        .hero-btns {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          justify-content: center;
        }
        .btn-hero-primary {
          background: #2C2417;
          color: #FDFAF6;
          border: none;
          border-radius: 12px;
          padding: 1rem 2.2rem;
          font-size: 14px;
          font-family: 'Nunito', sans-serif;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.25s;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .btn-hero-primary:hover { background: #C4924A; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(196,146,74,0.25); }
        .btn-hero-ghost {
          background: transparent;
          color: #2C2417;
          border: 1.5px solid #D9D0C3;
          border-radius: 12px;
          padding: 1rem 2.2rem;
          font-size: 14px;
          font-family: 'Nunito', sans-serif;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.25s;
        }
        .btn-hero-ghost:hover { border-color: #C4924A; color: #C4924A; }

        .hero-platforms {
          margin-top: 3.5rem;
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          justify-content: center;
        }
        .hero-platforms-label {
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #A89880;
          font-weight: 700;
        }
        .platform-pill {
          background: #FFF;
          border: 1px solid #EDE8DF;
          border-radius: 100px;
          padding: 0.35rem 0.85rem;
          font-size: 11px;
          font-weight: 600;
          color: #6B5F53;
        }

        /* ---- HOW IT WORKS ---- */
        .section {
          padding: 6rem 2rem;
          max-width: 1100px;
          margin: 0 auto;
        }
        .section-tag {
          font-size: 10px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #C4924A;
          font-weight: 700;
          margin-bottom: 0.85rem;
          display: block;
        }
        .section-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(30px, 4vw, 46px);
          font-weight: 400;
          line-height: 1.15;
          margin-bottom: 1rem;
          letter-spacing: -0.02em;
        }
        .section-title em { font-style: italic; color: #C4924A; }
        .section-sub {
          font-size: 16px;
          color: #7A6E62;
          line-height: 1.7;
          max-width: 540px;
          margin-bottom: 3.5rem;
        }

        .steps-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 1.5rem;
        }
        .step-card {
          background: #FFF;
          border: 1px solid #EDE8DF;
          border-radius: 20px;
          padding: 2rem;
          position: relative;
          overflow: hidden;
          transition: all 0.2s;
        }
        .step-card:hover { border-color: #C4924A; box-shadow: 0 8px 32px rgba(196,146,74,0.1); transform: translateY(-2px); }
        .step-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, #C4924A, #E8B86D);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.3s;
        }
        .step-card:hover::before { transform: scaleX(1); }
        .step-num {
          font-family: 'Playfair Display', serif;
          font-size: 52px;
          font-style: italic;
          color: #C4924A;
          opacity: 0.2;
          line-height: 1;
          margin-bottom: 0.5rem;
        }
        .step-icon {
          font-size: 28px;
          margin-bottom: 1rem;
        }
        .step-title {
          font-family: 'Playfair Display', serif;
          font-size: 20px;
          font-weight: 500;
          margin-bottom: 0.6rem;
          letter-spacing: -0.01em;
        }
        .step-desc {
          font-size: 14px;
          color: #7A6E62;
          line-height: 1.65;
        }

        /* ---- FEATURES ---- */
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1rem;
        }
        .feature-card {
          background: linear-gradient(135deg, #FDF6EC, #FBF1E3);
          border: 1px solid #E8D9C0;
          border-radius: 16px;
          padding: 1.5rem;
        }
        .feature-icon { font-size: 24px; margin-bottom: 0.75rem; }
        .feature-title { font-size: 15px; font-weight: 700; margin-bottom: 0.4rem; color: #2C2417; }
        .feature-desc { font-size: 13px; color: #7A6E62; line-height: 1.6; }

        /* ---- DIVIDER ---- */
        .divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, #EDE8DF, transparent);
          margin: 0 2rem;
        }

        /* ---- CATEGORIES STRIP ---- */
        .cats-strip {
          background: #2C2417;
          padding: 4rem 2rem;
          text-align: center;
        }
        .cats-strip .section-tag { color: rgba(196,146,74,0.8); }
        .cats-strip .section-title { color: #FDFAF6; margin-left: auto; margin-right: auto; max-width: 600px; }
        .cats-strip .section-title em { color: #C4924A; }
        .cats-grid {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          justify-content: center;
          margin-top: 2rem;
          max-width: 800px;
          margin-left: auto;
          margin-right: auto;
        }
        .cat-pill {
          background: rgba(253,250,246,0.08);
          border: 1px solid rgba(253,250,246,0.15);
          border-radius: 100px;
          padding: 0.6rem 1.25rem;
          font-size: 13px;
          font-weight: 600;
          color: #FDFAF6;
          display: flex;
          align-items: center;
          gap: 7px;
          transition: all 0.2s;
          cursor: default;
        }
        .cat-pill:hover { background: rgba(196,146,74,0.2); border-color: rgba(196,146,74,0.4); }

        /* ---- SCANNER SECTION ---- */
        .scanner-section {
          padding: 5rem 2rem 6rem;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .scanner-section .section-title { text-align: center; }
        .scanner-section .section-sub { text-align: center; margin-left: auto; margin-right: auto; }
        .scanner-wrap {
          width: 100%;
          max-width: 540px;
          margin-top: 2.5rem;
        }

        /* ---- FOOTER ---- */
        .footer {
          border-top: 1px solid #EDE8DF;
          padding: 2.5rem 2.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .footer-logo {
          font-family: 'Playfair Display', serif;
          font-size: 18px;
          font-style: italic;
          color: #2C2417;
        }
        .footer-logo span { color: #C4924A; }
        .footer-copy {
          font-size: 12px;
          color: #A89880;
        }

        /* ---- SCROLL REVEAL ---- */
        .reveal {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .reveal.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .reveal-delay-1 { transition-delay: 0.1s; }
        .reveal-delay-2 { transition-delay: 0.2s; }
        .reveal-delay-3 { transition-delay: 0.3s; }

        @media (max-width: 600px) {
          .nav { padding: 1rem 1.25rem; }
          .hero { padding: 7rem 1.25rem 4rem; }
          .section { padding: 4rem 1.25rem; }
          .footer { padding: 2rem 1.25rem; }
        }
      `}</style>

      {/* NAV */}
      <nav className="nav">
        <div className="nav-logo">Gem<span>ly</span></div>
        <button className="nav-cta" onClick={scrollToScanner}>Try it free →</button>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg"/>
        <div className="hero-tag">AI-powered shopping</div>
        <h1 className="hero-title">
          Scan anything.<br/>
          Find it <em>cheaper.</em>
        </h1>
        <p className="hero-sub">
          Take a photo of any item — clothes, sneakers, bags, watches — and Gemly finds the best deals across the biggest secondhand platforms worldwide.
        </p>
        <div className="hero-btns">
          <button className="btn-hero-primary" onClick={scrollToScanner}>
            <span>📷</span> Scan an item
          </button>
          <button className="btn-hero-ghost" onClick={scrollToScanner}>
            Search by name
          </button>
        </div>
        <div className="hero-platforms">
          <span className="hero-platforms-label">Searches</span>
          {["Vinted","Grailed","eBay","StockX","Vestiaire","Depop","Marktplaats"].map(p => (
            <span key={p} className="platform-pill">{p}</span>
          ))}
          <span className="platform-pill">+ more</span>
        </div>
      </section>

      <div className="divider"/>

      {/* HOW IT WORKS */}
      <section className="section reveal">
        <span className="section-tag">How it works</span>
        <h2 className="section-title">Three steps to your <em>best deal</em></h2>
        <p className="section-sub">No account needed. No endless scrolling. Just scan and find.</p>
        <div className="steps-grid">
          {[
            { num:"1", icon:"📷", title:"Scan or search", desc:"Upload a photo or type what you're looking for. Our AI identifies the exact item — brand, model, colorway." },
            { num:"2", icon:"🎛️", title:"Set your filters", desc:"Pick new or secondhand, your size, condition, budget, and how far you want to shop." },
            { num:"3", icon:"💎", title:"Get real results", desc:"We search the best platforms instantly and show you real active listings — with direct links." },
          ].map((s, i) => (
            <div key={s.num} className={`step-card reveal reveal-delay-${i+1}`}>
              <div className="step-num">{s.num}</div>
              <div className="step-icon">{s.icon}</div>
              <div className="step-title">{s.title}</div>
              <p className="step-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES STRIP */}
      <div className="cats-strip">
        <span className="section-tag">What you can find</span>
        <h2 className="section-title">From <em>streetwear</em> to vintage watches</h2>
        <div className="cats-grid">
          {["👟 Sneakers","👜 Designer bags","⌚ Watches","👕 Streetwear","💍 Jewelry","🧥 Vintage","👖 Denim","🕶️ Sunglasses","👗 Dresses","🎿 Sportswear"].map(c => (
            <div key={c} className="cat-pill">{c}</div>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <section className="section reveal">
        <span className="section-tag">Why Gemly</span>
        <h2 className="section-title">Built for <em>smart shoppers</em></h2>
        <p className="section-sub">Everything you need to find the item you want, at the price you want to pay.</p>
        <div className="features-grid">
          {[
            { icon:"🔍", title:"AI identification", desc:"Our AI recognizes brands, models, and colorways from a single photo." },
            { icon:"💰", title:"Price estimates", desc:"See the typical resale value before you search so you know if you're getting a deal." },
            { icon:"🗺️", title:"Local hidden gem shops", desc:"We find physical vintage and consignment stores near you that might have what you need." },
            { icon:"🌍", title:"Shop worldwide or local", desc:"Filter by your country, continent, or go global — you decide how far to look." },
            { icon:"📦", title:"Live listings only", desc:"We only show active, available listings — no sold items wasting your time." },
            { icon:"⚡", title:"Instant results", desc:"No account, no sign-up. Just scan and get results in seconds." },
          ].map(f => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <div className="feature-title">{f.title}</div>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="divider"/>

      {/* SCANNER EMBED */}
      <section className="scanner-section" ref={scannerRef}>
        <span className="section-tag">Try it now</span>
        <h2 className="section-title">Find your <em>next gem</em></h2>
        <p className="section-sub">Scan a photo or search by name — completely free, no account needed.</p>
        <div className="scanner-wrap">
          <Scanner/>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-logo">Gem<span>ly</span></div>
        <p className="footer-copy">© 2026 Gemly — Scan anything, find it cheaper.</p>
      </footer>

      {/* Scroll reveal script */}
      <script dangerouslySetInnerHTML={{__html: `
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
        }, { threshold: 0.1 });
        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
      `}}/>
    </>
  );
}
