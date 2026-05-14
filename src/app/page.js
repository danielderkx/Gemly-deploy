'use client';
import { useEffect, useState } from 'react';

export default function LandingPage() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 80); }, []);

  return (
    <div style={{ margin:0, padding:0, background:'#fff', minHeight:'100vh', fontFamily:"'Outfit', sans-serif", color:'#1A1612' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@200;300;400;500&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

        .nav-link { font-family:'Outfit',sans-serif; font-size:12px; font-weight:300; letter-spacing:.18em; text-transform:uppercase; color:#999; text-decoration:none; transition:color .2s; }
        .nav-link:hover { color:#1A1612; }
        .cta-btn { display:inline-block; font-family:'Outfit',sans-serif; font-size:11px; font-weight:300; letter-spacing:.22em; text-transform:uppercase; color:#1A1612; background:transparent; border:1px solid #C8C0B4; text-decoration:none; padding:13px 32px; transition:background .2s, color .2s; }
        .cta-btn:hover { background:#1A1612; color:#fff; border-color:#1A1612; }
        .feature-item { border-top:1px solid #EDEAE4; padding:2rem 0; }

        /* Mobile */
        @media (max-width: 680px) {
          .hero-grid { grid-template-columns: 1fr !important; padding: 3rem 1.5rem !important; gap: 3rem !important; }
          .phone-wrap { display: flex; justify-content: center; }
          .nav-inner { padding: 1.25rem 1.5rem !important; }
          .nav-links { gap: 1.5rem !important; }
          .how-section { padding: 3rem 1.5rem !important; }
          .cta-section { padding: 3rem 1.5rem !important; }
          .footer-inner { padding: 1.25rem 1.5rem !important; }
          .feature-item { gap: 1.5rem !important; }
        }
      `}</style>

      {/* Nav */}
      <nav>
        <div className="nav-inner" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'1.75rem 2.5rem', borderBottom:'1px solid #EDEAE4' }}>
          <div style={{ fontSize:16, fontWeight:400, letterSpacing:'.12em', textTransform:'uppercase' }}>Gemly</div>
          <div className="nav-links" style={{ display:'flex', gap:'2.5rem', alignItems:'center' }}>
            <a href="#how" className="nav-link">How it works</a>
            <a href="/login" className="nav-link">Sign in</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="hero-grid" style={{ background:'#F0EBE2', padding:'5rem 2.5rem', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'4rem', alignItems:'center', opacity:visible?1:0, transition:'opacity .9s ease' }}>

        {/* Left */}
        <div>
          <p style={{ fontSize:11, fontWeight:300, letterSpacing:'.28em', textTransform:'uppercase', color:'#9A8E80', marginBottom:'1.5rem' }}>Scan & Find</p>
          <h1 style={{ fontWeight:200, fontSize:'clamp(32px,5.5vw,62px)', lineHeight:1.1, letterSpacing:'-.02em', color:'#1A1612', marginBottom:'1.25rem' }}>
            Point your camera.<br />Find it anywhere.
          </h1>
          <p style={{ fontSize:14, fontWeight:300, color:'#8A8070', lineHeight:1.8, marginBottom:'2.5rem', maxWidth:380 }}>
            Scan any item and find the best secondhand deal — or new if nothing's available. Across every major platform, filtered to you.
          </p>
          <a href="/scan" className="cta-btn">Start scanning</a>
        </div>

        {/* Right — phone mockup */}
        <div className="phone-wrap">
          <div style={{ position:'relative', width:240, height:480 }}>
            <div style={{ position:'absolute', inset:0, background:'#1A1612', borderRadius:40, boxShadow:'0 40px 80px rgba(0,0,0,.15), 0 8px 24px rgba(0,0,0,.1)' }} />
            <div style={{ position:'absolute', top:14, left:12, right:12, bottom:14, background:'#FDFAF6', borderRadius:30, overflow:'hidden', display:'flex', flexDirection:'column' }}>
              <div style={{ background:'#FDFAF6', padding:'12px 20px 6px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontSize:10, fontWeight:400, color:'#1A1612' }}>9:41</span>
                <div style={{ width:60, height:16, background:'#1A1612', borderRadius:10 }} />
                <span style={{ fontSize:10, color:'#1A1612' }}>●●●</span>
              </div>
              <div style={{ padding:'8px 16px 12px', borderBottom:'1px solid #EDE8DF', textAlign:'center' }}>
                <p style={{ fontSize:11, fontWeight:400, letterSpacing:'.12em', textTransform:'uppercase', color:'#1A1612' }}>Gemly</p>
              </div>
              <div style={{ margin:'12px 14px 8px', background:'#F0EBE2', borderRadius:14, padding:'14px', display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:44, height:44, background:'#E0D8CA', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0 }}>👟</div>
                <div>
                  <p style={{ fontSize:11, fontWeight:500, color:'#1A1612', marginBottom:2 }}>Nike Air Max 90</p>
                  <p style={{ fontSize:10, fontWeight:300, color:'#9A8E80' }}>White / Grey — Size 42</p>
                </div>
              </div>
              <div style={{ padding:'4px 14px 0', flex:1 }}>
                <p style={{ fontSize:9, fontWeight:300, letterSpacing:'.18em', textTransform:'uppercase', color:'#B0A898', marginBottom:8 }}>Found online</p>
                {[
                  { platform:'Vinted', price:'€58', condition:'Like new', color:'#4CAF50' },
                  { platform:'Depop', price:'€64', condition:'Good', color:'#8BC34A' },
                  { platform:'eBay', price:'€72', condition:'Very good', color:'#8BC34A' },
                ].map((r, i) => (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 10px', background:'#fff', borderRadius:8, marginBottom:6, border:'1px solid #EDE8DF' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                      <div style={{ width:6, height:6, borderRadius:'50%', background:r.color, flexShrink:0 }} />
                      <span style={{ fontSize:11, fontWeight:400, color:'#1A1612' }}>{r.platform}</span>
                    </div>
                    <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                      <span style={{ fontSize:9, color:'#B0A898' }}>{r.condition}</span>
                      <span style={{ fontSize:12, fontWeight:500, color:'#1A1612' }}>{r.price}</span>
                    </div>
                  </div>
                ))}
                <div style={{ marginTop:6, padding:'8px 10px', background:'#EEF4EF', borderRadius:8, border:'1px solid #C8DBC9' }}>
                  <p style={{ fontSize:9, fontWeight:300, letterSpacing:'.15em', textTransform:'uppercase', color:'#5A8060', marginBottom:2 }}>Nearby shop</p>
                  <p style={{ fontSize:10, fontWeight:400, color:'#2C4A32' }}>Episode — Amsterdam</p>
                </div>
              </div>
              <div style={{ display:'flex', justifyContent:'center', padding:'10px 0 8px' }}>
                <div style={{ width:36, height:4, background:'#1A1612', borderRadius:2, opacity:.15 }} />
              </div>
            </div>
            <div style={{ position:'absolute', right:-3, top:80, width:3, height:32, background:'#0D0C0A', borderRadius:'0 2px 2px 0' }} />
            <div style={{ position:'absolute', left:-3, top:72, width:3, height:24, background:'#0D0C0A', borderRadius:'2px 0 0 2px' }} />
            <div style={{ position:'absolute', left:-3, top:106, width:3, height:44, background:'#0D0C0A', borderRadius:'2px 0 0 2px' }} />
            <div style={{ position:'absolute', left:-3, top:158, width:3, height:44, background:'#0D0C0A', borderRadius:'2px 0 0 2px' }} />
          </div>
        </div>
      </div>

      {/* How it works */}
      <div id="how" className="how-section" style={{ padding:'4rem 2.5rem', maxWidth:900, margin:'0 auto' }}>
        <p style={{ fontSize:11, fontWeight:300, letterSpacing:'.25em', textTransform:'uppercase', color:'#B0A898', marginBottom:'2.5rem' }}>How it works</p>
        {[
          { num:'01', title:'Scan any item', desc:'Upload a photo or type a name. Gemly identifies the item and searches secondhand first — new options shown if needed.' },
          { num:'02', title:'Find listings', desc:'Real results across Vinted, Depop, Grailed, eBay, Marktplaats and more — filtered to your location.' },
          { num:'03', title:'Discover local shops', desc:"Physical vintage, thrift and consignment stores near you that are likely to carry what you're after." },
        ].map((f, i) => (
          <div key={i} className="feature-item" style={{ display:'flex', gap:'3rem', alignItems:'flex-start' }}>
            <span style={{ fontSize:11, fontWeight:300, letterSpacing:'.15em', color:'#C8C0B4', flexShrink:0, paddingTop:2 }}>{f.num}</span>
            <div style={{ flex:1 }}>
              <h3 style={{ fontWeight:300, fontSize:18, color:'#1A1612', marginBottom:'.5rem', letterSpacing:'-.01em' }}>{f.title}</h3>
              <p style={{ fontSize:13, fontWeight:300, color:'#9A9080', lineHeight:1.75 }}>{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="cta-section" style={{ background:'#1A1612', padding:'4rem 2.5rem', textAlign:'center' }}>
        <p style={{ fontSize:11, fontWeight:300, letterSpacing:'.25em', textTransform:'uppercase', color:'#4A4540', marginBottom:'1.5rem' }}>Get started today</p>
        <h2 style={{ fontWeight:200, fontSize:'clamp(24px,4vw,48px)', color:'#F0EBE3', letterSpacing:'-.01em', marginBottom:'2rem' }}>2 free searches on signup.</h2>
        <a href="/login" style={{ display:'inline-block', fontSize:11, fontWeight:300, letterSpacing:'.22em', textTransform:'uppercase', color:'#1A1612', background:'#F0EBE3', textDecoration:'none', padding:'14px 36px' }}>
          Create free account
        </a>
      </div>

      {/* Footer */}
      <div className="footer-inner" style={{ display:'flex', justifyContent:'space-between', padding:'1.5rem 2.5rem', borderTop:'1px solid #EDEAE4' }}>
        <span style={{ fontSize:11, fontWeight:300, letterSpacing:'.12em', textTransform:'uppercase', color:'#C8C0B4' }}>Gemly</span>
        <span style={{ fontSize:11, fontWeight:300, letterSpacing:'.12em', textTransform:'uppercase', color:'#C8C0B4' }}>© 2026</span>
      </div>
    </div>
  );
}
