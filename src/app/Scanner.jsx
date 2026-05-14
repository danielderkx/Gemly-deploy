'use client';
import { useState, useRef, useEffect } from "react";

const SEARCHES_KEY = "gemly_recent_searches";
const saveSearch = (query) => {
  try {
    const existing = JSON.parse(localStorage.getItem(SEARCHES_KEY) || "[]");
    const updated = [query, ...existing.filter(q => q !== query)].slice(0, 20);
    localStorage.setItem(SEARCHES_KEY, JSON.stringify(updated));
    const count = parseInt(localStorage.getItem("gemly_search_count") || "0") + 1;
    localStorage.setItem("gemly_search_count", count);
  } catch {}
};
const getRecentSearches = () => {
  try { return JSON.parse(localStorage.getItem(SEARCHES_KEY) || "[]"); } catch { return []; }
};

const sortByPrice = (listings) => {
  return [...listings].sort((a, b) => {
    const getNum = p => parseFloat((p || "").replace(/[^0-9.,]/g, "").replace(",", ".")) || 99999;
    return getNum(a.price) - getNum(b.price);
  });
};

const getContinent = c => ({ EU:"Europe", NA:"North America", SA:"South America", AS:"Asia", AF:"Africa", OC:"Oceania" }[c] || "your continent");
const getFlag = c => !c ? "🌍" : c.toUpperCase().replace(/./g, x => String.fromCodePoint(x.charCodeAt(0)+127397));
const getCurrency = cc => ({ GB:"£", US:"$", CA:"CA$", AU:"AU$", CH:"CHF", JP:"¥" }[cc] || "€");

const getFallbackUrl = (platform, query) => {
  const q = encodeURIComponent(query);
  const p = (platform || "").toLowerCase();
  if (p.includes("vinted")) return `https://www.vinted.nl/catalog?search_text=${q}`;
  if (p.includes("grailed")) return `https://www.grailed.com/shop/listings?query=${q}`;
  if (p.includes("depop")) return `https://www.depop.com/search/?q=${q}`;
  if (p.includes("stockx")) return `https://stockx.com/search?s=${q}`;
  if (p.includes("vestiaire")) return `https://www.vestiairecollective.com/search/?q=${q}`;
  if (p.includes("ebay")) return `https://www.ebay.com/sch/i.html?_nkw=${q}`;
  if (p.includes("marktplaats")) return `https://www.marktplaats.nl/q/${q}`;
  if (p.includes("goat")) return `https://www.goat.com/search?query=${q}`;
  return `https://www.google.com/search?q=${q}+${p}+kopen`;
};

const getSearchPlatforms = (condition, cc, radius, cont, category) => {
  const isEU = cont==="EU" || ["NL","BE","DE","FR","ES","IT","PT","SE","DK","NO","FI","PL","AT","CH"].includes(cc);
  if (category === "watches") {
    if (condition === "new") return "Chrono24 (chrono24.com), Watchfinder (watchfinder.com), Watches of Switzerland, official brand websites";
    return "Chrono24 (chrono24.com), Watchfinder (watchfinder.com), eBay, Catawiki, Watchbox";
  }
  if (category === "jewelry") {
    if (condition === "new") return "1stDibs (1stdibs.com), official brand websites, VRAI, Mejuri";
    return "1stDibs (1stdibs.com), Etsy, eBay, Vestiaire Collective, Catawiki";
  }
  if (category === "shoes") {
    if (condition === "new") {
      if (isEU) return "Zalando, ASOS, Foot Locker (footlocker.eu), Snipes (snipes.com), Courir, About You, Sizeer, official brand websites (Nike.com, Adidas.com, New Balance)";
      return "StockX (stockx.com), GOAT (goat.com), Foot Locker, ASOS, Farfetch, official brand websites";
    }
    if (isEU) return "Vinted (vinted.nl / vinted.fr / vinted.de), Marktplaats (marktplaats.nl), eBay, Vestiaire Collective, StockX (stockx.com), GOAT (goat.com), Depop, Grailed (grailed.com)";
    return "StockX (stockx.com), GOAT (goat.com), eBay, Vinted, Vestiaire Collective, Grailed (grailed.com), Depop";
  }
  if (category === "tops" || category === "bottoms" || category === "dresses") {
    if (condition === "new") {
      if (isEU) return "Zalando, ASOS, About You, H&M, Zara, Uniqlo, Cos, & Other Stories, Mango, Farfetch, END Clothing";
      return "ASOS, Farfetch, SSENSE, END Clothing, Zalando, H&M, Zara";
    }
    if (isEU) return "Vinted (vinted.nl / vinted.fr / vinted.de), Marktplaats (marktplaats.nl), Depop, Vestiaire Collective, eBay, Grailed (grailed.com), Sellpy (sellpy.nl)";
    return "Grailed (grailed.com), Depop, Vinted, Vestiaire Collective, eBay";
  }
  const isNew = condition === "new";
  if (isNew) {
    if (radius === "country") {
      if (cc==="NL") return "Zalando (zalando.nl), Bijenkorf (debijenkorf.nl), Wehkamp (wehkamp.nl), Bol.com, ASOS, About You, H&M (hm.com), Zara (zara.com), Uniqlo, Cos, Mango, Nike.com, Adidas.com";
      if (cc==="BE") return "Zalando (zalando.be), 2dehands (2dehands.be — new section), bol.com, ASOS, H&M, Zara, Uniqlo, Nike.com, Adidas.com";
      if (cc==="GB") return "ASOS, John Lewis (johnlewis.com), Selfridges, M&S, Next, Zara, H&M, Uniqlo, Nike.com, END Clothing, Flannels";
      if (cc==="US") return "Nordstrom, Saks Fifth Avenue, SSENSE, END Clothing, ASOS, Zara, H&M, Nike.com, Adidas.com, Bloomingdale's";
      if (cc==="DE") return "Zalando (zalando.de), About You (aboutyou.de), Otto (otto.de), H&M, Zara, Uniqlo, Nike.com, Adidas.com, Breuninger";
      if (cc==="FR") return "Zalando (zalando.fr), ASOS, H&M, Zara, Uniqlo, Galeries Lafayette, Le Bon Marché, Mango, Nike.com";
      if (cc==="ES") return "Zalando (zalando.es), ASOS, Zara, H&M, Mango, El Corte Inglés, Nike.com, Adidas.com";
      return "Zalando, ASOS, H&M, Zara, Uniqlo, Nike.com, Adidas.com, About You";
    }
    if (radius === "continent") {
      if (isEU) return "Zalando, ASOS, Farfetch (farfetch.com), Net-a-Porter (net-a-porter.com), Mytheresa (mytheresa.com), END Clothing (endclothing.com), About You, SSENSE, Cos, & Other Stories, H&M, Zara, Uniqlo";
      return "Farfetch, Net-a-Porter, SSENSE, Nordstrom, END Clothing, ASOS";
    }
    return "Farfetch, SSENSE, Net-a-Porter, Mytheresa, END Clothing, Zalando, ASOS, Uniqlo";
  }
  if (radius === "country") {
    if (cc==="NL") return "Marktplaats (marktplaats.nl), Vinted NL (vinted.nl), Sellpy NL (sellpy.nl), Depop, eBay.nl, Vestiaire Collective, Grailed (grailed.com)";
    if (cc==="BE") return "2dehands (2dehands.be), Vinted BE (vinted.be), eBay, Vestiaire Collective, Depop";
    if (cc==="GB") return "eBay UK (ebay.co.uk), Vinted UK (vinted.co.uk), Depop, Vestiaire Collective, Grailed, Preloved";
    if (cc==="DE") return "Kleinanzeigen (kleinanzeigen.de), Vinted DE (vinted.de), eBay.de, Vestiaire Collective, Sellpy, Grailed";
    if (cc==="FR") return "Vinted FR (vinted.fr), Le Bon Coin (leboncoin.fr), Vestiaire Collective, eBay.fr, Vide Dressing (videdressing.com)";
    if (cc==="ES") return "Wallapop (wallapop.com), Vinted ES, Vestiaire Collective, eBay.es, Micolet";
    if (cc==="US") return "Grailed (grailed.com), Poshmark, Depop, The RealReal, StockX, eBay";
    return "eBay, Vinted, Grailed, Depop, Vestiaire Collective";
  }
  if (radius === "continent") {
    if (isEU) return "Vinted (vinted.nl / vinted.fr / vinted.de / vinted.be), eBay (ebay.nl / ebay.de / ebay.co.uk), Vestiaire Collective (vestiairecollective.com), Depop, Grailed (grailed.com), Marktplaats (marktplaats.nl), Sellpy (sellpy.nl), Wallapop (wallapop.com), Catawiki (catawiki.com), Kleinanzeigen (kleinanzeigen.de), Le Bon Coin (leboncoin.fr)";
    return "eBay, Grailed, Poshmark, Depop, The RealReal, StockX";
  }
  return "eBay, Grailed (grailed.com), Vestiaire Collective, Depop, The RealReal, Poshmark, StockX, Catawiki, Vinted";
};

