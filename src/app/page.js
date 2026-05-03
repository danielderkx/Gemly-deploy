'use client';
import { useRef, useEffect } from "react";
import Scanner from "./Scanner";

export default function Home() {
  const scannerRef = useRef(null);

  const scrollToScanner = () => {
    scannerRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.08 });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400;1,500;1,700&family=Nunito:wght@300;400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #FDFAF6; font-family: 'Nunito', sans-serif; color: #2C2417; overflow-x: hidden; }

        /* NAV */
        .gn {
          position: fixed; top: 0; left: 0; right: 0; z-index: 200;
          display: flex; align-items: center; justify-content: space-between;
          padding: 1.1rem 2.5rem;
          background: rgba(253,250,246,0.88); backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(237,232,223,0.7);
        }
        .gn-logo { font-family:'Playfair Display',serif; font-size:21px; font-style:italic; font-weight:500; color:#2C2417; letter-spacing:-.02em; }
        .gn-logo b { color:#C4924A; font-weight:500; }
        .gn-btn { background:#2C2417; color:#FDFAF6; border:none; border-radius:10px; padding:.6rem 1.3rem; font-size:12px; font-family:'Nunito',sans-serif; font-weight:700; letter-spacing:.1em; text-transform:uppercase; cursor:pointer; transition:all .2s; }
        .gn-btn:hover { background:#C4924A; }

        /* HERO */
        .hero {
          min-height: 100vh;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          text-align: center; padding: 9rem 1.5rem 5rem;
          position: relative; overflow: hidden;
        }
        .hero-glow {
          position: absolute; inset: 0; pointer-events: none;
          background:
            radial-gradient(ellipse 70% 50% at 50% -10%, rgba(196,146,74,.12) 0%, transparent 65%),
            radial-gradient(ellipse 50% 40% at 10% 90%, rgba(196,146,74,.06) 0%, transparent 60%),
            radial-gradient(ellipse 40% 35% at 90% 60%, rgba(196,146,74,.05) 0%, transparent 60%);
        }
        .hero-grain {
          position: absolute; inset: 0; pointer-events: none; opacity: .025;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
        }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(196,146,74,.1); border: 1px solid rgba(196,146,74,.25);
          border-radius: 100px; padding: .35rem .9rem;
          font-size: 10px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; color: #C4924A;
          margin-bottom: 1.5rem; position: relative;
        }
        .hero-badge-dot { width:6px; height:6px; background:#C4924A; border-radius:50%; animation:bdot 2s ease-in-out infinite; }
        @keyframes bdot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.3;transform:scale(.7)} }

        .hero-h1 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(46px, 9vw, 96px);
          font-weight: 400; line-height: 1.02; letter-spacing: -.035em;
          max-width: 880px; margin-bottom: 1.25rem; position: relative;
        }
        .hero-h1 em { font-style: italic; color: #C4924A; }

        .hero-sub {
          font-size: clamp(15px, 2vw, 17px); color: #7A6E62; max-width: 480px;
          line-height: 1.75; margin-bottom: 2.25rem; position: relative;
        }

        .hero-actions { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; position: relative; }
        .ha-primary {
          background: #2C2417; color: #FDFAF6; border: none; border-radius: 12px;
          padding: .9rem 2rem; font-size: 13px; font-family: 'Nunito',sans-serif;
          font-weight: 700; letter-spacing: .1em; text-transform: uppercase;
          cursor: pointer; transition: all .25s; display: flex; align-items: center; gap: 7px;
        }
        .ha-primary:hover { background: #C4924A; transform: translateY(-2px); box-shadow: 0 10px 28px rgba(196,146,74,.28); }
        .ha-ghost {
          background: transparent; color: #2C2417; border: 1.5px solid #D9D0C3;
          border-radius: 12px; padding: .9rem 2rem; font-size: 13px;
          font-family: 'Nunito',sans-serif; font-weight: 600; letter-spacing: .1em;
          text-transform: uppercase; cursor: pointer; transition: all .25s;
        }
        .ha-ghost:hover { border-color: #C4924A; color: #C4924A; }

        .hero-platforms {
          margin-top: 3rem; display: flex; align-items: center; gap: 8px;
          flex-wrap: wrap; justify-content: center; position: relative;
        }
        .hp-label { font-size: 10px; letter-spacing: .2em; text-transform: uppercase; color: #B0A498; font-weight: 700; margin-right: 4px; }
        .hp-pill {
          background: #FFF; border: 1px solid #EDE8DF; border-radius: 100px;
          padding: .28rem .75rem; font-size: 11px; font-weight: 600; color: #6B5F53;
          transition: all .15s;
        }
        .hp-pill:hover { border-color: #C4924A; color: #C4924A; }

        /* MARQUEE STRIP */
        .marquee-wrap {
          overflow: hidden; border-top: 1px solid #EDE8DF; border-bottom: 1px solid #EDE8DF;
          background: #FFF; padding: .85rem 0;
        }
        .marquee-track {
          display: flex; gap: 0; width: max-content;
          animation: marquee 22s linear infinite;
        }
        .marquee-track:hover { animation-play-state: paused; }
        @keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }
        .marquee-item {
          display: flex; align-items: center; gap: 6px; padding: 0 2rem;
          font-size: 12px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase;
          color: #A89880; white-space: nowrap;
        }
        .marquee-item span { color: #C4924A; font-size: 14px; }
        .marquee-dot { width: 3px; height: 3px; background: #D9D0C3; border-radius: 50%; margin-left: 2rem; }

        /* HOW IT WORKS */
        .section { display: block; width: 100%; }
        .how { padding: 7rem 2rem; max-width: 1100px; margin: 0 auto; }
        .s-label { font-size: 10px; letter-spacing: .22em; text-transform: uppercase; color: #C4924A; font-weight: 700; margin-bottom: .8rem; display: block; }
        .s-title { font-family:'Playfair Display',serif; font-size: clamp(28px,4vw,44px); font-weight:400; line-height:1.15; letter-spacing:-.02em; margin-bottom:.85rem; }
        .s-title em { font-style:italic; color:#C4924A; }
        .s-sub { font-size:15px; color:#7A6E62; line-height:1.7; max-width:460px; margin-bottom:3rem; }

        .steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; }
        @media(max-width:700px) { .steps { grid-template-columns: 1fr; } }
        .step {
          position: relative; background: #FFF; border: 1px solid #EDE8DF;
          border-radius: 20px; padding: 2rem 1.75rem; overflow: hidden;
          transition: all .25s;
        }
        .step:hover { border-color: #C4924A; box-shadow: 0 12px 40px rgba(196,146,74,.1); transform: translateY(-3px); }
        .step-line {
          position: absolute; top: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg,#C4924A,#E8B86D);
          transform: scaleX(0); transform-origin: left; transition: transform .3s;
        }
        .step:hover .step-line { transform: scaleX(1); }
        .step-n {
          font-family:'Playfair Display',serif; font-size:60px; font-style:italic;
          color:#C4924A; opacity:.15; line-height:1; margin-bottom:.25rem;
        }
        .step-ico { font-size:30px; margin-bottom:.85rem; }
        .step-t { font-family:'Playfair Display',serif; font-size:19px; font-weight:500; margin-bottom:.5rem; }
        .step-d { font-size:13px; color:#7A6E62; line-height:1.65; }

        /* DARK BAND */
        .dark-band {
          display: block; background: #2C2417; padding: 5rem 2rem;
          text-align: center; position: relative; overflow: hidden;
        }
        .dark-band::before {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(ellipse 60% 80% at 50% 50%, rgba(196,146,74,.08) 0%, transparent 70%);
        }
        .dark-band .s-label { color: rgba(196,146,74,.7); }
        .dark-band .s-title { color: #FDFAF6; max-width: 620px; margin-left: auto; margin-right: auto; }
        .cats-row {
          display: flex; flex-wrap: wrap; gap: 8px;
          justify-content: center; margin-top: 2rem;
          max-width: 780px; margin-left: auto; margin-right: auto;
        }
        .cat {
          background: rgba(253,250,246,.07); border: 1px solid rgba(253,250,246,.12);
          border-radius: 100px; padding: .55rem 1.15rem;
          font-size: 13px; font-weight: 600; color: #FDFAF6;
          display: flex; align-items: center; gap: 6px;
          transition: all .2s; cursor: default;
        }
        .cat:hover { background: rgba(196,146,74,.18); border-color: rgba(196,146,74,.4); }

        /* FEATURES */
        .feat-section { padding: 7rem 2rem; max-width: 1100px; margin: 0 auto; }
        .feat-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1rem; }
        @media(max-width:700px) { .feat-grid { grid-template-columns: 1fr 1fr; } }
        @media(max-width:480px) { .feat-grid { grid-template-columns: 1fr; } }
        .feat {
          background: linear-gradient(140deg,#FDF6EC,#FBF1E3);
          border: 1px solid #E8D9C0; border-radius: 16px; padding: 1.5rem;
          transition: all .2s;
        }
        .feat:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(196,146,74,.1); }
        .feat-ico { font-size: 26px; margin-bottom: .7rem; }
        .feat-t { font-size: 14px; font-weight: 700; margin-bottom: .35rem; color: #2C2417; }
        .feat-d { font-size: 12px; color: #7A6E62; line-height: 1.6; }

        /* DIVIDER */
        .div-line { height: 1px; background: linear-gradient(90deg,transparent,#EDE8DF,transparent); display: block; }

        /* CTA BAND */
        .cta-band {
          display: block; padding: 5rem 2rem;
          background: linear-gradient(135deg,#FDF6EC 0%,#FBF1E3 100%);
          border-top: 1px solid #E8D9C0; border-bottom: 1px solid #E8D9C0;
          text-align: center;
        }
        .cta-band .s-title { margin-left: auto; margin-right: auto; max-width: 560px; }
        .cta-band .s-sub { margin-left: auto; margin-right: auto; }

        /* SCANNER SECTION */
        .scan-section {
          display: block; padding: 6rem 2rem 7rem;
          background: #FDFAF6; text-align: center;
        }
        .scan-inner { max-width: 540px; margin: 0 auto; }
        .scan-inner .s-sub { margin-left: auto; margin-right: auto; }

        /* FOOTER */
        .footer {
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 1rem;
          padding: 2rem 2.5rem;
          border-top: 1px solid #EDE8DF;
        }
        .footer-logo { font-family:'Playfair Display',serif; font-size:18px; font-style:italic; color:#2C2417; }
        .footer-logo b { color:#C4924A; font-weight:400; }
        .footer-copy { font-size:12px; color:#A89880; }

        /* REVEAL */
        .reveal { opacity:0; transform:translateY(20px); transition:opacity .65s ease,transform .65s ease; }
        .reveal.visible { opacity:1; transform:translateY(0); }
        .reveal-1 { transition-delay:.08s; }
        .reveal-2 { transition-delay:.16s; }
        .reveal-3 { transition-delay:.24s; }

        @media(max-width:600px) {
          .gn { padding:1rem 1.25rem; }
          .hero { padding:7rem 1.25rem 4rem; }
          .how, .feat-section { padding:4rem 1.25rem; }
          .footer { padding:1.5rem 1.25rem; }
        }
      `}</style>

      {/* NAV */}
      <nav className="gn">
        <div className="gn-logo">Gem<b>ly</b></div>
        <button className="gn-btn" onClick={scrollToScanner}>Try it free →</button>
      </nav>

      {/* HERO */}
      <div style={{display:'block'}}>
        <section className="hero">
          <div className="hero-glow"/>
          <div className="hero-grain"/>
          <div className="hero-badge">
            <span className="hero-badge-dot"/>
            AI-powered deal finder
          </div>
          <h1 className="hero-h1">
            Scan anything.<br/>Find it <em>cheaper.</em>
          </h1>
          <p className="hero-sub">
            Take a photo of any item — clothes, sneakers, bags, watches — and Gemly finds the best deals across the biggest platforms worldwide.
          </p>
          <div className="hero-actions">
            <button className="ha-primary" onClick={scrollToScanner}>
              <span>📷</span> Scan an item
            </button>
            <button className="ha-ghost" onClick={scrollToScanner}>
              Search by name
            </button>
          </div>
          <div className="hero-platforms">
            <span className="hp-label">Searches</span>
            {["Vinted","Grailed","StockX","Vestiaire","eBay","Depop","Marktplaats","GOAT"].map(p=>(
              <span key={p} className="hp-pill">{p}</span>
            ))}
          </div>
        </section>

        {/* MARQUEE */}
        <div className="marquee-wrap">
          <div className="marquee-track">
            {[...Array(2)].map((_,ri)=>(
              <div key={ri} style={{display:'flex'}}>
                {["👟 Sneakers","👜 Designer Bags","⌚ Watches","👕 Streetwear","💍 Jewelry","🧥 Vintage","🕶️ Sunglasses","👖 Denim","🧢 Caps","👗 Dresses","🎿 Sportswear","🪡 Accessories"].map((item,i)=>(
                  <div key={i} style={{display:'flex',alignItems:'center'}}>
                    <div className="marquee-item"><span>{item.split(' ')[0]}</span>{item.split(' ').slice(1).join(' ')}</div>
                    <div className="marquee-dot"/>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* HOW IT WORKS */}
        <div className="section">
          <div className="how reveal">
            <span className="s-label">How it works</span>
            <h2 className="s-title">Three steps to your <em>best deal</em></h2>
            <p className="s-sub">No account needed. No endless scrolling. Just scan and find.</p>
            <div className="steps">
              {[
                {n:"1",ico:"📷",t:"Scan or search",d:"Upload a photo or type what you're looking for. Our AI identifies the exact item — brand, model, colorway and all."},
                {n:"2",ico:"🎛️",t:"Set your filters",d:"Pick new or secondhand, your size, condition, budget, and how far you want to shop — local, Europe, or worldwide."},
                {n:"3",ico:"💎",t:"Get real results",d:"We search the best platforms instantly and return active listings with direct links. No sold items, no dead ends."},
              ].map((s,i)=>(
                <div key={s.n} className={`step reveal reveal-${i+1}`}>
                  <div className="step-line"/>
                  <div className="step-n">{s.n}</div>
                  <div className="step-ico">{s.ico}</div>
                  <div className="step-t">{s.t}</div>
                  <p className="step-d">{s.d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* DARK BAND — CATEGORIES */}
        <div className="dark-band section">
          <span className="s-label">What you can find</span>
          <h2 className="s-title">From <em>streetwear</em> to vintage watches</h2>
          <div className="cats-row">
            {["👟 Sneakers","👜 Designer bags","⌚ Watches","👕 Streetwear","💍 Jewelry","🧥 Vintage","🕶️ Sunglasses","👖 Denim","🧢 Caps","👗 Dresses"].map(c=>(
              <div key={c} className="cat">{c}</div>
            ))}
          </div>
        </div>

        {/* FEATURES */}
        <div className="section">
          <div className="feat-section reveal">
            <span className="s-label">Why Gemly</span>
            <h2 className="s-title">Built for <em>smart shoppers</em></h2>
            <p className="s-sub">Everything you need to find the item you want, at the price you want to pay.</p>
            <div className="feat-grid">
              {[
                {ico:"🔍",t:"AI identification",d:"Recognizes brands, models, and colorways from a single photo — even rare or niche items."},
                {ico:"💰",t:"Price estimates",d:"See the typical resale value before you search so you know if you're getting a good deal."},
                {ico:"🗺️",t:"Hidden gem shops",d:"Find physical vintage and consignment stores near you that might have what you need."},
                {ico:"🌍",t:"Local or worldwide",d:"Filter by your country, continent, or go global — you decide how far to look."},
                {ico:"📦",t:"Live listings only",d:"We only show active, available listings — no sold items or dead links."},
                {ico:"⚡",t:"Instant & free",d:"No account, no sign-up. Just scan and get results in seconds."},
              ].map(f=>(
                <div key={f.t} className="feat">
                  <div className="feat-ico">{f.ico}</div>
                  <div className="feat-t">{f.t}</div>
                  <p className="feat-d">{f.d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="div-line"/>

        {/* SCANNER SECTION */}
        <div className="scan-section" ref={scannerRef}>
          <div className="scan-inner">
            <span className="s-label">Try it now</span>
            <h2 className="s-title reveal">Find your <em>next gem</em></h2>
            <p className="s-sub reveal" style={{marginLeft:'auto',marginRight:'auto',textAlign:'center',marginBottom:'2rem'}}>
              Completely free, no account needed.
            </p>
            <Scanner/>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="footer">
          <div className="footer-logo">Gem<b>ly</b></div>
          <p className="footer-copy">© 2026 Gemly — Scan anything, find it cheaper.</p>
        </footer>
      </div>
    </>
  );
}
