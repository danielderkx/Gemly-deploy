'use client';
import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function JoinContent() {
  const searchParams = useSearchParams();
  const ref = searchParams.get('ref');

  useEffect(() => {
    if (ref) {
      localStorage.setItem('gemly_ref', ref);
    }
    window.location.href = '/login?signup=true';
  }, [ref]);

  return (
    <div style={{ minHeight:'100vh', background:'#F5F0E8', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Outfit',sans-serif" }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:28, height:28, border:'1.5px solid #EDEAE4', borderTopColor:'#1A1612', borderRadius:'50%', animation:'spin 1s linear infinite', margin:'0 auto 1rem' }}/>
        <p style={{ fontSize:12, fontWeight:300, letterSpacing:'.14em', textTransform:'uppercase', color:'#9A9080' }}>Loading…</p>
      </div>
      <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={<div style={{ minHeight:'100vh', background:'#F5F0E8' }}/>}>
      <JoinContent />
    </Suspense>
  );
}