const parseJSON = text => {
  if (!text) return null;
  text = text.replace(/```json|```/g,"").trim();
  const s = text.indexOf("{"), e = text.lastIndexOf("}");
  if (s===-1||e===-1) return null;
  try { return JSON.parse(text.slice(s,e+1)); } catch {}
  const lines = text.split("\n");
  for (let i=0;i<lines.length;i++) for (let j=lines.length;j>i;j--) {
    try { const c=lines.slice(i,j).join("\n"); if(c.includes("{")&&c.includes("}")) return JSON.parse(c); } catch {}
  }
  return null;
};

const SIZE_CATS = {
  tops:    { label:"Tops & jackets",   sizes:["XS","S","M","L","XL","XXL","3XL"] },
  bottoms: { label:"Bottoms & jeans",  sizes:["26","28","30","32","34","36","38","40"] },
  dresses: { label:"Dresses & skirts", sizes:["XS","S","M","L","XL","XXL"] },
  shoes:   { label:"Shoes",            sizes:["35","36","37","38","39","40","41","42","43","44","45","46","47","48","49","50"] },
  kids:    { label:"Kids",             sizes:["86","92","98","104","110","116","122","128","140","152","164","176"] },
};
const QUALITY_OPTS = [
  { val:"new_with_tags", label:"New with tags",  desc:"Unworn, tags still attached", dot:"#4CAF50" },
  { val:"like_new",      label:"Like new",       desc:"Worn once or twice",          dot:"#8BC34A" },
  { val:"good",          label:"Good condition", desc:"Normal gentle-use wear",      dot:"#FFC107" },
  { val:"fair",          label:"Fair / worn",    desc:"Visible wear, fully usable",  dot:"#FF9800" },
  { val:"any",           label:"Any condition",  desc:"Show me everything",          dot:"#C9C2B8" },
];
const STEP_ORDER = ["match_type","size","condition","quality","price","location","results"];

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@200;300;400;500&display=swap');
  * { box-sizing:border-box; }

  /* Base */
  .app { font-family:'Outfit',sans-serif; background:#fff; border-radius:0; padding:2rem 1.75rem; }
  .app-header { text-align:center; margin-bottom:2rem; padding-bottom:1.5rem; border-bottom:1px solid #EDEAE4; }
  .app-title { font-family:'Outfit',sans-serif; font-size:18px; font-weight:400; letter-spacing:.14em; text-transform:uppercase; color:#1A1612; margin:0 0 4px; }
  .app-sub { font-size:10px; color:#9A9080; letter-spacing:.2em; text-transform:uppercase; margin:0; font-weight:300; }

  /* Progress */
  .progress-row { display:flex; gap:4px; margin-bottom:1.75rem; }
  .pdot { flex:1; height:2px; background:#EDEAE4; transition:background .4s; }
  .pdot.done { background:#C8C0B4; }
  .pdot.active { background:#1A1612; }

  /* Drop zone */
  .drop-zone { border:1px solid #EDEAE4; border-radius:4px; padding:2.5rem 1.5rem; text-align:center; cursor:pointer; transition:all .2s; background:#F5F0E8; }
  .drop-zone:hover,.drop-zone.active { border-color:#1A1612; background:#EDE6D6; }
  .drop-icon { width:48px; height:48px; border-radius:50%; background:#E8E0D2; margin:0 auto .85rem; display:flex; align-items:center; justify-content:center; }
  .drop-zone:hover .drop-icon { background:#D8D0C2; }

  /* Inputs */
  .search-row { display:flex; gap:8px; }
  .search-input { border:1px solid #EDEAE4; border-radius:2px; padding:.75rem 1rem; font-size:14px; font-family:'Outfit',sans-serif; font-weight:300; flex:1; background:#fff; color:#1A1612; outline:none; transition:border-color .2s; }
  .search-input:focus { border-color:#1A1612; }
  .search-input::placeholder { color:#C8C0B4; }
  .search-btn { background:#1A1612; color:#fff; border:none; border-radius:2px; padding:.75rem 1.1rem; font-size:12px; font-family:'Outfit',sans-serif; font-weight:400; letter-spacing:.1em; cursor:pointer; white-space:nowrap; transition:background .2s; }
  .search-btn:hover { background:#3A3028; }
  .search-btn:disabled { background:#C8C0B4; cursor:not-allowed; }

  /* Buttons */
  .btn-primary { background:#1A1612; color:#fff; border:none; border-radius:2px; padding:.85rem 1.5rem; font-size:11px; font-family:'Outfit',sans-serif; font-weight:400; letter-spacing:.18em; text-transform:uppercase; cursor:pointer; transition:all .2s; width:100%; }
  .btn-primary:hover { background:#3A3028; }
  .btn-primary:disabled { background:#C8C0B4; cursor:not-allowed; }
  .btn-ghost { background:transparent; color:#1A1612; border:1px solid #EDEAE4; border-radius:2px; padding:.8rem 1.5rem; font-size:11px; font-family:'Outfit',sans-serif; font-weight:400; letter-spacing:.14em; text-transform:uppercase; cursor:pointer; transition:all .2s; width:100%; }
  .btn-ghost:hover { border-color:#1A1612; }

  /* Choice cards */
  .choice-card { background:#fff; border:1px solid #EDEAE4; border-radius:2px; padding:1rem 1.15rem; cursor:pointer; text-align:left; transition:all .2s; width:100%; font-family:'Outfit',sans-serif; position:relative; overflow:hidden; }
  .choice-card:hover { border-color:#1A1612; }
  .choice-card.selected { border-color:#1A1612; background:#F5F0E8; }
  .choice-card.selected::after { content:'✓'; position:absolute; right:14px; top:50%; transform:translateY(-50%); color:#1A1612; font-size:14px; font-weight:500; }

  /* Size chips */
  .size-chip { background:#fff; border:1px solid #EDEAE4; border-radius:2px; padding:.55rem .9rem; cursor:pointer; font-family:'Outfit',sans-serif; font-size:13px; font-weight:300; color:#1A1612; transition:all .2s; text-align:center; }
  .size-chip:hover { border-color:#1A1612; }
  .size-chip.selected { border-color:#1A1612; background:#F5F0E8; }

  /* Text input */
  .text-input { border:1px solid #EDEAE4; border-radius:2px; padding:.75rem 1rem; font-size:14px; font-family:'Outfit',sans-serif; font-weight:300; width:100%; background:#fff; color:#1A1612; outline:none; transition:border-color .2s; }
  .text-input:focus { border-color:#1A1612; }
  .text-input::placeholder { color:#C8C0B4; }

  /* Back button */
  .back-btn { background:none; border:none; color:#9A9080; font-size:11px; font-family:'Outfit',sans-serif; cursor:pointer; padding:0; margin-bottom:1.5rem; letter-spacing:.14em; text-transform:uppercase; display:flex; align-items:center; gap:6px; transition:color .2s; font-weight:300; }
  .back-btn:hover { color:#1A1612; }

  /* ID pill */
  .id-pill { background:#F5F0E8; border:1px solid #EDEAE4; border-radius:2px; padding:.9rem 1.1rem; margin-bottom:1.5rem; display:flex; align-items:center; gap:10px; }

  /* Label */
  .lbl { font-size:10px; color:#9A9080; letter-spacing:.2em; text-transform:uppercase; font-weight:400; margin-bottom:5px; display:block; }

  /* Price estimate */
  .price-est { border-radius:2px; padding:.85rem 1rem; margin-bottom:1.25rem; display:flex; gap:10px; align-items:flex-start; }
  .price-est.loading { background:#F5F0E8; border:1px solid #EDEAE4; }
  .price-est.ready { background:#F0F5F0; border:1px solid #C8D8C8; }
  .price-est.warn { background:#F8F4EC; border:1px solid #E0D4B8; }
  .est-pulse { width:7px; height:7px; border-radius:50%; background:#1A1612; animation:blink 1.2s ease-in-out infinite; flex-shrink:0; margin-top:4px; }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.2} }

  /* Budget warning */
  .bwarn { border-radius:2px; padding:.85rem 1rem; margin-bottom:1rem; display:flex; gap:10px; }
  .bwarn.warn { background:#F8F4EC; border:1px solid #E0D4B8; }
  .bwarn.danger { background:#FDF0EE; border:1px solid #E8C8C0; }

  /* Section title */
  .sec-title { display:flex; align-items:center; gap:8px; margin:1.25rem 0 .85rem; }
  .sec-title span { font-size:10px; color:#1A1612; letter-spacing:.2em; text-transform:uppercase; font-weight:400; white-space:nowrap; }
  .sec-title::after { content:''; flex:1; height:1px; background:#EDEAE4; }

  /* Listing card */
  .listing-card { background:#fff; border:1px solid #EDEAE4; border-radius:2px; padding:1.25rem 1.4rem; margin-bottom:.75rem; transition:all .2s; position:relative; overflow:hidden; }
  .listing-card::before { content:''; position:absolute; left:0; top:0; bottom:0; width:2px; background:#1A1612; transform:scaleY(0); transform-origin:bottom; transition:transform .25s; }
  .listing-card:hover { border-color:#C8C0B4; box-shadow:0 2px 12px rgba(0,0,0,.06); }
  .listing-card:hover::before { transform:scaleY(1); }
  .listing-num { font-family:'Outfit',sans-serif; font-size:22px; font-weight:200; color:#C8C0B4; line-height:1; margin-right:12px; flex-shrink:0; }
  .listing-title { font-size:13px; color:#1A1612; font-weight:400; line-height:1.4; margin-bottom:4px; }
  .listing-price { font-size:17px; color:#1A1612; font-weight:500; white-space:nowrap; flex-shrink:0; }
  .listing-btn { display:inline-flex; align-items:center; gap:5px; font-size:10px; font-weight:400; color:#fff; letter-spacing:.1em; text-transform:uppercase; text-decoration:none; background:#1A1612; border-radius:1px; padding:7px 12px; margin-top:8px; transition:background .2s; }
  .listing-btn:hover { background:#3A3028; }

  /* Tags */
  .tag { display:inline-block; background:#F5F0E8; color:#9A9080; font-size:10px; font-weight:400; padding:3px 8px; border-radius:1px; margin-right:4px; margin-top:3px; letter-spacing:.08em; text-transform:uppercase; }
  .tag.g { background:#EEF4EE; color:#5A7A5A; }

  /* Shop card */
  .shop-card { background:#fff; border:1px solid #EDEAE4; border-radius:2px; padding:1.1rem 1.25rem; margin-bottom:.6rem; position:relative; overflow:hidden; transition:all .2s; }
  .shop-card::before { content:''; position:absolute; left:0; top:0; bottom:0; width:2px; background:#5A7A5A; transform:scaleY(0); transform-origin:bottom; transition:transform .25s; }
  .shop-card:hover { border-color:#C8D8C8; }
  .shop-card:hover::before { transform:scaleY(1); }
  .shop-num { font-family:'Outfit',sans-serif; font-size:22px; font-weight:200; color:#C8D8C8; line-height:1; margin-right:12px; flex-shrink:0; }
  .shop-btn { display:inline-flex; align-items:center; gap:4px; font-size:10px; font-weight:400; color:#5A7A5A; text-transform:uppercase; letter-spacing:.08em; text-decoration:none; background:#EEF4EE; border:1px solid #C8D8C8; border-radius:1px; padding:5px 10px; margin-top:6px; }
  .shop-btn:hover { background:#E0EDE0; }

  /* Spinner */
  .spinner-wrap { text-align:center; padding:3rem 0 2rem; }
  .spinner { width:32px; height:32px; border:1.5px solid #EDEAE4; border-top-color:#1A1612; border-radius:50%; animation:spin 1s linear infinite; margin:0 auto 1.5rem; }
  @keyframes spin { to { transform:rotate(360deg); } }

  /* Animations */
  .slide-in { animation:slideUp .3s cubic-bezier(.22,1,.36,1); }
  @keyframes slideUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }

  /* Error */
  .err { background:#FDF0EE; border:1px solid #E8C8C0; border-radius:2px; padding:.75rem 1rem; font-size:12px; color:#8A3A30; margin-bottom:1rem; line-height:1.5; }

  /* Rescan */
  .rescan { background:none; border:none; padding:0; color:#9A9080; font-size:11px; font-family:'Outfit',sans-serif; cursor:pointer; text-decoration:underline; text-decoration-color:#EDEAE4; transition:color .2s; font-weight:300; }
  .rescan:hover { color:#1A1612; }

  /* Image thumb */
  .img-thumb { width:44px; height:44px; object-fit:cover; border-radius:2px; border:1px solid #EDEAE4; flex-shrink:0; }

  /* Scan wrap */
  .scan-wrap { position:relative; display:inline-block; margin-bottom:1.75rem; }
  .scan-pulse { position:absolute; inset:-10px; border:1px solid #1A1612; border-radius:4px; opacity:0; animation:pr 1.8s ease-out infinite; }
  @keyframes pr { 0%{transform:scale(.92);opacity:.4} 100%{transform:scale(1.08);opacity:0} }

  /* Divider */
  .divgem { text-align:center; margin:1.25rem 0 .85rem; position:relative; }
  .divgem::before { content:''; position:absolute; top:50%; left:0; right:0; height:1px; background:#EDEAE4; }
  .gem { display:inline-block; background:#fff; padding:0 10px; position:relative; font-size:16px; }

  /* Tip box */
  .tip-box { background:#EEF4EE; border:1px solid #C8D8C8; border-radius:2px; padding:.85rem 1rem; margin-bottom:1rem; display:flex; gap:10px; align-items:flex-start; }
  .cdot { width:9px; height:9px; border-radius:50%; flex-shrink:0; margin-top:3px; }

  /* Search steps */
  .ssteps { display:flex; flex-direction:column; gap:10px; margin-top:1.5rem; }
  .sstep { display:flex; align-items:center; gap:10px; }
  .sdot { width:7px; height:7px; border-radius:50%; flex-shrink:0; }
  .sdot.active { background:#1A1612; animation:blink 1.2s ease-in-out infinite; }
  .sdot.done { background:#1A1612; opacity:.3; }
  .sdot.pending { background:#EDEAE4; }

  /* Location badge */
  .loc-badge { display:flex; align-items:center; gap:8px; background:#F0F5F0; border:1px solid #C8D8C8; border-radius:2px; padding:.65rem 1rem; margin-bottom:1.25rem; }
  .locdot { width:6px; height:6px; border-radius:50%; background:#5A7A5A; animation:blink 1.4s ease-in-out infinite; flex-shrink:0; }

  /* Mode tabs */
  .mtabs { display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-bottom:1.25rem; }
  .mtab { background:#fff; border:1px solid #EDEAE4; border-radius:2px; padding:.75rem 1rem; cursor:pointer; font-family:'Outfit',sans-serif; font-size:12px; font-weight:300; color:#9A9080; transition:all .2s; text-align:center; display:flex; align-items:center; justify-content:center; gap:7px; letter-spacing:.04em; }
  .mtab:hover { border-color:#1A1612; color:#1A1612; }
  .mtab.active { border-color:#1A1612; background:#F5F0E8; color:#1A1612; font-weight:400; }

  /* No results */
  .no-results { background:#F5F0E8; border:1px solid #EDEAE4; border-radius:2px; padding:.85rem 1rem; font-size:12px; color:#9A9080; margin-bottom:.6rem; line-height:1.5; font-weight:300; }
`;

export default function App() {
  const [step, setStep] = useState("upload");
  const [inputMode, setInputMode] = useState("photo");
  const [textQuery, setTextQuery] = useState("");
  const [imageData, setImageData] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [imageMediaType, setImageMediaType] = useState("image/jpeg");
  const [identifiedItem, setIdentifiedItem] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [similarQuery, setSimilarQuery] = useState("");
  const [itemCategory, setItemCategory] = useState(null);
  const [sizeRelevant, setSizeRelevant] = useState(false);
  const [matchType, setMatchType] = useState(null);
  const [sizeCat, setSizeCat] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [customSize, setCustomSize] = useState("");
  const [condition, setCondition] = useState(null);
  const [quality, setQuality] = useState(null);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [radius, setRadius] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locLoading, setLocLoading] = useState(false);
  const [listings, setListings] = useState([]);
  const [shopResults, setShopResults] = useState([]);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [priceEst, setPriceEst] = useState(null);
  const [priceEstLoading, setPriceEstLoading] = useState(false);
  const [searchPhase, setSearchPhase] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const fileRef = useRef();
  const camRef = useRef();

  useEffect(() => { detectLocation(); }, []);

  const detectLocation = async () => {
    setLocLoading(true);
    try {
      let d = null;
      try { const r = await fetch("https://ipapi.co/json/"); d = await r.json(); } catch {}
      if (!d?.country_name) {
        try { const r = await fetch("https://ip-api.com/json/"); d = await r.json(); d.country_name=d.country; d.country_code=d.countryCode; } catch {}
      }
      if (d?.country_name) setUserLocation({ country:d.country_name, countryCode:d.country_code, city:d.city, continent:getContinent(d.continent_code), continentCode:d.continent_code });
    } catch {}
    setLocLoading(false);
  };

  const handleFile = file => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = e => {
      const b64 = e.target.result.split(",")[1];
      setImageData(e.target.result); setImageBase64(b64);
      setImageMediaType(file.type || "image/jpeg");
      identifyImage(b64, file.type || "image/jpeg");
    };
    reader.readAsDataURL(file);
  };

  const identifyImage = async (base64, mediaType) => {
    setStep("identifying"); setError("");
    try {
      const r = await fetch("/api/claude", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-sonnet-4-5", max_tokens:400,
          messages:[{ role:"user", content:[
            { type:"image", source:{ type:"base64", media_type:mediaType, data:base64 } },
            { type:"text", text:'Identify this item. Reply ONLY with JSON: {"name":"Nike Air Max 90 White","searchQuery":"Nike Air Max 90 White","similarQuery":"white sneakers","needsSize":true,"cat":"shoes"}. cat: tops/bottoms/dresses/shoes/kids/watches/jewelry/null. needsSize true only for clothing/shoes. Be specific — include brand, model, colorway.' }
          ]}]
        }),
      });
      const d = await r.json();
      if (d?.error?.type === "rate_limit_error") {
        setError("Too many requests — please wait 30 seconds and try again.");
        setStep("upload"); return;
      }
      const raw = (d.content?.[0]?.text || "").trim();
      const parsed = parseJSON(raw);
      let name = parsed?.name || "";
      let sq = parsed?.searchQuery || "";
      let simQ = parsed?.similarQuery || "";
      if (!name) { const m = raw.match(/"name"\s*:\s*"([^"]+)"/); name = m?m[1]:""; }
      if (!sq)   { const m = raw.match(/"searchQuery"\s*:\s*"([^"]+)"/); sq = m?m[1]:""; }
      if (!simQ) { const m = raw.match(/"similarQuery"\s*:\s*"([^"]+)"/); simQ = m?m[1]:""; }
      if (!name && raw.length<80 && !raw.includes("{")) name = raw;
      if (!name) name = "Unidentified item";
      if (!sq) sq = name;
      if (!simQ) simQ = sq.split(" ").slice(1).join(" ") || sq;
      setIdentifiedItem(name); setSearchQuery(sq); setSimilarQuery(simQ);
      setSizeRelevant(parsed?.needsSize === true);
      const cat = parsed?.cat || null;
      if (cat) { setItemCategory(cat); if (SIZE_CATS[cat]) setSizeCat(cat); }
      setStep("match_type");
      fetchPriceEst(name);
    } catch {
      setError("Could not identify item. Try again or use text search.");
      setStep("upload");
    }
  };

  const identifyText = async () => {
    if (!textQuery.trim()) return;
    const name = textQuery.trim();
    setStep("identifying"); setError("");
    try {
      const r = await fetch("/api/claude", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-sonnet-4-5", max_tokens:200,
          messages:[{ role:"user", content:'Fashion/luxury item: "' + name + '". Reply ONLY JSON: {"name":"exact item name","searchQuery":"best search term","similarQuery":"generic alternative","needsSize":true,"cat":"shoes"}. cat: tops/bottoms/dresses/shoes/kids/watches/jewelry/null. needsSize true for clothing/shoes. Make searchQuery specific with brand+model.' }]
        }),
      });
      const d = await r.json();
      if (d?.error?.type === "rate_limit_error") {
        setError("Too many requests. Wait 30 seconds and try again.");
        setStep("upload"); return;
      }
      const raw = (d.content?.[0]?.text || "").trim();
      const parsed = parseJSON(raw);
      const finalName = parsed?.name || name;
      const sq = parsed?.searchQuery || name;
      const simQ = parsed?.similarQuery || name;
      setIdentifiedItem(finalName); setSearchQuery(sq); setSimilarQuery(simQ);
      setSizeRelevant(parsed?.needsSize === true);
      const cat = parsed?.cat || null;
      if (cat) { setItemCategory(cat); if (SIZE_CATS[cat]) setSizeCat(cat); }
      setStep("match_type");
      fetchPriceEst(finalName);
    } catch {
      const words = name.split(" ");
      setIdentifiedItem(name); setSearchQuery(name);
      setSimilarQuery(words.length>1 ? words.slice(1).join(" ") : name);
      setSizeRelevant(false); setItemCategory(null); setSizeCat(null);
      setStep("match_type");
      fetchPriceEst(name);
    }
  };

  const fetchPriceEst = async name => {
    setPriceEstLoading(true); setPriceEst(null);
    try {
      const r = await fetch("/api/claude", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-haiku-4-5", max_tokens:150,
          messages:[{ role:"user", content:'Estimate second-hand resale price for: "' + name + '". Reply ONLY JSON: {"min":50,"max":120,"rarity":"common","tip":"short tip"}. rarity: common/uncommon/rare/very_rare.' }]
        }),
      });
      const d = await r.json();
      const p = parseJSON((d.content||[]).filter(b=>b.type==="text").map(b=>b.text).join(""));
      if (p && typeof p.min==="number") setPriceEst(p);
    } catch {}
    setPriceEstLoading(false);
  };

  const effSize = selectedSize || (customSize.trim() || null);
  const currency = getCurrency(userLocation?.countryCode);
  const activeQ = matchType==="similar" ? (similarQuery||searchQuery) : searchQuery;

  const handleSearch = async () => {
    setStep("searching"); setSearchPhase(1); setError("");
    setListings([]); setShopResults([]);
    const locText = !userLocation ? "worldwide" : radius==="country" ? userLocation.country : radius==="continent" ? userLocation.continent : "worldwide";
    const shopCity = userLocation?.city ? userLocation.city + ", " + userLocation.country : userLocation?.country || "your area";
    const condText = condition==="new" ? "brand new" : condition==="used" ? "second-hand/pre-owned" : "new or used";
    const qualText = condition==="new" ? "" : (QUALITY_OPTS.find(q=>q.val===quality)?.label || "");
    const sizeText = effSize ? "size "+effSize : "";
    const priceText = (priceMin||priceMax) ? "price "+currency+(priceMin||"0")+"-"+currency+(priceMax||"any") : "";
    const platforms = getSearchPlatforms(condition, userLocation?.countryCode, radius, userLocation?.continentCode, itemCategory);
    const shopType = condition==="new" ? "physical retail stores or boutiques" : "physical vintage, thrift, consignment or streetwear stores";
    const filters = [condText, qualText, sizeText, priceText].filter(Boolean).join(", ");
    const newItemInstruction = condition === "new" ? 'Priority: search official brand websites and established retail webshops first. These are new items sold by retailers — not resellers or auction sites.\n' : '';

    const listingPrompt =
      'Search the web for real listings of: "' + activeQ + '"\n' +
      'Search on these platforms: ' + platforms + '\n' +
      newItemInstruction +
      'Filters: ' + filters + '\n' +
      'LOCATION: Listings must be available in or ship to ' + locText + '. Only return results from sellers or platforms operating in ' + locText + '.\n\n' +
      'CRITICAL RULES:\n1. ONLY return real, active product listing pages\n2. NEVER return a listing with title like "Unable to find" or price "N/A"\n3. Each listing must have a real price\n\n' +
      'Reply ONLY with this JSON:\n{"listings":[{"title":"...","price":"'+currency+'XX","platform":"...","url":"https://...","condition":"...","location":"..."},{"title":"...","price":"...","platform":"...","url":"https://...","condition":"...","location":"..."},{"title":"...","price":"...","platform":"...","url":"https://...","condition":"...","location":"..."}]}';

    const shopsPrompt =
      'Name 3 real physical ' + shopType + ' in ' + shopCity + ' that would carry: "' + identifiedItem + '". Include city in address.\n' +
      'Reply ONLY JSON: {"shops":[{"name":"...","description":"1 sentence","address":"city, country","url":"https://...","tip":"why they might have it"},{"name":"...","description":"...","address":"...","url":"https://...","tip":"..."},{"name":"...","description":"...","address":"...","url":"https://...","tip":"..."}]}';

    let foundListings = [];
    let foundShops = [];

    try {
      const listingData = await fetch("/api/claude", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-sonnet-4-5", max_tokens:1000,
          tools:[{ type:"web_search_20250305", name:"web_search", max_uses:3 }],
          messages:[{ role:"user", content: listingPrompt }]
        }),
      }).then(r=>r.json());
      if (listingData?.error?.type === "rate_limit_error") {
        setError("Too many requests — please wait 30 seconds and try again.");
        setStep("location"); return;
      }
      const txt = (listingData.content||[]).filter(b=>b.type==="text").map(b=>b.text).join("");
      const p = parseJSON(txt);
      if (p?.listings?.length) foundListings = p.listings.slice(0,3);
    } catch {}

    setSearchPhase(3);
    setListings(sortByPrice(foundListings));
    if (foundListings.length > 0) saveSearch(identifiedItem);
    setStep("results");

    try {
      const shopData = await fetch("/api/claude", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-haiku-4-5", max_tokens:400,
          messages:[{ role:"user", content: shopsPrompt }]
        }),
      }).then(r=>r.json());
      const txt = (shopData.content||[]).filter(b=>b.type==="text").map(b=>b.text).join("");
      const p = parseJSON(txt);
      if (p?.shops?.length) foundShops = p.shops.slice(0,3);
    } catch {}
    setShopResults(foundShops);
  };

  const loadMoreListings = async () => {
    setLoadingMore(true);
    const locText = !userLocation ? "worldwide" : radius==="country" ? userLocation.country : radius==="continent" ? userLocation.continent : "worldwide";
    const condText = condition==="new" ? "brand new" : condition==="used" ? "second-hand/pre-owned" : "new or used";
    const qualText = condition==="new" ? "" : (QUALITY_OPTS.find(q=>q.val===quality)?.label || "");
    const sizeText = effSize ? "size "+effSize : "";
    const priceText = (priceMin||priceMax) ? "price "+currency+(priceMin||"0")+"-"+currency+(priceMax||"any") : "";
    const platforms = getSearchPlatforms(condition, userLocation?.countryCode, radius, userLocation?.continentCode, itemCategory);
    const filters = [condText, qualText, sizeText, priceText].filter(Boolean).join(", ");
    const newItemInstruction = condition === "new" ? 'Priority: search official brand websites and established retail webshops first.\n' : '';
    const alreadyShown = listings.map(l => l.url).filter(Boolean).join(", ");
    const prompt =
      'Search the web for real listings of: "' + activeQ + '"\nSearch on: ' + platforms + '\n' +
      newItemInstruction + 'Filters: ' + filters + '\nLOCATION: ' + locText + '\n' +
      'Do NOT repeat: ' + alreadyShown + '\n' +
      'RULES: Only real active listing pages, real prices, 3 different listings.\n' +
      'Reply ONLY JSON: {"listings":[{"title":"...","price":"'+currency+'XX","platform":"...","url":"https://...","condition":"...","location":"..."},{"title":"...","price":"...","platform":"...","url":"https://...","condition":"...","location":"..."},{"title":"...","price":"...","platform":"...","url":"https://...","condition":"...","location":"..."}]}';
    try {
      const r = await fetch("/api/claude", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-sonnet-4-5", max_tokens:1000,
          tools:[{ type:"web_search_20250305", name:"web_search", max_uses:3 }],
          messages:[{ role:"user", content: prompt }]
        }),
      });
      const data = await r.json();
      const txt = (data.content||[]).filter(b=>b.type==="text").map(b=>b.text).join("");
      const p = parseJSON(txt);
      if (p?.listings?.length) setListings(sortByPrice(p.listings.slice(0,3)));
    } catch {}
    setLoadingMore(false);
  };

  const reset = () => {
    setStep("upload"); setInputMode("photo"); setTextQuery(""); setImageData(null); setImageBase64(null);
    setIdentifiedItem(""); setSearchQuery(""); setSimilarQuery(""); setItemCategory(null); setSizeRelevant(false);
    setMatchType(null); setSizeCat(null); setSelectedSize(null); setCustomSize("");
    setCondition(null); setQuality(null); setPriceMin(""); setPriceMax(""); setRadius(null);
    setListings([]); setShopResults([]); setError("");
    setPriceEst(null); setPriceEstLoading(false); setSearchPhase(0);
  };

  const currentIdx = STEP_ORDER.indexOf(step);
  const bwLevel = () => {
    if (!priceEst?.min||!priceMax) return null;
    const max = parseFloat(priceMax);
    if (isNaN(max)||max<=0) return null;
    if (max<priceEst.min*0.5) return "danger";
    if (max<priceEst.min*0.8) return "warn";
    return null;
  };
  const budgetWarn = bwLevel();
  const rC = { common:"#5A7A5A", uncommon:"#8A7040", rare:"#8A3A30", very_rare:"#6A4A8A" };
  const rL = { common:"Widely available", uncommon:"Takes some searching", rare:"Hard to find", very_rare:"Very rare — be patient" };

  const Back = ({ to }) => (
    <button className="back-btn" onClick={()=>setStep(to)}>
      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
      Back
    </button>
  );

  const PriceWidget = () => {
    if (!priceEstLoading && !priceEst) return null;
    const cls = priceEstLoading ? "loading" : (priceEst?.rarity==="rare"||priceEst?.rarity==="very_rare") ? "warn" : "ready";
    return (
      <div className={"price-est "+cls}>
        {priceEstLoading
          ? <><div className="est-pulse"/><div><div style={{fontSize:10,fontWeight:400,color:"#9A9080",letterSpacing:".14em",textTransform:"uppercase",marginBottom:2}}>Checking market prices…</div><div style={{fontSize:12,color:"#9A9080",fontWeight:300}}>Estimating typical resale value</div></div></>
          : priceEst?.min>0
            ? <><div style={{fontSize:18,flexShrink:0}}>{priceEst.rarity==="very_rare"?"💎":priceEst.rarity==="rare"?"🔍":priceEst.rarity==="uncommon"?"🧭":"✓"}</div>
               <div style={{flex:1}}>
                 <div style={{display:"flex",alignItems:"baseline",gap:8,marginBottom:3}}>
                   <span style={{fontSize:10,fontWeight:400,color:"#9A9080",letterSpacing:".14em",textTransform:"uppercase"}}>Typical resale price</span>
                   <span style={{fontSize:15,fontWeight:500,color:"#1A1612"}}>{currency}{priceEst.min}–{currency}{priceEst.max}</span>
                 </div>
                 {priceEst.rarity&&<div style={{fontSize:11,color:rC[priceEst.rarity],fontWeight:400,marginBottom:3}}>{rL[priceEst.rarity]}</div>}
                 {priceEst.tip&&<div style={{fontSize:12,color:"#7A7268",fontWeight:300,lineHeight:1.4}}>{priceEst.tip}</div>}
               </div></>
            : null}
      </div>
    );
  };

  const locLbl = () => {
    if (!userLocation) return null;
    if (radius==="country") return getFlag(userLocation.countryCode)+" "+userLocation.country;
    if (radius==="continent") return "🌍 "+userLocation.continent;
    return "🌐 Worldwide";
  };

  return (
    <div style={{background:"#fff"}}>
      <style>{S}</style>
      <div className="app slide-in">
        <div className="app-header">
          <h1 className="app-title">Gemly</h1>
          <p className="app-sub">Scan & Find</p>
        </div>
        {currentIdx>=0&&<div className="progress-row">{STEP_ORDER.map((s,i)=><div key={s} className={"pdot "+(i<currentIdx?"done":i===currentIdx?"active":"")}/>)}</div>}
        {error&&<div className="err">{error}</div>}

        {step==="upload"&&(
          <div className="slide-in">
            {locLoading&&<div className="loc-badge"><div className="locdot"/><span style={{fontSize:12,color:"#5A7A5A",fontWeight:300}}>Detecting your location…</span></div>}
            {userLocation&&!locLoading&&(
              <div className="loc-badge">
                <span style={{fontSize:18}}>{getFlag(userLocation.countryCode)}</span>
                <div>
                  <div style={{fontSize:10,fontWeight:400,color:"#5A7A5A",letterSpacing:".12em",textTransform:"uppercase"}}>Shopping from</div>
                  <div style={{fontSize:13,color:"#1A1612",fontWeight:400}}>{userLocation.city?userLocation.city+", ":""}{userLocation.country}</div>
                </div>
              </div>
            )}
            <div className="mtabs">
              <button className={"mtab "+(inputMode==="photo"?"active":"")} onClick={()=>setInputMode("photo")}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                Scan a photo
              </button>
              <button className={"mtab "+(inputMode==="text"?"active":"")} onClick={()=>setInputMode("text")}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                Search by name
              </button>
            </div>
            {inputMode==="photo"?(
              <>
                <div className={"drop-zone "+(dragOver?"active":"")}
                  onClick={()=>fileRef.current.click()}
                  onDragOver={e=>{e.preventDefault();setDragOver(true);}}
                  onDragLeave={()=>setDragOver(false)}
                  onDrop={e=>{e.preventDefault();setDragOver(false);handleFile(e.dataTransfer.files[0]);}}>
                  <div className="drop-icon">
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#9A9080" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  </div>
                  <p style={{fontSize:14,fontWeight:400,margin:"0 0 4px",color:"#1A1612"}}>Drop your photo here</p>
                  <p style={{fontSize:12,color:"#9A9080",margin:0,fontWeight:300}}>or tap to browse your gallery</p>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:10}}>
                  <button className="btn-ghost" onClick={()=>fileRef.current.click()}>Upload photo</button>
                  <button className="btn-ghost" onClick={()=>camRef.current.click()}>📷 Take photo</button>
                </div>
                <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>handleFile(e.target.files[0])}/>
                <input ref={camRef} type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={e=>handleFile(e.target.files[0])}/>
              </>
            ):(
              <>
                <p style={{fontSize:13,color:"#9A9080",margin:"0 0 1rem",lineHeight:1.5,fontWeight:300}}>Type brand, model, colour — anything.</p>
                <div className="search-row">
                  <input className="search-input" type="text" placeholder='e.g. "Palace tri-ferg tee SS23" or "Rolex Datejust 41"'
                    value={textQuery} onChange={e=>setTextQuery(e.target.value)}
                    onKeyDown={e=>e.key==="Enter"&&identifyText()} autoFocus/>
                  <button className="search-btn" disabled={!textQuery.trim()} onClick={identifyText}>Search</button>
                </div>
              </>
            )}
          </div>
        )}

        {step==="identifying"&&(
          <div className="slide-in" style={{textAlign:"center",paddingTop:"2rem"}}>
            {imageData?(
              <div className="scan-wrap">
                <div className="scan-pulse"/><div className="scan-pulse" style={{animationDelay:"0.6s"}}/>
                <img src={imageData} alt="" style={{width:100,height:100,objectFit:"cover",borderRadius:4,border:"1px solid #EDEAE4",display:"block",position:"relative",zIndex:1}}/>
              </div>
            ):<div style={{width:64,height:64,background:"#F5F0E8",borderRadius:2,margin:"0 auto 1.5rem",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26}}>🔍</div>}
            <p style={{color:"#1A1612",fontSize:12,letterSpacing:".14em",textTransform:"uppercase",fontWeight:400,margin:"0 0 5px"}}>Identifying your item</p>
            <p style={{color:"#9A9080",fontSize:12,margin:0,fontWeight:300}}>{imageData ? "AI is reading the image…" : "AI is analysing your search…"}</p>
          </div>
        )}

        {step==="match_type"&&(
          <div className="slide-in">
            <div className="id-pill">
              {imageData?<img src={imageData} alt="" style={{width:48,height:48,objectFit:"cover",borderRadius:2,border:"1px solid #EDEAE4",flexShrink:0}}/>
                :<div style={{width:38,height:38,background:"#F5F0E8",borderRadius:2,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{itemCategory==="watches"?"⌚":itemCategory==="jewelry"?"💍":"🔍"}</div>}
              <div style={{flex:1,minWidth:0}}>
                <span className="lbl" style={{margin:0}}>Identified as</span>
                <div style={{color:"#1A1612",fontSize:14,fontWeight:400,lineHeight:1.3,marginTop:2}}>{identifiedItem||"Scanning…"}</div>
              </div>
              <button className="rescan" onClick={reset} style={{flexShrink:0}}>Start over</button>
            </div>
            <PriceWidget/>
            <span className="lbl">What are you looking for?</span>
            <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:"1.25rem"}}>
              {[{val:"exact",label:"Exact match",desc:"This specific item"},{val:"similar",label:"Similar style",desc:"Same category or aesthetic"}].map(({val,label,desc})=>(
                <button key={val} className={"choice-card "+(matchType===val?"selected":"")} onClick={()=>setMatchType(val)}>
                  <span style={{fontSize:13,color:"#1A1612",display:"block",fontWeight:400}}>{label}</span>
                  <span style={{fontSize:12,color:"#9A9080",display:"block",marginTop:2,fontWeight:300}}>{desc}</span>
                </button>
              ))}
            </div>
            <button className="btn-primary" disabled={!matchType} onClick={()=>setStep(sizeRelevant?"size":"condition")}>Continue</button>
          </div>
        )}

        {step==="size"&&(
          <div className="slide-in">
            <Back to="match_type"/>
            <span className="lbl">Your size</span>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:"1rem"}}>
              {Object.entries(SIZE_CATS).map(([key,cat])=>(
                <button key={key} className={"size-chip "+(sizeCat===key?"selected":"")} onClick={()=>{setSizeCat(sizeCat===key?null:key);setSelectedSize(null);}}>{cat.label}</button>
              ))}
            </div>
            {sizeCat&&SIZE_CATS[sizeCat]&&(
              <div style={{marginBottom:"1rem"}}>
                <span className="lbl" style={{marginBottom:8}}>Pick your size</span>
                <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                  {SIZE_CATS[sizeCat].sizes.map(s=>(
                    <button key={s} className={"size-chip "+(selectedSize===s?"selected":"")} style={{minWidth:46}} onClick={()=>setSelectedSize(selectedSize===s?null:s)}>{s}</button>
                  ))}
                </div>
              </div>
            )}
            <div style={{marginBottom:"1.25rem"}}>
              <label style={{fontSize:10,color:"#9A9080",display:"block",marginBottom:6,letterSpacing:".16em",textTransform:"uppercase",fontWeight:400}}>Or type a custom size</label>
              <input className="text-input" type="text" placeholder='e.g. "IT 42", "UK 12", "W32 L32"' value={customSize} onChange={e=>{setCustomSize(e.target.value);if(e.target.value)setSelectedSize(null);}}/>
            </div>
            <button className="btn-primary" onClick={()=>setStep("condition")}>{effSize?"Continue with size "+effSize:"Continue without size"}</button>
          </div>
        )}

        {step==="condition"&&(
          <div className="slide-in">
            <Back to={sizeRelevant?"size":"match_type"}/>
            <span className="lbl">First-hand or second-hand?</span>
            <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:"1.25rem"}}>
              {[{val:"new",label:"First-hand only",desc:"Brand new from retail"},{val:"used",label:"Second-hand only",desc:"Pre-owned, vintage, refurbished"},{val:"both",label:"Show me both",desc:"All options — best price wins"}].map(({val,label,desc})=>(
                <button key={val} className={"choice-card "+(condition===val?"selected":"")} onClick={()=>setCondition(val)}>
                  <span style={{fontSize:13,color:"#1A1612",display:"block",fontWeight:400}}>{label}</span>
                  <span style={{fontSize:12,color:"#9A9080",display:"block",marginTop:2,fontWeight:300}}>{desc}</span>
                </button>
              ))}
            </div>
            <button className="btn-primary" disabled={!condition} onClick={()=>setStep(condition==="new"?"price":"quality")}>Continue</button>
          </div>
        )}

        {step==="quality"&&(
          <div className="slide-in">
            <Back to="condition"/>
            <span className="lbl">Desired condition</span>
            <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:"1.25rem"}}>
              {QUALITY_OPTS.map(({val,label,desc,dot})=>(
                <button key={val} className={"choice-card "+(quality===val?"selected":"")} onClick={()=>setQuality(val)}>
                  <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
                    <div className="cdot" style={{background:dot,marginTop:4}}/>
                    <div>
                      <span style={{fontSize:13,color:"#1A1612",display:"block",fontWeight:400}}>{label}</span>
                      <span style={{fontSize:12,color:"#9A9080",display:"block",marginTop:2,fontWeight:300}}>{desc}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <button className="btn-primary" disabled={!quality} onClick={()=>setStep("price")}>Continue</button>
          </div>
        )}

        {step==="price"&&(
          <div className="slide-in">
            <Back to={condition==="new"?"condition":"quality"}/>
            <span className="lbl">Your budget</span>
            <PriceWidget/>
            <p style={{color:"#9A9080",fontSize:12,margin:"0 0 1.25rem",fontWeight:300}}>Leave blank to skip</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:"1rem"}}>
              <div>
                <label style={{fontSize:10,color:"#9A9080",display:"block",marginBottom:6,letterSpacing:".16em",textTransform:"uppercase",fontWeight:400}}>Min ({currency})</label>
                <input className="text-input" type="number" placeholder="0" min="0" value={priceMin} onChange={e=>setPriceMin(e.target.value)}/>
              </div>
              <div>
                <label style={{fontSize:10,color:"#9A9080",display:"block",marginBottom:6,letterSpacing:".16em",textTransform:"uppercase",fontWeight:400}}>Max ({currency})</label>
                <input className="text-input" type="number" placeholder="No limit" min="0" value={priceMax} onChange={e=>setPriceMax(e.target.value)}/>
              </div>
            </div>
            {budgetWarn&&priceEst&&(
              <div className={"bwarn "+budgetWarn}>
                <span style={{fontSize:16,flexShrink:0}}>{budgetWarn==="danger"?"⚠️":"💡"}</span>
                <div>
                  <div style={{fontSize:12,fontWeight:500,color:budgetWarn==="danger"?"#8A3A30":"#7A6030",marginBottom:3}}>{budgetWarn==="danger"?"Budget may be too low":"Heads up on pricing"}</div>
                  <div style={{fontSize:12,color:budgetWarn==="danger"?"#8A3A30":"#7A6030",lineHeight:1.5,fontWeight:300}}>Typically sells for <strong>{currency}{priceEst.min}–{currency}{priceEst.max}</strong>.{budgetWarn==="danger"?" Very hard to find at this price.":" You may need some patience."}</div>
                </div>
              </div>
            )}
            <button className="btn-primary" onClick={()=>setStep("location")}>Continue</button>
          </div>
        )}

        {step==="location"&&(
          <div className="slide-in">
            <Back to="price"/>
            <span className="lbl">How far will you shop?</span>
            {userLocation&&<p style={{color:"#9A9080",fontSize:12,margin:"0 0 1rem",fontWeight:300}}>You're in <strong style={{color:"#1A1612",fontWeight:400}}>{userLocation.country}</strong>.</p>}
            <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:"1.25rem"}}>
              {[
                {val:"country",label:userLocation?userLocation.country+" only":"My country only",icon:userLocation?getFlag(userLocation.countryCode):"📍",desc:"Local shops & platforms"},
                {val:"continent",label:userLocation?userLocation.continent:"My continent",icon:"🌍",desc:"Shops & platforms across your continent"},
                {val:"worldwide",label:"Worldwide",icon:"🌐",desc:"No limits, international shipping"},
              ].map(({val,label,icon,desc})=>(
                <button key={val} className={"choice-card "+(radius===val?"selected":"")} onClick={()=>setRadius(val)}>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <span style={{fontSize:22,lineHeight:1,flexShrink:0}}>{icon}</span>
                    <div>
                      <span style={{fontSize:13,color:"#1A1612",display:"block",fontWeight:400}}>{label}</span>
                      <span style={{fontSize:12,color:"#9A9080",display:"block",marginTop:2,fontWeight:300}}>{desc}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <button className="btn-primary" disabled={!radius} onClick={handleSearch}>Find deals &amp; shops</button>
          </div>
        )}

        {step==="searching"&&(
          <div className="slide-in spinner-wrap">
            <div className="spinner"/>
            <p style={{color:"#1A1612",fontSize:12,letterSpacing:".14em",textTransform:"uppercase",fontWeight:400,margin:"0 0 5px"}}>Searching for you</p>
            <p style={{color:"#9A9080",fontSize:12,margin:"0 0 1.5rem",fontWeight:300}}>Finding real listings &amp; local shops…</p>
            <div className="ssteps">
              {[{label:"Scanning platforms for real listings",phase:1},{label:"Finding local hidden gem shops",phase:2},{label:"Putting it all together",phase:3}].map(({label,phase})=>(
                <div key={phase} className="sstep">
                  <div className={"sdot "+(searchPhase>phase?"done":searchPhase===phase?"active":"pending")}/>
                  <span style={{fontSize:13,color:searchPhase>=phase?"#1A1612":"#C8C0B4",fontWeight:searchPhase===phase?400:300}}>{label}</span>
                  {searchPhase>phase&&<span style={{fontSize:11,color:"#5A7A5A",marginLeft:"auto"}}>✓</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {step==="results"&&(
          <div className="slide-in">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:"0.5rem"}}>
              <div>
                <span className="lbl" style={{marginBottom:2}}>Results for</span>
                <div style={{color:"#1A1612",fontSize:16,fontWeight:400}}>{identifiedItem}</div>
              </div>
              {imageData&&<img src={imageData} alt="" className="img-thumb"/>}
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:"0.85rem"}}>
              {effSize&&<span className="tag">Size {effSize}</span>}
              {condition==="new"&&<span className="tag">First-hand</span>}
              {condition==="used"&&<span className="tag">Second-hand</span>}
              {condition==="both"&&<span className="tag">New &amp; used</span>}
              {quality&&condition!=="new"&&<span className="tag">{QUALITY_OPTS.find(q=>q.val===quality)?.label}</span>}
              {(priceMin||priceMax)&&<span className="tag">{currency}{priceMin||"0"}–{priceMax?currency+priceMax:"any"}</span>}
              {radius&&userLocation&&<span className="tag">{locLbl()}</span>}
            </div>
            <div style={{height:1,background:"#EDEAE4",marginBottom:"1rem"}}/>
            <div className="sec-title"><span>Found online</span></div>
            {listings.length===0&&<div className="no-results">No listings found. Try broadening your location or adjusting filters.</div>}
            {listings.map((item,i)=>(
              <div key={i} className="listing-card">
                <div style={{display:"flex",alignItems:"flex-start",gap:4}}>
                  <span className="listing-num">{i+1}</span>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
                      <div className="listing-title">{item.title}</div>
                      <div className="listing-price">{item.price}</div>
                    </div>
                    <div style={{marginTop:3}}>
                      <span className="tag">{item.platform}</span>
                      {item.condition&&<span className="tag">{item.condition}</span>}
                      {item.location&&<span className="tag">{item.location}</span>}
                    </div>
                    <a href={item.url} className="listing-btn" target="_blank" rel="noopener noreferrer">View listing →</a>
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={loadMoreListings}
              disabled={loadingMore}
              style={{width:"100%",background:"none",border:"1px solid #EDEAE4",borderRadius:2,padding:".75rem",fontSize:11,fontFamily:"'Outfit',sans-serif",fontWeight:400,color:loadingMore?"#C8C0B4":"#9A9080",cursor:loadingMore?"not-allowed":"pointer",letterSpacing:".14em",textTransform:"uppercase",transition:"all .2s",marginBottom:".85rem",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}
              onMouseEnter={e=>{if(!loadingMore){e.currentTarget.style.borderColor="#1A1612";e.currentTarget.style.color="#1A1612";}}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="#EDEAE4";e.currentTarget.style.color=loadingMore?"#C8C0B4":"#9A9080";}}>
              {loadingMore
                ? <><div style={{width:11,height:11,border:"1px solid #EDEAE4",borderTopColor:"#1A1612",borderRadius:"50%",animation:"spin 1s linear infinite"}}/> Searching…</>
                : <>↻ Show 3 new results</>}
            </button>
            <div className="divgem"><span className="gem">{condition==="new"?"🏪":"💎"}</span></div>
            <div className="sec-title"><span>{condition==="new"?"Physical stores":"Hidden gem shops"}</span></div>
            {condition!=="new"&&shopResults.length>0&&(
              <div className="tip-box">
                <span style={{fontSize:16,flexShrink:0}}>🗺️</span>
                <p style={{fontSize:12,color:"#5A7A5A",margin:0,lineHeight:1.5,fontWeight:300}}>Real stores that may carry this. Call ahead — the best finds are never online.</p>
              </div>
            )}
            {shopResults.length===0&&<div className="no-results">No local shops found. Try broadening your search radius.</div>}
            {shopResults.map((s,i)=>(
              <div key={i} className="shop-card">
                <div style={{display:"flex",alignItems:"flex-start"}}>
                  <span className="shop-num">{i+1}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,color:"#1A1612",fontWeight:500,marginBottom:3}}>{s.name}</div>
                    {s.description&&<p style={{fontSize:12,color:"#5A7A5A",margin:"0 0 3px",lineHeight:1.5,fontWeight:300}}>{s.description}</p>}
                    {s.tip&&<p style={{fontSize:12,color:"#9A9080",margin:"0 0 4px",fontStyle:"italic",fontWeight:300}}>"{s.tip}"</p>}
                    <div>
                      <span className={"tag "+(condition!=="new"?"g":"")}>{condition==="new"?"Retail":"Physical store"}</span>
                      {s.address&&<span className="tag">{s.address}</span>}
                    </div>
                    {s.url&&<a href={s.url} className="shop-btn" target="_blank" rel="noopener noreferrer">Visit website →</a>}
                  </div>
                </div>
              </div>
            ))}
            <div style={{display:"flex",flexDirection:"column",gap:6,marginTop:"1rem"}}>
              <button className="btn-ghost" onClick={()=>{setListings([]);setShopResults([]);setStep("condition");}}>Adjust filters &amp; search again</button>
              <button className="rescan" style={{display:"block",textAlign:"center"}} onClick={reset}>Start a new scan</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
