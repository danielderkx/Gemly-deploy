'use client';
import { useEffect } from 'react';

export default function WelcomePage() {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = '/';
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ minHeight:'100vh', background:'#FDFAF6', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Nunito',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,400&family=Nunito:wght@400;600&display=swap');`}</style>
      <div style={{ textAlign:'center', padding:'2rem' }}>
        <div style={{ fontSize:48, marginBottom:'1.5rem' }}>💎</div>
        <h1 style={{ fontFamily:"'Playfair Display',serif", fontStyle:'italic', fontSize:32, fontWeight:400, color:'#2C2417', margin:'0 0 12px' }}>
          Welcome to Gemly
        </h1>
        <p style={{ fontSize:14, color:'#A89880', margin:'0 0 8px' }}>
          Your account is confirmed.
        </p>
        <p style={{ fontSize:13, color:'#C4924A', fontWeight:600 }}>
          You have 2 free searches — let's find something great.
        </p>
        <p style={{ fontSize:12, color:'#C9C2B8', marginTop:'2rem' }}>
          Redirecting you to the app...
        </p>
      </div>
    </div>
  );
}
