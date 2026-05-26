'use client';
import { useState } from 'react';
import { createClient } from '../../lib/supabase';

const ADMIN_PASSWORD = 'gemly2026';
const API_COST = 0.20;
const stripeFee = (amount) => amount * 0.014 + 0.25;

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState('');
  const [pwError, setPwError] = useState(false);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('users');
  const [sortBy, setSortBy] = useState('total_searches');
  const [sortDir, setSortDir] = useState('desc');

  const handleLogin = () => {
    if (pw === ADMIN_PASSWORD) { setAuthed(true); loadData(); }
    else { setPwError(true); setTimeout(() => setPwError(false), 1500); }
  };

  const loadData = async () => {
    setLoading(true);
    const supabase = createClient();
    const [usersRes, { data: o }] = await Promise.all([
      fetch('/api/admin/users').then(r => r.json()),
      supabase.from('orders').select('*').order('created_at', { ascending: false }),
    ]);
    setUsers(usersRes.users || []);
    setOrders(o || []);
    setLoading(false);
  };

  const toggleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('desc'); }
  };

  const sorted = [...users].sort((a, b) => {
    const av = a[sortBy] ?? 0, bv = b[sortBy] ?? 0;
    if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    return sortDir === 'asc' ? av - bv : bv - av;
  });

  const totalRevenue = orders.reduce((s, o) => s + (o.amount_eur || 0), 0);
  const totalStripeFees = orders.reduce((s, o) => s + stripeFee(o.amount_eur || 0), 0);
  const totalSearches = users.reduce((s, u) => s + (u.total_searches || 0), 0);
  const totalApiCosts = totalSearches * API_COST;
  const netProfit = totalRevenue - totalStripeFees - totalApiCosts;

  const countryMap = {};
  users.forEach(u => {
    const c = u.country || 'Unknown';
    if (!countryMap[c]) countryMap[c] = { users: 0, searches: 0 };
    countryMap[c].users++;
    countryMap[c].searches += u.total_searches || 0;
  });
  const countries = Object.entries(countryMap)
    .map(([name, d]) => ({ name, ...d }))
    .sort((a, b) => b.users - a.users);
  const maxUsers = countries[0]?.users || 1;

  const Arrow = ({ col }) => (
    <span style={{ color: sortBy === col ? '#1A1612' : '#C8C0B4', fontSize: 10, marginLeft: 4 }}>
      {sortBy === col ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
    </span>
  );

  const creditColor = (c) => c === 0 ? '#8A3A30' : c <= 3 ? '#7A6030' : '#1A1612';
  const creditBg = (c) => c === 0 ? '#FDF0EE' : c <= 3 ? '#F8F4EC' : '#F5F0E8';

  if (!authed) return (
    <div style={{ minHeight: '100vh', background: '#F5F0E8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Outfit',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@200;300;400;500&display=swap'); *{box-sizing:border-box;margin:0;padding:0;}`}</style>
      <div style={{ width: '100%', maxWidth: 360, padding: '0 1.5rem' }}>
        <p style={{ fontSize: 10, fontWeight: 300, letterSpacing: '.25em', textTransform: 'uppercase', color: '#9A9080', marginBottom: 8 }}>Admin</p>
        <h1 style={{ fontSize: 32, fontWeight: 200, color: '#1A1612', marginBottom: '2rem' }}>Gemly dashboard.</h1>
        <input type="password" placeholder="Password" value={pw}
          onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()}
          style={{ width: '100%', padding: '12px 14px', border: `1px solid ${pwError ? '#E8C8C0' : '#EDEAE4'}`, borderRadius: 2, fontSize: 14, fontFamily: "'Outfit',sans-serif", fontWeight: 300, background: pwError ? '#FDF0EE' : '#fff', color: '#1A1612', outline: 'none', marginBottom: 10 }} />
        <button onClick={handleLogin} style={{ width: '100%', background: '#1A1612', color: '#fff', border: 'none', padding: 13, fontSize: 11, fontFamily: "'Outfit',sans-serif", fontWeight: 400, letterSpacing: '.2em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: 2 }}>Enter</button>
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
        .th { font-size:10px; font-weight:400; letter-spacing:.14em; text-transform:uppercase; color:#9A9080; padding:10px 14px; text-align:left; cursor:pointer; white-space:nowrap; user-select:none; }
        .th:hover { color:#1A1612; }
        .td { font-size:13px; font-weight:300; color:#1A1612; padding:11px 14px; border-bottom:1px solid #EDEAE4; vertical-align:middle; }
        .tr:last-child td { border-bottom:none; }
        .tr:hover td { background:#FAFAF8; }
        .badge { display:inline-block; font-size:10px; font-weight:400; padding:3px 8px; border-radius:1px; letter-spacing:.06em; text-transform:uppercase; }
      `}</style>

      <div style={{ borderBottom: '1px solid #E8E0D4', background: '#fff' }}>
        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.75rem', maxWidth: 1200, margin: '0 auto' }}>
          <a href="/" style={{ fontSize: 15, fontWeight: 400, letterSpacing: '.12em', textTransform: 'uppercase', color: '#1A1612', textDecoration: 'none' }}>Gemly</a>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <span style={{ fontSize: 10, fontWeight: 300, letterSpacing: '.2em', textTransform: 'uppercase', color: '#9A9080' }}>Admin</span>
            <button onClick={loadData} style={{ background: 'none', border: '1px solid #EDEAE4', borderRadius: 2, padding: '6px 14px', fontSize: 11, fontFamily: "'Outfit',sans-serif", fontWeight: 300, color: '#9A9080', cursor: 'pointer', letterSpacing: '.1em', textTransform: 'uppercase' }}>
              ↻ Refresh
            </button>
          </div>
        </nav>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.75rem' }}>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 10 }}>
          {[
            { label: 'Revenue', value: `€${totalRevenue.toFixed(2)}`, sub: `${orders.length} orders`, color: '#1A1612' },
            { label: 'Stripe fees', value: `-€${totalStripeFees.toFixed(2)}`, sub: '1.4% + €0.25', color: '#8A3A30' },
            { label: 'API costs', value: `-€${totalApiCosts.toFixed(2)}`, sub: `${totalSearches} searches × €0.20`, color: '#8A3A30' },
            { label: 'Net profit', value: `€${netProfit.toFixed(2)}`, sub: netProfit >= 0 ? '🟢 positive' : '🔴 negative', color: netProfit >= 0 ? '#5A7A5A' : '#8A3A30' },
          ].map(({ label, value, sub, color }) => (
            <div key={label} style={{ background: '#fff', border: '1px solid #EDEAE4', borderRadius: 2, padding: '1rem 1.25rem' }}>
              <div style={{ fontSize: 10, fontWeight: 400, letterSpacing: '.16em', textTransform: 'uppercase', color: '#9A9080', marginBottom: 6 }}>{label}</div>
              <div style={{ fontSize: 26, fontWeight: 200, color, lineHeight: 1, marginBottom: 4 }}>{value}</div>
              <div style={{ fontSize: 11, color: '#C8C0B4', fontWeight: 300 }}>{sub}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 10 }}>
          {[
            { label: 'Total users', value: users.length, sub: 'registered' },
            { label: 'Active', value: users.filter(u => u.total_searches > 0).length, sub: '≥1 search done' },
            { label: 'Via referral', value: users.filter(u => u.referred_by).length, s
