'use client';
import { useState } from 'react';
import { createClient } from '../../lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const supabase = createClient();

  const handleAuth = async () => {
    setLoading(true);
    setMessage('');
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setMessage(error.message);
      else setMessage('Check je email voor een bevestigingslink!');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage(error.message);
      else window.location.href = '/';
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight:'100vh', background:'#FDFAF6', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'sans-serif' }}>
      <div style={{ background:'#FFF', border:'1px solid #EDE8DF', borderRadius:16, padding:'2rem', width:'100%', maxWidth:380 }}>
        <h1 style={{ fontFamily:'Georgia,serif', fontStyle:'italic', fontSize:24, color:'#2C2417', marginBottom:8 }}>
          {isSignUp ? 'Account aanmaken' : 'Inloggen'}
        </h1>
        <p style={{ fontSize:12, color:'#A89880', marginBottom:24 }}>
          {isSignUp ? '2 gratis searches na registratie' : 'Welkom terug'}
        </p>
        <input
          type="email" placeholder="Email" value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ width:'100%', padding:'10px 12px', border:'1.5px solid #EDE8DF', borderRadius:8, marginBottom:10, fontSize:14, outline:'none', boxSizing:'border-box' }}
        />
        <input
          type="password" placeholder="Wachtwoord" value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAuth()}
          style={{ width:'100%', padding:'10px 12px', border:'1.5px solid #EDE8DF', borderRadius:8, marginBottom:16, fontSize:14, outline:'none', boxSizing:'border-box' }}
        />
        {message && <p style={{ fontSize:12, color:'#C4924A', marginBottom:12 }}>{message}</p>}
        <button
          onClick={handleAuth} disabled={loading || !email || !password}
          style={{ width:'100%', background:'#2C2417', color:'#FFF', border:'none', borderRadius:8, padding:'12px', fontSize:13, fontWeight:600, cursor:'pointer', marginBottom:12 }}>
          {loading ? 'Even wachten...' : isSignUp ? 'Account aanmaken' : 'Inloggen'}
        </button>
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          style={{ width:'100%', background:'none', border:'none', color:'#A89880', fontSize:12, cursor:'pointer' }}>
          {isSignUp ? 'Al een account? Inloggen' : 'Nog geen account? Registreren'}
        </button>
      </div>
    </div>
  );
}
