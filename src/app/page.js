'use client';
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const go = () => router.push("/scan");
  const [recentSearches, setRecentSearches] = useState([]);
  const [searchCount, setSearchCount] = useState(0);

  useEffect(() => {
    // Load recent searches from localStorage
    try {
      const searches = JSON.parse(localStorage.getItem("gemly_recent_searches") || "[]");
      setRecentSearches(searches);
      const count = parseInt(localStorage.getItem("gemly_search_count") || "0");
      setSearchCount(count);
    } catch {}

    const els = document.querySelectorAll('.rv');
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('vis'); });
    }, { threshold: 0.08 });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const S = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400;1,500;1,700&family=Nunito:wght@300;400;500;600;700&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    html{scroll-behavior:smooth;}
    body{background:#FDFAF6;font-family:'Nunito',sans-serif;color:#2C2417;overflow-x:hidden;}
    #__next,main{display:block!important;float:none!important;}

    /* NAV */
    .gn{position:fixed;top:0;left:0;right:0;z-index:200;display:flex;align-items:center;justify-content:space-between;padding:1.1rem 2.5rem;background:rgba(253,250,246,.9);backdrop-filter:blur(16px);border-bottom:1px solid rgba(237,232,223,.7);}
    .gn-logo{font-family:'Playfair Display',serif;font-size:21px;font-style:italic;color:#2C2417;cursor:pointer;letter-spacing:-.02em;}
    .gn-logo b{color:#C4924A;font-weight:400;}
    .gn-btn{background:#2C2417;color:#FDFAF6;border:none;border-radius:10px;padding:.6rem 1.3rem;font-size:12px;font-family:'Nunito',sans-serif;font-weight:700;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;transition:all .2s;}
    .gn-btn:hover{background:#C4924A;}

    /* PAGE WRAPPER — forces vertical stacking */
    .page{display:block;width:100%;margin:0;padding:0;}

    /* HERO */
    .hero{display:block;width:100%;min-height:100vh;padding:9rem 1.5rem 5rem;text-align:center;position:relative;overflow:hidden;background:#FDFAF6;}
    .hero-glow{position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse 70% 50% at 50% -10%,rgba(196,146,74,.12) 0%,transparent 65%),radial-gradient(ellipse 50% 40% at 10% 90%,rgba(196,146,74,.06) 0%,transparent 60%);}
    .hero-inner{position:relative;display:flex;flex-direction:column;align-items:center;}
    .badge{display:inline-flex;align-items:center;gap:6px;background:rgba(196,146,74,.1);border:1px solid rgba(196,146,74,.25);border-radius:100px;padding:.35rem .9rem;font-size:10px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:#C4924A;margin-bottom:1.5rem;}
    .bdot{width:6px;height:6px;background:#C4924A;border-radius:50%;animation:bdot 2s ease-in-out infinite;}
    @keyframes bdot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.3;transform:scale(.7)}}
    .h1{font-family:'Playfair Display',serif;font-size:clamp(46px,9vw,96px);font-weight:400;line-height:1.02;letter-spacing:-.035em;max-width:880px;margin-bottom:1.25rem;}
    .h1 em{font-style:italic;color:#C4924A;}
    .sub{font-size:clamp(15px,2vw,17px);color:#7A6E62;max-width:480px;line-height:1.75;margin-bottom:2.25rem;}
    .btns{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;}
    .bp{background:#2C2417;color:#FDFAF6;border:none;border-radius:12px;padding:.9rem 2rem;font-size:13px;font-family:'Nunito',sans-serif;font-weight:700;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;transition:all .25s;display:flex;align-items:center;gap:7px;}
    .bp:hover{background:#C4924A;transform:translateY(-2px);box-shadow:0 10px 28px rgba(196,146,74,.28);}
    .bg{background:transparent;color:#2C2417;border:1.5px solid #D9D0C3;border-radius:12px;padding:.9rem 2rem;font-size:13px;font-family:'Nunito',sans-serif;font-weight:600;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;transition:all .25s;}
    .bg:hover{border-color:#C4924A;color:#C4924A;}
    .plats{margin-top:3rem;display:flex;align-items:center;gap:8px;flex-wrap:wrap;justify-content:center;}
    .pl{font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:#B0A498;font-weight:700;margin-right:4px;}
    .pp{background:#FFF;border:1px solid #EDE8DF;border-radius:100px;padding:.28rem .75rem;font-size:11px;font-weight:600;color:#6B5F53;}
    .social-proof{display:inline-flex;align-items:center;gap:8px;background:#FFF;border:1px solid #EDE8DF;border-radius:100px;padding:.4rem 1.1rem;font-size:12px;font-weight:600;color:#2C2417;margin-bottom:1.25rem;}
    .sp-dot{width:8px;height:8px;background:#22C55E;border-radius:50%;flex-shrink:0;}
    .recent-strip{display:block;width:100%;background:#FDFAF6;border-bottom:1px solid #EDE8DF;padding:.7rem 2rem;}
    .recent-inner{max-width:1100px;margin:0 auto;display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
    .recent-label{font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:#A89880;font-weight:700;white-space:nowrap;margin-right:4px;}
    .recent-pill{background:#FFF;border:1px solid #EDE8DF;border-radius:100px;padding:.25rem .75rem;font-size:11px;font-weight:600;color:#6B5F53;cursor:pointer;transition:all .15s;white-space:nowrap;}
    .recent-pill:hover{border-color:#C4924A;color:#C4924A;}

    /* MARQUEE */
    .mq{display:block;width:100%;overflow:hidden;border-top:1px solid #EDE8DF;border-bottom:1px solid #EDE8DF;background:#FFF;padding:.85rem 0;}
    .mq-track{display:flex;width:max-content;animation:mq 22s linear infinite;}
    @keyframes mq{from{transform:translateX(0)}to{transform:translateX(-50%)}}
    .mq-item{display:flex;align-items:center;gap:6px;padding:0 2rem;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#A89880;white-space:nowrap;}
    .mq-item span{color:#C4924A;font-size:14px;}
    .mq-dot{width:3px;height:3px;background:#D9D0C3;border-radius:50%;margin-left:2rem;}

    /* SECTIONS */
    .sec{display:block;width:100%;padding:7rem 2rem;}
    .sec-inner{max-width:1100px;margin:0 auto;}
    .lbl{font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:#C4924A;font-weight:700;margin-bottom:.8rem;display:block;}
    .ttl{font-family:'Playfair Display',serif;font-size:clamp(28px,4vw,44px);font-weight:400;line-height:1.15;letter-spacing:-.02em;margin-bottom:.85rem;}
    .ttl em{font-style:italic;color:#C4924A;}
    .stxt{font-size:15px;color:#7A6E62;line-height:1.7;max-width:460px;margin-bottom:3rem;}

    /* STEPS */
    .steps{display:grid;grid-template-columns:repeat(3,1fr);gap:1.25rem;}
    @media(max-width:700px){.steps{grid-template-columns:1fr;}}
    .step{position:relative;background:#FFF;border:1px solid #EDE8DF;border-radius:20px;padding:2rem 1.75rem;overflow:hidden;transition:all .25s;}
    .step:hover{border-color:#C4924A;box-shadow:0 12px 40px rgba(196,146,74,.1);transform:translateY(-3px);}
    .step-bar{position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#C4924A,#E8B86D);transform:scaleX(0);transform-origin:left;transition:transform .3s;}
    .step:hover .step-bar{transform:scaleX(1);}
    .sn{font-family:'Playfair Display',serif;font-size:60px;font-style:italic;color:#C4924A;opacity:.15;line-height:1;margin-bottom:.25rem;}
    .si{font-size:30px;margin-bottom:.85rem;}
    .st{font-family:'Playfair Display',serif;font-size:19px;font-weight:500;margin-bottom:.5rem;}
    .sd{font-size:13px;color:#7A6E62;line-height:1.65;}

    /* DARK BAND */
    .dark{display:block;width:100%;background:#2C2417;padding:5rem 2rem;text-align:center;position:relative;overflow:hidden;}
    .dark::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 60% 80% at 50% 50%,rgba(196,146,74,.08) 0%,transparent 70%);}
    .dark .lbl{color:rgba(196,146,74,.8);}
    .dark .ttl{color:#FDFAF6;max-width:620px;margin-left:auto;margin-right:auto;}
    .cats{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-top:2rem;max-width:780px;margin-left:auto;margin-right:auto;position:relative;}
    .cat{background:rgba(253,250,246,.07);border:1px solid rgba(253,250,246,.12);border-radius:100px;padding:.55rem 1.15rem;font-size:13px;font-weight:600;color:#FDFAF6;display:flex;align-items:center;gap:6px;transition:all .2s;cursor:default;}
    .cat:hover{background:rgba(196,146,74,.18);border-color:rgba(196,146,74,.4);}

    /* FEATURES */
    .fg{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;}
    @media(max-width:700px){.fg{grid-template-columns:1fr 1fr;}}
    @media(max-width:480px){.fg{grid-template-columns:1fr;}}
    .fc{background:linear-gradient(140deg,#FDF6EC,#FBF1E3);border:1px solid #E8D9C0;border-radius:16px;padding:1.5rem;transition:all .2s;}
    .fc:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(196,146,74,.1);}
    .fi{font-size:26px;margin-bottom:.7rem;}
    .ft{font-size:14px;font-weight:700;margin-bottom:.35rem;color:#2C2417;}
    .fd{font-size:12px;color:#7A6E62;line-height:1.6;}

    /* CTA BAND */
    .cta{display:block;width:100%;background:#2C2417;padding:7rem 2rem;text-align:center;position:relative;overflow:hidden;}
    .cta::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 50% 60% at 50% 50%,rgba(196,146,74,.12) 0%,transparent 70%);}
    .cta .ttl{color:#FDFAF6;max-width:600px;margin:0 auto 1rem;position:relative;}
    .cta .stxt{color:rgba(253,250,246,.6);margin:0 auto 2.5rem;text-align:center;position:relative;}
    .cta-btn{position:relative;background:#C4924A;color:#FDFAF6;border:none;border-radius:14px;padding:1.1rem 2.8rem;font-size:15px;font-family:'Nunito',sans-serif;font-weight:700;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;transition:all .25s;}
    .cta-btn:hover{background:#E8B86D;transform:translateY(-2px);box-shadow:0 12px 32px rgba(196,146,74,.4);}

    /* FOOTER */
    .foot{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;padding:2rem 2.5rem;border-top:1px solid #EDE8DF;}
    .foot-logo{font-family:'Playfair Display',serif;font-size:18px;font-style:italic;color:#2C2417;}
    .foot-logo b{color:#C4924A;font-weight:400;}
    .foot-copy{font-size:12px;color:#A89880;}

    /* REVEAL */
    .rv{opacity:0;transform:translateY(20px);transition:opacity .65s ease,transform .65s ease;}
    .rv.vis{opacity:1;transform:translateY(0);}
    .d1{transition-delay:.08s;}.d2{transition-delay:.16s;}.d3{transition-delay:.24s;}

    @media(max-width:600px){
      .gn{padding:1rem 1.25rem;}
      .sec{padding:4rem 1.25rem;}
      .foot{padding:1.5rem 1.25rem;}
    }
  `;

  const marqueeItems = ["👟 Sneakers","👜 Designer Bags","⌚ Watches","👕 Streetwear","💍 Jewelry","🧥 Vintage","🕶️ Sunglasses","👖 Denim","🧢 Caps","👗 Dresses","🎿 Sportswear","🪡 Accessories"];

  return (
    <>
      <style>{S}</style>

      <nav className="gn">
        <div className="gn-logo">Gem<b>ly</b></div>
        <button className="gn-btn" onClick={go}>Try it free →</button>
      </nav>

      <div className="page">

        {/* HERO */}
        <section className="hero">
          <div className="hero-glow"/>
          <div className="hero-inner">
            <div className="badge"><span className="bdot"/>AI-powered deal finder</div>
            {(searchCount > 0) && (
              <div className="social-proof">
                <span className="sp-dot"/>
                {searchCount > 50 ? `${searchCount}+ searches completed` : "Be among the first to try Gemly"}
              </div>
            )}
            <h1 className="h1">Scan anything.<br/>Find it <em>cheaper.</em></h1>
            <p className="sub">Take a photo of any item — clothes, sneakers, bags, watches — and Gemly finds the best deals across the biggest platforms worldwide.</p>
            <div className="btns">
              <button className="bp" onClick={go}><span>📷</span> Scan an item</button>
              <button className="bg" onClick={go}>Search by name</button>
            </div>
            <div className="plats">
              <span className="pl">Searches</span>
              {["Vinted","Grailed","StockX","Vestiaire","eBay","Depop","Marktplaats","GOAT"].map(p=>(
                <span key={p} className="pp">{p}</span>
              ))}
            </div>
          </div>
        </section>

        {/* MARQUEE */}
        <div className="mq">
          <div className="mq-track">
            {[...Array(2)].map((_,ri)=>(
              <div key={ri} style={{display:'flex'}}>
                {marqueeItems.map((item,i)=>(
                  <div key={i} style={{display:'flex',alignItems:'center'}}>
                    <div className="mq-item"><span>{item.split(' ')[0]}</span>{item.split(' ').slice(1).join(' ')}</div>
                    <div className="mq-dot"/>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* RECENT SEARCHES */}
        {recentSearches.length > 0 && (
          <div className="recent-strip">
            <div className="recent-inner">
              <span className="recent-label">Others searched</span>
              {recentSearches.slice(0, 8).map((s, i) => (
                <span key={i} className="recent-pill" onClick={go}>🔍 {s}</span>
              ))}
            </div>
          </div>
        )}

        {/* HOW IT WORKS */}
        <section className="sec">
          <div className="sec-inner rv">
            <span className="lbl">How it works</span>
            <h2 className="ttl">Three steps to your <em>best deal</em></h2>
            <p className="stxt">No account needed. No endless scrolling. Just scan and find.</p>
            <div className="steps">
              {[
                {n:"1",i:"📷",t:"Scan or search",d:"Upload a photo or type what you're looking for. Our AI identifies the exact item — brand, model, colorway."},
                {n:"2",i:"🎛️",t:"Set your filters",d:"Pick new or secondhand, your size, condition, budget, and how far you want to shop."},
                {n:"3",i:"💎",t:"Get real results",d:"We search the best platforms instantly and return active listings with direct links. No sold items."},
              ].map((s,idx)=>(
                <div key={s.n} className={`step rv d${idx+1}`}>
                  <div className="step-bar"/>
                  <div className="sn">{s.n}</div>
                  <div className="si">{s.i}</div>
                  <div className="st">{s.t}</div>
                  <p className="sd">{s.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CATEGORIES DARK BAND */}
        <div className="dark">
          <span className="lbl">What you can find</span>
          <h2 className="ttl">From <em>streetwear</em> to vintage watches</h2>
          <div className="cats">
            {["👟 Sneakers","👜 Designer bags","⌚ Watches","👕 Streetwear","💍 Jewelry","🧥 Vintage","🕶️ Sunglasses","👖 Denim","🧢 Caps","👗 Dresses"].map(c=>(
              <div key={c} className="cat">{c}</div>
            ))}
          </div>
        </div>

        {/* FEATURES */}
        <section className="sec">
          <div className="sec-inner rv">
            <span className="lbl">Why Gemly</span>
            <h2 className="ttl">Built for <em>smart shoppers</em></h2>
            <p className="stxt">Everything you need to find the item you want, at the price you want to pay.</p>
            <div className="fg">
              {[
                {i:"🔍",t:"AI identification",d:"Recognizes brands, models, and colorways from a single photo — even rare or niche items."},
                {i:"💰",t:"Price estimates",d:"See the typical resale value before you search so you know if you're getting a good deal."},
                {i:"🗺️",t:"Hidden gem shops",d:"Find physical vintage and consignment stores near you that might have what you need."},
                {i:"🌍",t:"Local or worldwide",d:"Filter by your country, continent, or go global — you decide how far to look."},
                {i:"📦",t:"Live listings only",d:"Only active, available listings — no sold items or dead links."},
                {i:"⚡",t:"Instant & free",d:"No account, no sign-up. Just scan and get results in seconds."},
              ].map(f=>(
                <div key={f.t} className="fc">
                  <div className="fi">{f.i}</div>
                  <div className="ft">{f.t}</div>
                  <p className="fd">{f.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <div className="cta">
          <span className="lbl" style={{color:'rgba(196,146,74,.8)',position:'relative'}}>Ready?</span>
          <h2 className="ttl">Find your <em>next gem</em></h2>
          <p className="stxt">Completely free. No account needed.</p>
          <button className="cta-btn" onClick={go}>Start scanning →</button>
        </div>

        {/* FOOTER */}
        <footer className="foot">
          <div className="foot-logo">Gem<b>ly</b></div>
          <p className="foot-copy">© 2026 Gemly — Scan anything, find it cheaper.</p>
        </footer>

      </div>
    </>
  );
}
