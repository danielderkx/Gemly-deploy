'use client';

const SECTIONS = [
  {
    h: '1. Who we are',
    p: 'Gemly ("we", "us", "our") operates the Gemly search service. This Privacy Policy explains what personal data we collect, why, and what rights you have under the General Data Protection Regulation (GDPR). Gemly is operated from the Netherlands.',
  },
  {
    h: '2. Data we collect',
    p: 'When you create an account we collect your name, email address, and country. When you use Gemly we store your search history, credit balance, and referral information. Payments are processed by Stripe; we do not store your full card details. We may also collect basic technical data such as approximate location (to localise results) and usage logs.',
  },
  {
    h: '3. Why we use your data',
    p: 'We use your data to provide the service (identifying items and returning localised results), to manage your account and credits, to process payments through Stripe, to send transactional emails such as welcome and account notifications, and to improve and secure the service.',
  },
  {
    h: '4. Legal basis',
    p: 'We process your data on the basis of performing our contract with you (providing the service you signed up for), your consent (where applicable, such as optional communications), and our legitimate interests (keeping the service secure and improving it).',
  },
  {
    h: '5. Sharing your data',
    p: 'We share data only with service providers that help us operate Gemly: Supabase (authentication and database), Vercel (hosting), Resend (email delivery), and Stripe (payments). These providers process data on our behalf under data processing agreements. We do not sell your personal data, and we do not show third-party advertising based on your data.',
  },
  {
    h: '6. Data retention',
    p: 'We keep your account data for as long as your account is active. When you delete your account, your profile and associated data are permanently removed from our systems. Some limited records may be retained where required by law, for example for payment or tax purposes.',
  },
  {
    h: '7. Your rights',
    p: 'Under the GDPR you have the right to access, correct, or delete your personal data, to restrict or object to processing, and to data portability. You can delete your account at any time from your account page. For any other request, contact us and we will respond within the period required by law. You also have the right to lodge a complaint with the Dutch Data Protection Authority (Autoriteit Persoonsgegevens).',
  },
  {
    h: '8. International transfers',
    p: 'Some of our providers may process data outside the European Economic Area. Where that happens, we rely on appropriate safeguards such as the European Commission’s Standard Contractual Clauses.',
  },
  {
    h: '9. Cookies',
    p: 'Gemly uses essential cookies and similar technologies needed to keep you logged in and to operate the service. We do not use advertising or third-party tracking cookies.',
  },
  {
    h: '10. Changes',
    p: 'We may update this policy from time to time. Material changes will be communicated through the app or by email.',
  },
  {
    h: '11. Contact',
    p: 'For privacy questions or to exercise your rights, contact us at hello@gemly.org.',
  },
];

export default function PrivacyPage() {
  return (
    <div style={{ minHeight:'100vh', background:'#F5F0E8', fontFamily:"'Outfit',sans-serif", color:'#1A1612' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@200;300;400;500&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        .nav-link { font-size:11px; font-weight:300; letter-spacing:.15em; text-transform:uppercase; color:#9A9080; text-decoration:none; transition:color .2s; }
        .nav-link:hover { color:#1A1612; }
        @media (max-width:640px){ .doc-body { padding:2.5rem 1.5rem !important; } .doc-nav { padding:1rem 1.5rem !important; } }
      `}</style>

      <div style={{ borderBottom:'1px solid #E8E0D4', background:'#fff' }}>
        <nav className="doc-nav" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'1.25rem 1.75rem', maxWidth:760, margin:'0 auto' }}>
          <a href="/" style={{ fontSize:15, fontWeight:400, letterSpacing:'.12em', textTransform:'uppercase', color:'#1A1612', textDecoration:'none' }}>Gemly</a>
          <a href="/" className="nav-link">← Home</a>
        </nav>
      </div>

      <div className="doc-body" style={{ maxWidth:760, margin:'0 auto', padding:'3.5rem 1.75rem 5rem' }}>
        <p style={{ fontSize:10, fontWeight:300, letterSpacing:'.25em', textTransform:'uppercase', color:'#9A9080', marginBottom:'0.75rem' }}>Legal</p>
        <h1 style={{ fontSize:'clamp(28px,5vw,40px)', fontWeight:200, letterSpacing:'-.02em', marginBottom:'0.5rem' }}>Privacy Policy</h1>
        <p style={{ fontSize:12, fontWeight:300, color:'#9A9080', marginBottom:'3rem' }}>Last updated: 30 May 2026</p>

        {SECTIONS.map((s, i) => (
          <div key={i} style={{ marginBottom:'2rem' }}>
            <h2 style={{ fontSize:16, fontWeight:500, marginBottom:'0.6rem', letterSpacing:'-.01em' }}>{s.h}</h2>
            <p style={{ fontSize:14, fontWeight:300, color:'#5A554D', lineHeight:1.8 }}>{s.p}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
