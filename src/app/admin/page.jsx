'use client';
import { useState, useEffect } from 'react';
import { createClient } from '../../lib/supabase';

const ADMIN_PASSWORD = 'gemly2026';
const API_COST = 0.20;
const STRIPE_FEE = (amount) => amount * 0.014 + 0.25;

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState('');
  const [pwError, setPwError] = useState(false);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('total_searches');
  const [sortDir, setSortDir] = useState('desc');
  const [tab, setTab] = useState('users');

  const handleLogin = () => {
    if (pw === ADMIN_PASSWORD) { setAuthed(true); loadData(); }
    else { setPwError(true); setTimeout(() => setPwError(false), 1500); }
  };

  const loadData = async () => {
    setLoading(true);
    const supabase = createClient();
    const [{ data: usersData }, { data: ordersData }] = await Promise.all([
      supabase.from('profiles').select('id, full_name, email, credits, total_searches, referral_code, referred_by, created_at, country').order('total_searches', { ascending: false }),
      supabase.from('orders').select('*').order('created_at', { ascending: false }),
    ]);
    setUsers(usersData || []);
    setOrders(ordersData || []);
    setLoading(false);
  };

  const sorted = [...users].sort((a, b) => {
    const av = a[sortBy] ?? 0;
    const bv = b[sortBy] ?? 0;
    if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    return sortDir === 'asc' ? av - bv : bv - av;
  });

  const toggleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('desc'); }
  };

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.total_searches > 0).length;
  const referredUsers = users.filter(u => u.referred_by).length;
  const totalSearches = users.reduce((s, u) => s + (u.total_searches || 0), 0);

  const totalRevenue = orders.reduce((s, o) => s + (o.amount_eur || 0), 0);
  const totalCredits = orders.reduce((s, o) => s + (o.credits_added || 0), 0);
  const totalStripeFees = orders.reduce((s, o) => s + STRIPE_FEE(o.amount_eur || 0), 0);
  const totalApiCost = totalCredits * API_COST;
  const totalProfit = totalRevenue - totalStripeFees - totalApiCost;

  const pkgColor = (name) => {
    if (!name) return { bg: '#F5F0E8', color: '#9A9080' };
    if (name.toLowerCase().includes('pro')) return { bg: '#EEF4EE', color: '#5A7A5A' };
    if (name.toLowerCase().includes('plus')) return { bg: '#F0F4F8', color: '#4A6A8A' };
    return { bg: '#F5F0E8', color: '#8A7040' };
  };

  const creditColor = (c) => {
    if (c === 0) return '#8A3A30';
    if (c <= 1) return '#A05020';
    if (c <= 3) return '#7A6030';
    return '#1A1612';
  };

  const creditBg = (c) => {
    if (c === 0) return '#FDF0EE';
    if (c <= 1) return '#FDF4EC';
    if (c <= 3) return '#F8F4EC';
    return '#F5F0E8';
  };

  const SortArrow = ({ col }) => {
    if (sortBy !== col) return <span style={{ color: '#C8C0B4', fontSize: 10 }}>↕</span>;
    return <span style={{ color: '#1A1612', fontSize: 10 }}>{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  if (!authed) return (
    <div style={{ minHeight: '100vh', background: '#F5F0E8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Outfit',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@200;300;400;500&display=swap'); *{box-sizing:border-box;margin:0;padding:0;}`}</style>
      <div style={{ width: '100%', maxWidth: 360, padding: '0 1.5rem' }}>
        <p style={{ fontSize: 10, fontWeight: 300, letterSpacing: '.25em', textTransform: 'uppercase', color: '#9A9080', marginBottom: '0.5rem' }}>Admin</p>
        <h1 style={{ fontSize: 32, fontWeight: 200, color: '#1A1612', marginBottom: '2rem', letterSpacing: '-.02em' }}>Gemly dashboard.</h1>
        <input
          type="password" placeholder="Password" value={pw}
          onChange={e => setPw(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
          style={{ width: '100%', padding: '12px 14px', border: `1px solid ${pwError ? '#E8C8C0' : '#EDEAE4'}`, borderRadius: 2, fontSize: 14, fontFamily: "'Outfit',sans-serif", fontWeight: 300, background: pwError ? '#FDF0EE' : '#fff', color: '#1A1612', outline: 'none', marginBottom: 10, transition: 'border-color .2s' }}
        />
        <button onClick={handleLogin} style={{ width: '100%', background: '#1A1612', color: '#fff', border: 'none', padding: '13px', fontSize: 11, fontFamily: "'Outfit',sans-serif", fontWeight: 400, letterSpacing: '.2em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: 2 }}>
          Enter
        </button>
        {pwError && <p style={{ fontSize: 12, color: '#8A3A30', marginTop: 8, fontWeight: 300 }}>Wrong password.</p>}
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#F5F0E8', fontFamily: "'Outfit',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@200;300;400;500&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        @keyframes spin { to { transform:rotate(360deg); } }
        .th { font-size:10px; font-weight:400; letter-spacing:.16em; text-transform:uppercase; color:#9A9080; padding:10px 14px; text-align:left; cursor:pointer; white-space:nowrap; user-select:none; }
        .th:hover { color:#1A1612; }
        .td { font-size:13px; font-weight:300; color:#1A1612; padding:12px 14px; border-bottom:1px solid #EDEAE4; vertical-align:middle; }
        .tr:hover td { background:#FAFAF8; }
        .badge { display:inline-block; font-size:10px; font-weight:400; padding:3px 8px; border-radius:1px; letter-spacing:.06em; text-transform:uppercase; }
        .mtab { background:none; border:none; font-family:'Outfit',sans-serif; font-size:11px; font-weight:400; letter-spacing:.14em; text-transform:uppercase; cursor:pointer; padding:.6rem 1.2rem; border-radius:2px; transition:all .2s; }
        .mtab.active { background:#1A1612; color:#fff; }
        .mtab:not(.active) { color:#9A9080; }
        .mtab:not(.active):hover { color:#1A1612; }
      `}</style>

      <div style={{ borderBottom: '1px solid #E8E0D4', background: '#fff' }}>
        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.75rem', maxWidth: 1100, margin: '0 auto' }}>
          <a href="/" style={{ fontSize: 15, fontWeight: 400, letterSpacing: '.12em', textTransform: 'uppercase', color: '#1A1612', textDecoration: 'none' }}>Gemly</a>
          <span style={{ fontSize: 10, fontWeight: 300, letterSpacing: '.2em', textTransform: 'uppercase', color: '#9A9080' }}>Admin</span>
        </nav>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.75rem' }}>

        {/* Revenue stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: '1rem' }}>
          {[
            { label: 'Total revenue', value: `€${totalRevenue.toFixed(2)}`, color: '#1A1612' },
            { label: 'Stripe fees', value: `-€${totalStripeFees.toFixed(2)}`, color: '#8A3A30' },
            { label: 'API costs', value: `-€${totalApiCost.toFixed(2)}`, color: '#8A3A30' },
            { label: 'Net profit', value: `€${totalProfit.toFixed(2)}`, color: totalProfit >= 0 ? '#5A7A5A' : '#8A3A30' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: '#fff', border: '1px solid #EDEAE4', borderRadius: 2, padding: '1rem 1.25rem' }}>
              <div style={{ fontSize: 10, fontWeight: 400, letterSpacing: '.16em', textTransform: 'uppercase', color: '#9A9080', marginBottom: 6 }}>{label}</div>
              <div style={{ fontSize: 24, fontWeight: 200, color, lineHeight: 1 }}>{value}</div>
            </div>
          ))}
        </div>

        {/* User stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: '1.5rem' }}>
          {[
            { label: 'Total users', value: totalUsers },
            { label: 'Active (≥1 search)', value: activeUsers },
            { label: 'Via referral', value: referredUsers },
            { label: 'Total searches', value: totalSearches },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: '#fff', border: '1px solid #EDEAE4', borderRadius: 2, padding: '1rem 1.25rem' }}>
              <div style={{ fontSize: 10, fontWeight: 400, letterSpacing: '.16em', textTransform: 'uppercase', color: '#9A9080', marginBottom: 6 }}>{label}</div>
              <div style={{ fontSize: 28, fontWeight: 200, color: '#1A1612', lineHeight: 1 }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: '1rem' }}>
          <button className={`mtab ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')}>Users</button>
          <button className={`mtab ${tab === 'orders' ? 'active' : ''}`} onClick={() => setTab('orders')}>Orders {orders.length > 0 && `(${orders.length})`}</button>
        </div>

        {/* Users table */}
        {tab === 'users' && (
          <div style={{ background: '#fff', border: '1px solid #EDEAE4', borderRadius: 2, overflow: 'hidden' }}>
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem' }}>
                <div style={{ width: 24, height: 24, border: '1.5px solid #EDEAE4', borderTopColor: '#1A1612', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #EDEAE4', background: '#FAFAF8' }}>
                      <th className="th" onClick={() => toggleSort('full_name')}>Name <SortArrow col="full_name" /></th>
                      <th className="th">Email</th>
                      <th className="th">Country</th>
                      <th className="th" onClick={() => toggleSort('total_searches')}>Searches <SortArrow col="total_searches" /></th>
                      <th className="th" onClick={() => toggleSort('credits')}>Credits left <SortArrow col="credits" /></th>
                      <th className="th">Referral</th>
                      <th className="th" onClick={() => toggleSort('created_at')}>Joined <SortArrow col="created_at" /></th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((u) => (
                      <tr key={u.id} className="tr">
                        <td className="td" style={{ fontWeight: 400 }}>{u.full_name || <span style={{ color: '#C8C0B4' }}>—</span>}</td>
                        <td className="td" style={{ color: '#9A9080', fontSize: 12 }}>{u.email || '—'}</td>
                        <td className="td" style={{ color: '#9A9080' }}>{u.country || '—'}</td>
                        <td className="td">
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontWeight: 500 }}>{u.total_searches || 0}</span>
                            {u.total_searches > 5 && <span className="badge" style={{ background: '#EEF4EE', color: '#5A7A5A' }}>Active</span>}
                            {u.total_searches === 0 && <span className="badge" style={{ background: '#F5F0E8', color: '#9A9080' }}>Unused</span>}
                          </div>
                        </td>
                        <td className="td">
                          <span style={{ display: 'inline-block', background: creditBg(u.credits), color: creditColor(u.credits), fontWeight: 500, fontSize: 13, padding: '3px 10px', borderRadius: 1 }}>
                            {u.credits ?? 0}
                          </span>
                        </td>
                        <td className="td">
                          {u.referred_by
                            ? <span className="badge" style={{ background: '#F0F5F0', color: '#5A7A5A' }}>Via referral</span>
                            : <span style={{ color: '#C8C0B4' }}>Direct</span>}
                        </td>
                        <td className="td" style={{ color: '#9A9080', fontSize: 12 }}>
                          {u.created_at ? new Date(u.created_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {sorted.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', color: '#9A9080', fontSize: 13, fontWeight: 300 }}>No users yet.</div>}
              </div>
            )}
          </div>
        )}

        {/* Orders table */}
        {tab === 'orders' && (
          <div style={{ background: '#fff', border: '1px solid #EDEAE4', borderRadius: 2, overflow: 'hidden' }}>
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem' }}>
                <div style={{ width: 24, height: 24, border: '1.5px solid #EDEAE4', borderTopColor: '#1A1612', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #EDEAE4', background: '#FAFAF8' }}>
                      <th className="th">Date</th>
                      <th className="th">Package</th>
                      <th className="th">Amount</th>
                      <th className="th">Stripe fee</th>
                      <th className="th">API cost</th>
                      <th className="th">Profit</th>
                      <th className="th">Credits</th>
                      <th className="th">User</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => {
                      const fee = STRIPE_FEE(o.amount_eur || 0);
                      const api = (o.credits_added || 0) * API_COST;
                      const profit = (o.amount_eur || 0) - fee - api;
                      const { bg, color } = pkgColor(o.package_name);
                      const user = users.find(u => u.id === o.user_id);
                      return (
                        <tr key={o.id} className="tr">
                          <td className="td" style={{ color: '#9A9080', fontSize: 12, whiteSpace: 'nowrap' }}>
                            {o.created_at ? new Date(o.created_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                          </td>
                          <td className="td">
                            <span className="badge" style={{ background: bg, color }}>{o.package_name || '—'}</span>
                          </td>
                          <td className="td" style={{ fontWeight: 500 }}>€{(o.amount_eur || 0).toFixed(2)}</td>
                          <td className="td" style={{ color: '#8A3A30' }}>-€{fee.toFixed(2)}</td>
                          <td className="td" style={{ color: '#8A3A30' }}>-€{api.toFixed(2)}</td>
                          <td className="td" style={{ color: profit >= 0 ? '#5A7A5A' : '#8A3A30', fontWeight: 500 }}>€{profit.toFixed(2)}</td>
                          <td className="td">+{o.credits_added || 0}</td>
                          <td className="td" style={{ color: '#9A9080', fontSize: 12 }}>
                            {user?.full_name || user?.email || <span style={{ color: '#C8C0B4' }}>—</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {orders.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', color: '#9A9080', fontSize: 13, fontWeight: 300 }}>No orders yet — orders appear here after a real payment.</div>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
