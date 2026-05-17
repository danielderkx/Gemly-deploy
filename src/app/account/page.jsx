'use client';
import { useState, useEffect } from 'react';
import { createClient } from '../../lib/supabase';

export default function AccountPage() {
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = '/login'; return; }
    setUser(user);

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    setProfile(profile);
    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await supabase.from('profiles').delete().eq('id', user.id);
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch {
      setDeleting(false);
    }
  };

  const inp = {
    width: '100%', padding: '10px 14px', border: '1px solid #EDEAE4',
    borderRadius: 2, fontSize: 13, fontFamily: "'Outfit',sans-serif",
    fontWeight: 300, background: '#F5F0E8', color: '#1A1612',
    boxSizing: 'border-box',
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#F5F0E8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Outfit',sans-serif" }}>
      <div style={{ width: 28, height: 28, border: '1.5px solid #EDEAE4', borderTopColor: '#1A1612', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const history = profile?.search_history || [];

  return (
    <div style={{ minHeight: '100vh', background: '#F5F0E8', fontFamily: "'Outfit',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@200;300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .nav-link { font-size: 11px; font-weight: 300; letter-spacing: .15em; text-transform: uppercase; color: #9A9080; text-decoration: none; transition: color .2s; }
        .nav-link:hover { color: #1A1612; }
        .btn-primary { background: #1A1612; color: #fff; border: none; padding: 11px 24px; font-size: 11px; font-family: 'Outfit',sans-serif; font-weight: 400; letter-spacing: .18em; text-transform: uppercase; cursor: pointer; border-radius: 2px; transition: background .2s; }
        .btn-primary:hover { background: #3A3028; }
        .btn-ghost { background: transparent; color: #1A1612; border: 1px solid #EDEAE4; padding: 11px 24px; font-size: 11px; font-family: 'Outfit',sans-serif; font-weight: 400; letter-spacing: .14em; text-transform: uppercase; cursor: pointer; border-radius: 2px; transition: border-color .2s; }
        .btn-ghost:hover { border-color: #1A1612; }
        .btn-danger { background: transparent; color: #8A3A30; border: 1px solid #E8C8C0; padding: 11px 24px; font-size: 11px; font-family: 'Outfit',sans-serif; font-weight: 400; letter-spacing: .14em; text-transform: uppercase; cursor: pointer; border-radius: 2px; transition: all .2s; }
        .btn-danger:hover { background: #FDF0EE; }
        .section { background: #fff; border: 1px solid #EDEAE4; border-radius: 2px; padding: 1.5rem; margin-bottom: 1rem; }
        .section-label { font-size: 10px; font-weight: 400; letter-spacing: .2em; text-transform: uppercase; color: #9A9080; margin-bottom: 1rem; display: block; }
        .history-item { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #EDEAE4; }
        .history-item:last-child { border-bottom: none; }
      `}</style>

      {/* Nav */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.75rem', borderBottom: '1px solid #E8E0D4', background: '#fff', maxWidth: 600, margin: '0 auto' }}>
        <a href="/" style={{ fontSize: 15, fontWeight: 400, letterSpacing: '.12em', textTransform: 'uppercase', color: '#1A1612', textDecoration: 'none' }}>Gemly</a>
        <a href="/scan" className="nav-link">← Scanner</a>
      </nav>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '2rem 1.75rem' }}>

        {/* Credits */}
        <div className="section">
          <span className="section-label">Your credits</span>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 48, fontWeight: 200, color: '#1A1612', lineHeight: 1 }}>{profile?.credits ?? 0}</div>
              <div style={{ fontSize: 13, fontWeight: 300, color: '#9A9080', marginTop: 4 }}>searches remaining</div>
            </div>
            <a href="/pricing" style={{ display: 'inline-block', background: '#1A1612', color: '#fff', fontSize: 11, fontWeight: 400, letterSpacing: '.18em', textTransform: 'uppercase', textDecoration: 'none', padding: '11px 20px', borderRadius: 2 }}>
              Get more
            </a>
          </div>
        </div>

        {/* Search history */}
        <div className="section">
          <span className="section-label">Recent searches</span>
          {history.length === 0 ? (
            <p style={{ fontSize: 13, fontWeight: 300, color: '#9A9080' }}>No searches yet — <a href="/scan" style={{ color: '#1A1612' }}>start scanning</a>.</p>
          ) : (
            history.slice(0, 5).map((item, i) => (
              <div key={i} className="history-item">
                <div>
                  <div style={{ fontSize: 13, fontWeight: 400, color: '#1A1612' }}>{item.query}</div>
                  <div style={{ fontSize: 11, fontWeight: 300, color: '#9A9080', marginTop: 2 }}>
                    {item.date ? new Date(item.date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                  </div>
                </div>
                <a href={`/scan`} style={{ fontSize: 10, fontWeight: 400, letterSpacing: '.1em', textTransform: 'uppercase', color: '#9A9080', textDecoration: 'none' }}>
                  Scan again →
                </a>
              </div>
            ))
          )}
        </div>

        {/* Account info */}
        <div className="section">
          <span className="section-label">Account</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input style={inp} type="text" value={user?.user_metadata?.full_name || ''} readOnly />
            <input style={inp} type="email" value={user?.email || ''} readOnly />
            <input style={inp} type="text" value={user?.user_metadata?.country || ''} readOnly />
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button className="btn-ghost" onClick={handleSignOut}>Sign out</button>

          {!showDeleteConfirm ? (
            <button className="btn-danger" onClick={() => setShowDeleteConfirm(true)}>Delete account</button>
          ) : (
            <div style={{ background: '#FDF0EE', border: '1px solid #E8C8C0', borderRadius: 2, padding: '1rem', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p style={{ fontSize: 13, fontWeight: 300, color: '#8A3A30', lineHeight: 1.6 }}>
                Are you sure? This permanently deletes your account and all data. This cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn-danger" onClick={handleDeleteAccount} disabled={deleting} style={{ flex: 1 }}>
                  {deleting ? 'Deleting…' : 'Yes, delete everything'}
                </button>
                <button className="btn-ghost" onClick={() => setShowDeleteConfirm(false)} style={{ flex: 1 }}>Cancel</button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
