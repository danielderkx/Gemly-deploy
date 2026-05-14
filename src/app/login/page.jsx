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
    setLoading(true);
    setMessage('');
    setIsError(false);

    if (isSignUp) {
      if (!terms) {
        setMessage('Please accept the terms and conditions to continue.');
        setIsError(true);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, country }
        }
      });
      if (error) {
        setMessage(error.message);
        setIsError(true);
      } else {
        setMessage('Check your email for a confirmation link!');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage(error.message);
        setIsError(true);
      } else {
        window.location.href = '/';
      }
    }
    setLoading(false);
  };

  const inputStyle = {
    width:'100%', padding:'11px 14px', border:'1.5px solid #EDE8DF',
    borderRadius:9, fontSize:14, outline:'none', boxSizing:'border-box',
    fontFamily:'inherit', color:'#2C2417', background:'#FDFAF6',
    marginBottom:10,
  };

  return (
    <div style={{ minHeight:'100vh', background:'#FDFAF6', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Nunito',sans-serif", padding:'1rem' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;1,400&family=Nunito:wght@300;400;500;600&display=swap');
        input:focus, select:focus { border-color:#C4924A !important; box-shadow:0 0 0 3px rgba(196,146,74,.08); }
        .terms-link { color:#C4924A; text-decoration:none; }
        .terms-link:hover { text-decoration:underline; }
        .switch-btn { background:none; border:none; color:#A89880; font-size:13px; cursor:pointer; font-family:inherit; }
        .switch-btn:hover { color:#C4924A; }
      `}</style>

      <div style={{ background:'#FFF', border:'1px solid #EDE8DF', borderRadius:20, padding:'2rem 2rem 1.75rem', width:'100%', maxWidth:400, boxShadow:'0 4px 24px rgba(44,36,23,.06)' }}>

        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:'1.5rem', paddingBottom:'1.25rem', borderBottom:'1px solid #EDE8DF' }}>
          <a href="/" style={{ textDecoration:'none' }}>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontStyle:'italic', fontSize:28, fontWeight:400, color:'#2C2417', margin:0 }}>Gemly</h1>
            <p style={{ fontSize:11, color:'#A89880', letterSpacing:'.18em', textTransform:'uppercase', margin:'4px 0 0', fontWeight:500 }}>Scan & Find</p>
          </a>
        </div>

        <h2 style={{ fontSize:15, fontWeight:600, color:'#2C2417', margin:'0 0 4px' }}>
          {isSignUp ? 'Create your account' : 'Welcome back'}
        </h2>
        <p style={{ fontSize:12, color:'#A89880', margin:'0 0 1.25rem' }}>
          {isSignUp ? '2 free searches included — no credit card needed' : 'Sign in to continue scanning'}
        </p>

        {/* Sign up fields */}
        {isSignUp && (
          <>
            <input
              style={inputStyle} type="text" placeholder="Full name"
              value={fullName} onChange={e => setFullName(e.target.value)}
            />
            <select
              style={{ ...inputStyle, color: country ? '#2C2417' : '#A89880' }}
              value={country} onChange={e => setCountry(e.target.value)}>
              <option value="" disabled>Country</option>
              {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </>
        )}

        <input
          style={inputStyle} type="email" placeholder="Email address"
          value={email} onChange={e => setEmail(e.target.value)}
        />
        <input
          style={inputStyle} type="password" placeholder="Password"
          value={password} onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAuth()}
        />

        {/* Terms */}
        {isSignUp && (
          <label style={{ display:'flex', alignItems:'flex-start', gap:9, marginBottom:16, cursor:'pointer' }}>
            <input
              type="checkbox" checked={terms} onChange={e => setTerms(e.target.checked)}
              style={{ marginTop:2, accentColor:'#C4924A', flexShrink:0 }}
            />
            <span style={{ fontSize:12, color:'#7A7268', lineHeight:1.5 }}>
              I agree to the <a href="/terms" className="terms-link">Terms of Service</a> and <a href="/privacy" className="terms-link">Privacy Policy</a>
            </span>
          </label>
        )}

        {/* Message */}
        {message && (
          <p style={{ fontSize:12, color: isError ? '#B94A4A' : '#4A6E4F', background: isError ? '#FEF2F2' : '#F0F7F1', border: `1px solid ${isError ? '#FECDCD' : '#B8D9BC'}`, borderRadius:8, padding:'8px 12px', marginBottom:12 }}>
            {message}
          </p>
        )}

        <button
          onClick={handleAuth}
          disabled={loading || !email || !password || (isSignUp && !terms)}
          style={{ width:'100%', background:'#2C2417', color:'#FFF', border:'none', borderRadius:10, padding:'12px', fontSize:13, fontWeight:600, cursor:'pointer', letterSpacing:'.06em', textTransform:'uppercase', opacity: (loading || !email || !password || (isSignUp && !terms)) ? .5 : 1, marginBottom:12 }}>
          {loading ? 'Please wait...' : isSignUp ? 'Create account' : 'Sign in'}
        </button>

        <div style={{ textAlign:'center' }}>
          <button className="switch-btn" onClick={() => { setIsSignUp(!isSignUp); setMessage(''); }}>
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>

        {/* Back to app */}
        <div style={{ textAlign:'center', marginTop:'1rem', paddingTop:'1rem', borderTop:'1px solid #EDE8DF' }}>
          <a href="/" style={{ fontSize:12, color:'#A89880', textDecoration:'none' }}>← Back to Gemly</a>
        </div>
      </div>
    </div>
  );
}
