'use client';
import { useState } from 'react';
import { createClient } from '../../lib/supabase';

const COUNTRIES = [
  "Netherlands","Belgium","Germany","France","United Kingdom","United States",
  "Spain","Italy","Portugal","Sweden","Denmark","Norway","Finland","Austria",
  "Switzerland","Poland","Australia","Canada","Japan","Other"
];

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [country, setCountry] = useState('');
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const supabase = createClient();

  const handleAuth = async () => {
    setLoading(true); setMessage(''); setIsError(false);
    if (isSignUp) {
      if (!terms) { setMessage('Please accept the terms and conditions.'); setIsError(true); setLoading(false); return; }
      const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName, country } } });
      if (error) { setMessage(error.message); setIsError(true); }
      else setMessage('Check your email for a confirmation link.');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setMessage(error.message); setIsError(true); }
      else window.location.href = '/';
    }
    setLoading(false);
  };

  const inp = {
    width:'100%', padding:'12px 14px', border:'1px solid #EDEAE4', borderRadius:2,
    fontSize:14, fontFamily:"'Outfit',sans-serif", fontWeight:300,
    outline:'none', background:'#fff', color:'#1A1612',
    marginBottom:10, boxSizing:'border-box', transition:'border-color .2s',
  };

  return (
    <div style={{ minHeight:'100vh', background:'#F5F0E8', display:'flex', flexDirection:'column', fontFamily:"'Outfit',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@200;300;400;500&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        input:focus, select:focus { border-color:#1A1612 !important; outline:none; }
        .tlink { color:#1A1612; text-decoration:underline; text-decoration-color:#C8C0B4; }
        .tlink:hover { text-decoration-color:#1A1612; }
        .sw { background:none; border:none; color:#9A9080; font-size:13px; cursor:pointer; font-family:'Outfit',sans-serif; font-weight:300; transition:color .2s; padding:0; }
        .sw:hover { color:#1A1612; }
        .abtn { width:100%; background:#1A1612; color:#fff; border:none; padding:13px; font-size:11px; font-family:'Outfit',sans-serif; font-weight:400; letter-spacing:.2em; text-transform:uppercase; cursor:pointer; transition:background .2s; margin-bottom:14px; border-radius:2px; }
        .abtn:hover { background:#3A3028; }
        .abtn:disabled { background:#C8C0B4; cursor:not-allowed; }
      `}</style>

      {/* Nav */}
      <nav style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'1.5rem 2.5rem', borderBottom:'1px solid #E8E0D4' }}>
        <a href="/" style={{ fontSize:16, fontWeight:400, letterSpacing:'.12em', textTransform:'uppercase', color:'#1A1612', textDecoration:'none' }}>Gemly</a>
        <button className="sw" onClick={() => { setIsSignUp(!isSignUp); setMessage(''); }}>
          {isSignUp ? 'Sign in instead' : 'Create account'}
        </button>
      </nav>

      {/* Form */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'3rem 1.5rem' }}>
        <div style={{ width:'100%', maxWidth:400 }}>

          <div style={{ marginBottom:'2rem' }}>
            <p style={{ fontSize:10, fontWeight:300, letterSpacing:'.25em', textTransform:'uppercase', color:'#9A9080', marginBottom:'0.5rem' }}>
              {isSignUp ? 'New account' : 'Welcome back'}
            </p>
            <h1 style={{ fontSize:'clamp(28px,5vw,38px)', fontWeight:200, letterSpacing:'-.02em', color:'#1A1612', lineHeight:1.1 }}>
              {isSignUp ? 'Start scanning.' : 'Sign in to Gemly.'}
            </h1>
            {isSignUp && <p style={{ fontSize:13, fontWeight:300, color:'#9A9080', marginTop:'0.5rem' }}>2 free searches included.</p>}
          </div>

          {isSignUp && (
            <>
              <input style={inp} type="text" placeholder="Full name" value={fullName} onChange={e => setFullName(e.target.value)} />
              <select style={{ ...inp, color: country ? '#1A1612' : '#9A9080', appearance:'none', backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239A9080' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat:'no-repeat', backgroundPosition:'right 14px center', cursor:'pointer' }}
                value={country} onChange={e => setCountry(e.target.value)}>
                <option value="" disabled>Country</option>
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </>
          )}

          <input style={inp} type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} />
          <input style={{ ...inp, marginBottom: isSignUp ? 14 : 20 }} type="password" placeholder="Password"
            value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAuth()} />

          {isSignUp && (
            <label style={{ display:'flex', alignItems:'flex-start', gap:10, marginBottom:20, cursor:'pointer' }}>
              <input type="checkbox" checked={terms} onChange={e => setTerms(e.target.checked)} style={{ marginTop:3, accentColor:'#1A1612', flexShrink:0 }} />
              <span style={{ fontSize:12, fontWeight:300, color:'#9A9080', lineHeight:1.6 }}>
                I agree to the <a href="/terms" className="tlink">Terms of Service</a> and <a href="/privacy" className="tlink">Privacy Policy</a>
              </span>
            </label>
          )}

          {message && (
            <div style={{ fontSize:12, fontWeight:300, color: isError ? '#8A3A30' : '#5A7A5A', background: isError ? '#FDF0EE' : '#EEF4EE', border:`1px solid ${isError ? '#E8C8C0' : '#C8D8C8'}`, padding:'10px 14px', marginBottom:14, lineHeight:1.5 }}>
              {message}
            </div>
          )}

          <button className="abtn" onClick={handleAuth} disabled={loading || !email || !password || (isSignUp && !terms)}>
            {loading ? 'Please wait…' : isSignUp ? 'Create account' : 'Sign in'}
          </button>

          <div style={{ textAlign:'center' }}>
            <button className="sw" onClick={() => { setIsSignUp(!isSignUp); setMessage(''); }}>
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding:'1.5rem 2.5rem', borderTop:'1px solid #E8E0D4', display:'flex', justifyContent:'space-between' }}>
        <span style={{ fontSize:10, fontWeight:300, letterSpacing:'.15em', textTransform:'uppercase', color:'#C8C0B4' }}>Gemly © 2026</span>
        <a href="/" style={{ fontSize:10, fontWeight:300, letterSpacing:'.15em', textTransform:'uppercase', color:'#C8C0B4', textDecoration:'none' }}>← Back</a>
      </div>
    </div>
  );
}
