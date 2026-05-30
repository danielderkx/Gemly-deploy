'use client';

const SECTIONS = [
  {
    h: '1. About Gemly',
    p: 'Gemly ("we", "us", "our") is a search and discovery tool that helps you find secondhand and new items across third-party marketplaces and local shops. Gemly is operated from the Netherlands. By creating an account or using Gemly, you agree to these Terms of Service.',
  },
  {
    h: '2. What Gemly does and does not do',
    p: 'Gemly identifies items and surfaces listings from third-party platforms such as Vinted, Depop, Grailed, eBay, Vestiaire Collective and others. Gemly does not sell, stock, own, or ship any item. We do not guarantee that a specific item will be found, nor that any listing, price, or condition shown is accurate or still available. All transactions take place directly between you and the relevant seller or platform.',
  },
  {
    h: '3. Accounts',
    p: 'You must provide accurate information when creating an account and are responsible for keeping your login details secure. You must be at least 16 years old to use Gemly. You are responsible for all activity that happens under your account.',
  },
  {
    h: '4. Credits and payments',
    p: 'New accounts receive a number of free searches. Additional searches require credits, which can be purchased through our payment provider, Stripe. Each search consumes credits as indicated in the app. Credits have no cash value, are non-transferable, and are non-refundable except where required by law.',
  },
  {
    h: '5. Acceptable use',
    p: 'You agree not to misuse Gemly, including by attempting to access it through automated means, reselling access, scraping results, overloading our systems, or using the service for any unlawful purpose. We may suspend or terminate accounts that violate these terms.',
  },
  {
    h: '6. Third-party platforms',
    p: 'Gemly links to external marketplaces and shops. We have no control over those platforms, their listings, their sellers, or their terms. Any purchase, payment, dispute, or shipping issue is solely between you and that third party. We are not responsible for their content or conduct.',
  },
  {
    h: '7. No warranties',
    p: 'Gemly is provided "as is" and "as available". We make no warranties about the accuracy, completeness, availability, or reliability of search results. To the maximum extent permitted by law, we disclaim all implied warranties.',
  },
  {
    h: '8. Limitation of liability',
    p: 'To the extent permitted by law, Gemly is not liable for any indirect, incidental, or consequential damages, or for any loss arising from your reliance on search results, purchases made through third parties, or unavailability of the service. Nothing in these terms limits liability that cannot be excluded under applicable law.',
  },
  {
    h: '9. Changes',
    p: 'We may update these terms from time to time. Material changes will be communicated through the app or by email. Continued use of Gemly after changes take effect means you accept the updated terms.',
  },
  {
    h: '10. Contact',
    p: 'Questions about these terms can be sent to hello@gemly.org.',
  },
];

export default function TermsPage() {
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
        <h1 style={{ fontSize:'clamp(28px,5vw,40px)', fontWeight:200, letterSpacing:'-.02em', marginBottom:'0.5rem' }}>Terms of Service</h1>
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
