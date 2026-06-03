'use client';
import { useState } from 'react';
import { createClient } from '../../lib/supabase';

const ADMIN_PASSWORD = 'gemly2026';
const API_COST = 0.20;
const stripeFee = (amount) => amount * 0.014 + 0.25;

// Maakt van search_history altijd een array, of het nu een array of een JSON-string is.
const parseHistory = (raw) => {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string' && raw.trim()) {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

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

  // ---- SCANS: lees alle search_history uit de profielen (array OF string) ----
  const allScans = [];
  users.forEach(u => {
    const hist = parseHistory(u.search_history);
    hist.forEach(item => {
      if (item && item.query) {
        allScans.push({ query: item.query, date: item.date || null });
      }
    });
  });
  const recentScans = [...allScans].sort((a, b) => {
    const ad = a.date ? new Date(a.date).getTime() : 0;
    const bd = b.date ? new Date(b.date).getTime() : 0;
    return bd - ad;
  });
  const queryCount = {};
  allScans.forEach(s => {
    const key = s.query.trim();
    queryCount[key] = (queryCount[key] || 0) + 1;
  });
  const topQueries = Object.entries(queryCount)
    .map(([query, count]) => ({ query, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);
  const maxQueryCount = topQueries[0]?.count || 1;
  // -------------------------------------------------------------------------

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
            { label: 'Via referral', value: users.filter(u => u.referred_by).length, sub: 'referred signups' },
            { label: 'Total searches', value: totalSearches, sub: 'all time' },
          ].map(({ label, value, sub }) => (
            <div key={label} style={{ background: '#fff', border: '1px solid #EDEAE4', borderRadius: 2, padding: '1rem 1.25rem' }}>
              <div style={{ fontSize: 10, fontWeight: 400, letterSpacing: '.16em', textTransform: 'uppercase', color: '#9A9080', marginBottom: 6 }}>{label}</div>
              <div style={{ fontSize: 26, fontWeight: 200, color: '#1A1612', lineHeight: 1, marginBottom: 4 }}>{value}</div>
              <div style={{ fontSize: 11, color: '#C8C0B4', fontWeight: 300 }}>{sub}</div>
            </div>
          ))}
        </div>

        <div style={{ background: '#fff', border: '1px solid #EDEAE4', borderRadius: 2, padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: 10, fontWeight: 400, letterSpacing: '.16em', textTransform: 'uppercase', color: '#9A9080', marginBottom: '1rem' }}>Users by country</div>
          {countries.length === 0 ? (
            <p style={{ fontSize: 13, color: '#C8C0B4', fontWeight: 300 }}>No data yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {countries.map(({ name, users: count, searches }) => (
                <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 120, fontSize: 13, fontWeight: 300, color: '#1A1612', flexShrink: 0 }}>{name}</div>
                  <div style={{ flex: 1, height: 6, background: '#F5F0E8', borderRadius: 1, overflow: 'hidden' }}>
                    <div style={{ width: `${(count / maxUsers) * 100}%`, height: '100%', background: '#1A1612', borderRadius: 1, transition: 'width .4s' }} />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#1A1612', width: 24, textAlign: 'right', flexShrink: 0 }}>{count}</div>
                  <div style={{ fontSize: 11, color: '#C8C0B4', fontWeight: 300, width: 80, flexShrink: 0 }}>{searches} searches</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 6, marginBottom: '1rem' }}>
          {['users', 'orders', 'scans'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ background: tab === t ? '#1A1612' : '#fff', color: tab === t ? '#fff' : '#9A9080', border: '1px solid', borderColor: tab === t ? '#1A1612' : '#EDEAE4', borderRadius: 2, padding: '7px 18px', fontSize: 11, fontFamily: "'Outfit',sans-serif", fontWeight: 400, letterSpacing: '.14em', textTransform: 'uppercase', cursor: 'pointer' }}>
              {t === 'users' ? `Users (${users.length})` : t === 'orders' ? `Orders (${orders.length})` : `Scans (${allScans.length})`}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ background: '#fff', border: '1px solid #EDEAE4', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem' }}>
            <div style={{ width: 24, height: 24, border: '1.5px solid #EDEAE4', borderTopColor: '#1A1612', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : tab === 'users' ? (
          <div style={{ background: '#fff', border: '1px solid #EDEAE4', borderRadius: 2, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #EDEAE4', background: '#FAFAF8' }}>
                  <th className="th" onClick={() => toggleSort('full_name')}>Name <Arrow col="full_name" /></th>
                  <th className="th">Email</th>
                  <th className="th">Country</th>
                  <th className="th" onClick={() => toggleSort('total_searches')}>Searches <Arrow col="total_searches" /></th>
                  <th className="th" onClick={() => toggleSort('credits')}>Credits <Arrow col="credits" /></th>
                  <th className="th">Referral</th>
                  <th className="th" onClick={() => toggleSort('created_at')}>Joined <Arrow col="created_at" /></th>
                </tr>
              </thead>
              <tbody>
                {sorted.map(u => (
                  <tr key={u.id} className="tr">
                    <td className="td" style={{ fontWeight: 400 }}>{u.full_name || <span style={{ color: '#C8C0B4' }}>—</span>}</td>
                    <td className="td" style={{ color: '#9A9080', fontSize: 12 }}>{u.email || <span style={{ color: '#C8C0B4' }}>—</span>}</td>
                    <td className="td" style={{ color: '#9A9080' }}>{u.country || <span style={{ color: '#C8C0B4' }}>—</span>}</td>
                    <td className="td">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 500 }}>{u.total_searches || 0}</span>
                        {(u.total_searches || 0) > 5 && <span className="badge" style={{ background: '#EEF4EE', color: '#5A7A5A' }}>Active</span>}
                        {(u.total_searches || 0) === 0 && <span className="badge" style={{ background: '#F5F0E8', color: '#C8C0B4' }}>Unused</span>}
                      </div>
                    </td>
                    <td className="td">
                      <span style={{ background: creditBg(u.credits ?? 0), color: creditColor(u.credits ?? 0), fontWeight: 500, fontSize: 13, padding: '3px 10px', borderRadius: 1, display: 'inline-block' }}>
                        {u.credits ?? 0}
                      </span>
                    </td>
                    <td className="td">
                      {u.referred_by
                        ? <span className="badge" style={{ background: '#F0F5F0', color: '#5A7A5A' }}>Via referral</span>
                        : <span style={{ color: '#C8C0B4', fontSize: 12 }}>Direct</span>}
                    </td>
                    <td className="td" style={{ color: '#9A9080', fontSize: 12 }}>
                      {u.created_at ? new Date(u.created_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                  </tr>
                ))}
                {sorted.length === 0 && <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#9A9080', fontSize: 13 }}>No users yet.</td></tr>}
              </tbody>
            </table>
          </div>
        ) : tab === 'orders' ? (
          <div style={{ background: '#fff', border: '1px solid #EDEAE4', borderRadius: 2, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #EDEAE4', background: '#FAFAF8' }}>
                  <th className="th">Date</th>
                  <th className="th">Package</th>
                  <th className="th">Revenue</th>
                  <th className="th">Stripe fee</th>
                  <th className="th">API cost</th>
                  <th className="th">Profit</th>
                  <th className="th">Credits</th>
                  <th className="th">User</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => {
                  const fee = stripeFee(o.amount_eur || 0);
                  const api = (o.credits_added || 0) * API_COST;
                  const profit = (o.amount_eur || 0) - fee - api;
                  const user = users.find(u => u.id === o.user_id);
                  const pkgBg = o.package_name?.toLowerCase().includes('pro') ? '#EEF4EE' : o.package_name?.toLowerCase().includes('plus') ? '#EEF0F8' : '#F5F0E8';
                  const pkgColor = o.package_name?.toLowerCase().includes('pro') ? '#5A7A5A' : o.package_name?.toLowerCase().includes('plus') ? '#4A6A8A' : '#8A7040';
                  return (
                    <tr key={o.id} className="tr">
                      <td className="td" style={{ color: '#9A9080', fontSize: 12, whiteSpace: 'nowrap' }}>
                        {o.created_at ? new Date(o.created_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                      </td>
                      <td className="td"><span className="badge" style={{ background: pkgBg, color: pkgColor }}>{o.package_name || '—'}</span></td>
                      <td className="td" style={{ fontWeight: 500 }}>€{(o.amount_eur || 0).toFixed(2)}</td>
                      <td className="td" style={{ color: '#8A3A30' }}>-€{fee.toFixed(2)}</td>
                      <td className="td" style={{ color: '#8A3A30' }}>-€{api.toFixed(2)}</td>
                      <td className="td" style={{ color: profit >= 0 ? '#5A7A5A' : '#8A3A30', fontWeight: 500 }}>€{profit.toFixed(2)}</td>
                      <td className="td">+{o.credits_added || 0}</td>
                      <td className="td" style={{ color: '#9A9080', fontSize: 12 }}>{user?.full_name || user?.email || <span style={{ color: '#C8C0B4' }}>—</span>}</td>
                    </tr>
                  );
                })}
                {orders.length === 0 && <tr><td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: '#9A9080', fontSize: 13 }}>No orders yet.</td></tr>}
              </tbody>
            </table>
          </div>
        ) : (
          <div>
            <div style={{ background: '#fff', border: '1px solid #EDEAE4', borderRadius: 2, padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: 10, fontWeight: 400, letterSpacing: '.16em', textTransform: 'uppercase', color: '#9A9080', marginBottom: '1rem' }}>Most searched items</div>
              {topQueries.length === 0 ? (
                <p style={{ fontSize: 13, color: '#C8C0B4', fontWeight: 300 }}>No scans yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {topQueries.map(({ query, count }) => (
                    <div key={query} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ flex: 1, fontSize: 13, fontWeight: 300, color: '#1A1612', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{query}</div>
                      <div style={{ width: 160, height: 6, background: '#F5F0E8', borderRadius: 1, overflow: 'hidden', flexShrink: 0 }}>
                        <div style={{ width: `${(count / maxQueryCount) * 100}%`, height: '100%', background: '#1A1612', borderRadius: 1, transition: 'width .4s' }} />
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#1A1612', width: 28, textAlign: 'right', flexShrink: 0 }}>{count}×</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ background: '#fff', border: '1px solid #EDEAE4', borderRadius: 2, overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #EDEAE4', background: '#FAFAF8' }}>
                    <th className="th">Search query</th>
                    <th className="th">When</th>
                  </tr>
                </thead>
                <tbody>
                  {recentScans.slice(0, 100).map((s, i) => (
                    <tr key={i} className="tr">
                      <td className="td" style={{ fontWeight: 400 }}>{s.query}</td>
                      <td className="td" style={{ color: '#9A9080', fontSize: 12, whiteSpace: 'nowrap' }}>
                        {s.date ? new Date(s.date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                      </td>
                    </tr>
                  ))}
                  {recentScans.length === 0 && <tr><td colSpan={2} style={{ padding: '2rem', textAlign: 'center', color: '#9A9080', fontSize: 13 }}>No scans yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
