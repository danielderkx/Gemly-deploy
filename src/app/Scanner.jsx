'use client';
import { useState, useRef, useEffect } from "react";

const getContinent = c => ({ EU:"Europe", NA:"North America", SA:"South America", AS:"Asia", AF:"Africa", OC:"Oceania" }[c] || "your continent");
const getFlag = c => !c ? "🌍" : c.toUpperCase().replace(/./g, x => String.fromCodePoint(x.charCodeAt(0)+127397));
const getCurrency = cc => ({ GB:"£", US:"$", CA:"CA$", AU:"AU$", CH:"CHF", JP:"¥" }[cc] || "€");

// If a listing URL looks fake/broken, generate a real search URL for that platform
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
  if (category === "watches") return "Chrono24 (chrono24.com), Watchfinder (watchfinder.com), Bob's Watches (bobswatches.com), eBay watches, Catawiki watches";
  if (category === "jewelry") return "1stDibs (1stdibs.com), Etsy vintage jewelry, eBay jewelry, Vestiaire Collective, Catawiki jewelry";
  if (category === "shoes") {
    if (condition === "new") return "StockX (stockx.com), GOAT (goat.com), Farfetch, Zalando, END Clothing (endclothing.com)";
    return "StockX (stockx.com), GOAT (goat.com), Vestiaire Collective (vestiairecollective.com), eBay sneakers, Depop, Grailed (grailed.com)";
  }
  if (category === "tops" || category === "bottoms" || category === "dresses") {
    if (condition === "new") return "Farfetch, SSENSE, END Clothing, Zalando, ASOS";
    return "Grailed (grailed.com), Depop, Vinted, Vestiaire Collective, eBay fashion";
  }
  const isNew = condition === "new";
  if (isNew) {
    if (radius === "country") {
      if (cc==="NL") return "Bijenkorf (debijenkorf.nl), Zalando, ASOS, Wehkamp, About You";
      if (cc==="GB") return "ASOS, John Lewis, Selfridges, END Clothing, Matches Fashion";
      if (cc==="US") return "Nordstrom, Saks Fifth Avenue, SSENSE, END Clothing, ASOS";
      return "Zalando, ASOS, Farfetch, About You, H&M";
    }
    if (radius === "continent") {
      if (cont==="EU"||cc==="NL"||cc==="GB"||cc==="DE"||cc==="FR") return "Farfetch, SSENSE, Net-a-Porter, Mytheresa, END Clothing, Zalando";
      return "Farfetch, Net-a-Porter, SSENSE, Nordstrom, END Clothing";
    }
    return "Farfetch, SSENSE, Net-a-Porter, Mytheresa, END Clothing, Browns Fashion, LN-CC";
  }
  if (radius === "country") {
    if (cc==="NL") return "Marktplaats (marktplaats.nl), Vinted NL (vinted.nl), Vestiaire Collective (vestiairecollective.com), 2dehands, Grailed, Depop";
    if (cc==="GB") return "eBay UK (ebay.co.uk), Vinted UK (vinted.co.uk), Depop, Vestiaire Collective, Grailed";
    if (cc==="DE") return "eBay Kleinanzeigen (kleinanzeigen.de), Vinted DE, Grailed, Vestiaire Collective";
    if (cc==="FR") return "Vinted FR, Le Bon Coin (leboncoin.fr), Vestiaire Collective, Grailed";
    if (cc==="US") return "Grailed (grailed.com), Poshmark, Depop, The RealReal, StockX";
    return "eBay, Vinted, Grailed, Depop, Vestiaire Collective";
  }
  if (radius === "continent") {
    if (cont==="EU"||cc==="NL"||cc==="GB"||cc==="DE"||cc==="FR") return "Grailed, Vinted, Depop, Vestiaire Collective, eBay, Wallapop, Catawiki";
    return "Grailed, Poshmark, Depop, The RealReal, StockX, eBay";
  }
  return "Grailed (grailed.com), StockX (stockx.com), Vestiaire Collective, Depop, The RealReal, eBay, Catawiki";
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
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400;1,500&family=Nunito:wght@300;400;500;600&display=swap');
  * { box-sizing:border-box; }
  .app { font-family:'Nunito',sans-serif; background:#FDFAF6; border-radius:20px; padding:2.5rem 2rem; border:1px solid #EDE8DF; }
  .app-header { text-align:center; margin-bottom:2rem; padding-bottom:1.5rem; border-bottom:1px solid #EDE8DF; position:relative; }
  .app-header::after { content:''; position:absolute; bottom:-1px; left:50%; transform:translateX(-50%); width:48px; height:2px; background:#C4924A; border-radius:2px; }
  .app-title { font-family:'Playfair Display',serif; font-size:30px; font-weight:400; font-style:italic; color:#2C2417; margin:0 0 5px; }
  .app-sub { font-size:11px; color:#A89880; letter-spacing:.18em; text-transform:uppercase; margin:0; font-weight:500; }
  .progress-row { display:flex; gap:5px; margin-bottom:1.75rem; }
  .pdot { flex:1; height:3px; border-radius:3px; background:#EDE8DF; transition:background .4s; }
  .pdot.done { background:#C4924A; opacity:.5; } .pdot.active { background:#C4924A; }
  .drop-zone { border:1.5px dashed #D9D0C3; border-radius:16px; padding:2.5rem 1.5rem; text-align:center; cursor:pointer; transition:all .2s; background:#FBF8F3; }
  .drop-zone:hover,.drop-zone.active { border-color:#C4924A; background:#FDF6EC; }
  .drop-icon { width:52px; height:52px; border-radius:50%; background:#F2EBE0; margin:0 auto .85rem; display:flex; align-items:center; justify-content:center; }
  .drop-zone:hover .drop-icon { background:#EDD9BF; }
  .search-row { display:flex; gap:8px; }
  .search-input { border:1.5px solid #EDE8DF; border-radius:10px; padding:.75rem 1rem; font-size:14px; font-family:'Nunito',sans-serif; flex:1; background:#FFF; color:#2C2417; outline:none; transition:border-color .2s; }
  .search-input:focus { border-color:#C4924A; box-shadow:0 0 0 3px rgba(196,146,74,.08); }
  .search-input::placeholder { color:#C2B9AE; }
  .search-btn { background:#2C2417; color:#FDFAF6; border:none; border-radius:10px; padding:.75rem 1.1rem; font-size:13px; font-family:'Nunito',sans-serif; font-weight:600; cursor:pointer; white-space:nowrap; }
  .search-btn:disabled { background:#C9C2B8; cursor:not-allowed; }
  .btn-primary { background:#2C2417; color:#FDFAF6; border:none; border-radius:10px; padding:.85rem 1.5rem; font-size:12px; font-family:'Nunito',sans-serif; font-weight:600; letter-spacing:.14em; text-transform:uppercase; cursor:pointer; transition:all .2s; width:100%; }
  .btn-primary:hover { background:#3D3322; transform:translateY(-1px); box-shadow:0 4px 16px rgba(44,36,23,.15); }
  .btn-primary:disabled { background:#C9C2B8; cursor:not-allowed; transform:none; }
  .btn-ghost { background:transparent; color:#2C2417; border:1.5px solid #D9D0C3; border-radius:10px; padding:.8rem 1.5rem; font-size:12px; font-family:'Nunito',sans-serif; font-weight:500; letter-spacing:.1em; text-transform:uppercase; cursor:pointer; transition:all .2s; width:100%; }
  .btn-ghost:hover { border-color:#C4924A; color:#C4924A; background:#FDF6EC; }
  .choice-card { background:#FFF; border:1.5px solid #EDE8DF; border-radius:13px; padding:1rem 1.15rem; cursor:pointer; text-align:left; transition:all .2s; width:100%; font-family:'Nunito',sans-serif; position:relative; overflow:hidden; }
  .choice-card:hover { border-color:#C4924A; background:#FDFAF6; }
  .choice-card.selected { border-color:#C4924A; background:linear-gradient(135deg,#FDF6EC,#FBF1E3); box-shadow:0 2px 12px rgba(196,146,74,.12); }
  .choice-card.selected::after { content:'✓'; position:absolute; right:14px; top:50%; transform:translateY(-50%); color:#C4924A; font-size:15px; font-weight:700; }
  .size-chip { background:#FFF; border:1.5px solid #EDE8DF; border-radius:9px; padding:.55rem .9rem; cursor:pointer; font-family:'Nunito',sans-serif; font-size:13px; font-weight:500; color:#2C2417; transition:all .2s; text-align:center; }
  .size-chip:hover { border-color:#C4924A; background:#FDF6EC; }
  .size-chip.selected { border-color:#C4924A; background:linear-gradient(135deg,#FDF6EC,#FBF1E3); color:#8B5E20; }
  .text-input { border:1.5px solid #EDE8DF; border-radius:10px; padding:.75rem 1rem; font-size:14px; font-family:'Nunito',sans-serif; width:100%; background:#FFF; color:#2C2417; outline:none; transition:border-color .2s; }
  .text-input:focus { border-color:#C4924A; box-shadow:0 0 0 3px rgba(196,146,74,.08); }
  .text-input::placeholder { color:#C2B9AE; }
  .back-btn { background:none; border:none; color:#A89880; font-size:12px; font-family:'Nunito',sans-serif; cursor:pointer; padding:0; margin-bottom:1.5rem; letter-spacing:.1em; text-transform:uppercase; display:flex; align-items:center; gap:6px; transition:color .2s; font-weight:500; }
  .back-btn:hover { color:#2C2417; }
  .id-pill { background:linear-gradient(135deg,#FDF6EC,#FBF1E3); border:1px solid #E8D9C0; border-radius:12px; padding:.9rem 1.1rem; margin-bottom:1.5rem; display:flex; align-items:center; gap:10px; }
  .lbl { font-size:10px; color:#C4924A; letter-spacing:.2em; text-transform:uppercase; font-weight:700; margin-bottom:5px; display:block; }
  .price-est { border-radius:12px; padding:.85rem 1rem; margin-bottom:1.25rem; display:flex; gap:10px; align-items:flex-start; }
  .price-est.loading { background:#F8F6F2; border:1px solid #EDE8DF; }
  .price-est.ready { background:linear-gradient(135deg,#F0F7F1,#E8F2EA); border:1px solid #B8D9BC; }
  .price-est.warn { background:linear-gradient(135deg,#FFF8EE,#FFF1DC); border:1px solid #EDD49A; }
  .est-pulse { width:8px; height:8px; border-radius:50%; background:#C4924A; animation:blink 1.2s ease-in-out infinite; flex-shrink:0; margin-top:4px; }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.2} }
  .bwarn { border-radius:12px; padding:.85rem 1rem; margin-bottom:1rem; display:flex; gap:10px; }
  .bwarn.warn { background:linear-gradient(135deg,#FFF8EE,#FFF1DC); border:1px solid #EDD49A; }
  .bwarn.danger { background:linear-gradient(135deg,#FFF3F0,#FFE8E3); border:1px solid #F5BFB5; }
  .sec-title { display:flex; align-items:center; gap:8px; margin:1.25rem 0 .85rem; }
  .sec-title span { font-size:10px; color:#2C2417; letter-spacing:.18em; text-transform:uppercase; font-weight:700; white-space:nowrap; }
  .sec-title::after { content:''; flex:1; height:1px; background:#EDE8DF; }
  .listing-card { background:#FFF; border:1px solid #EDE8DF; border-radius:16px; padding:1.25rem 1.4rem; margin-bottom:.85rem; transition:all .2s; position:relative; overflow:hidden; }
  .listing-card::before { content:''; position:absolute; left:0; top:0; bottom:0; width:3px; background:#C4924A; transform:scaleY(0); transform-origin:bottom; transition:transform .25s; }
  .listing-card:hover { border-color:#D9C9AE; box-shadow:0 4px 18px rgba(196,146,74,.1); transform:translateY(-1px); }
  .listing-card:hover::before { transform:scaleY(1); }
  .listing-num { font-family:'Playfair Display',serif; font-size:26px; font-weight:400; font-style:italic; color:#C4924A; opacity:.5; line-height:1; margin-right:12px; flex-shrink:0; }
  .listing-title { font-size:14px; color:#2C2417; font-weight:500; line-height:1.4; margin-bottom:5px; }
  .listing-price { font-size:18px; color:#C4924A; font-weight:600; font-family:'Playfair Display',serif; font-style:italic; white-space:nowrap; flex-shrink:0; }
  .listing-btn { display:inline-flex; align-items:center; gap:5px; font-size:11px; font-weight:700; color:#FFF; letter-spacing:.06em; text-transform:uppercase; text-decoration:none; background:#2C2417; border-radius:8px; padding:7px 13px; margin-top:8px; transition:all .2s; }
  .listing-btn:hover { background:#C4924A; }
  .tag { display:inline-block; background:#F4EFE8; color:#8C7A63; font-size:10px; font-weight:600; padding:3px 9px; border-radius:5px; margin-right:5px; margin-top:3px; letter-spacing:.07em; text-transform:uppercase; }
  .tag.g { background:#EEF4EF; color:#5A8060; }
  .shop-card { background:#FFF; border:1px solid #EDE8DF; border-radius:14px; padding:1.1rem 1.25rem; margin-bottom:.7rem; position:relative; overflow:hidden; transition:all .2s; }
  .shop-card::before { content:''; position:absolute; left:0; top:0; bottom:0; width:3px; background:#7A9E7E; transform:scaleY(0); transform-origin:bottom; transition:transform .25s; }
  .shop-card:hover { border-color:#B8CDB9; box-shadow:0 4px 20px rgba(122,158,126,.08); }
  .shop-card:hover::before { transform:scaleY(1); }
  .shop-num { font-family:'Playfair Display',serif; font-size:26px; font-weight:400; font-style:italic; color:#7A9E7E; opacity:.6; line-height:1; margin-right:12px; flex-shrink:0; }
  .shop-btn { display:inline-flex; align-items:center; gap:4px; font-size:11px; font-weight:700; color:#7A9E7E; text-transform:uppercase; letter-spacing:.07em; text-decoration:none; background:#EEF4EF; border:1px solid #C8DBC9; border-radius:7px; padding:5px 10px; margin-top:6px; }
  .shop-btn:hover { background:#E0EDDF; }
  .spinner-wrap { text-align:center; padding:3rem 0 2rem; }
  .spinner { width:44px; height:44px; border:2px solid #EDE8DF; border-top-color:#C4924A; border-radius:50%; animation:spin 1s linear infinite; margin:0 auto 1.5rem; }
  @keyframes spin { to { transform:rotate(360deg); } }
  .slide-in { animation:slideUp .3s cubic-bezier(.22,1,.36,1); }
  @keyframes slideUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  .err { background:#FEF2F2; border:1px solid #FECDCD; border-radius:10px; padding:.75rem 1rem; font-size:12px; color:#B94A4A; margin-bottom:1rem; line-height:1.5; }
  .rescan { background:none; border:none; padding:0; color:#A89880; font-size:11px; font-family:'Nunito',sans-serif; cursor:pointer; text-decoration:underline; text-decoration-color:#D9D0C3; transition:color .2s; }
  .rescan:hover { color:#C4924A; }
  .img-thumb { width:46px; height:46px; object-fit:cover; border-radius:10px; border:1.5px solid #EDE8DF; flex-shrink:0; }
  .scan-wrap { position:relative; display:inline-block; margin-bottom:1.75rem; }
  .scan-pulse { position:absolute; inset:-10px; border:1.5px solid #C4924A; border-radius:18px; opacity:0; animation:pr 1.8s ease-out infinite; }
  @keyframes pr { 0%{transform:scale(.92);opacity:.6} 100%{transform:scale(1.08);opacity:0} }
  .divgem { text-align:center; margin:1.25rem 0 .85rem; position:relative; }
  .divgem::before { content:''; position:absolute; top:50%; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,#EDE8DF,transparent); }
  .gem { display:inline-block; background:#FDFAF6; padding:0 10px; position:relative; font-size:16px; }
  .tip-box { background:linear-gradient(135deg,#F5F9F5,#EEF4EF); border:1px solid #C8DBC9; border-radius:12px; padding:.85rem 1rem; margin-bottom:1rem; display:flex; gap:10px; align-items:flex-start; }
  .cdot { width:10px; height:10px; border-radius:50%; flex-shrink:0; margin-top:3px; }
  .ssteps { display:flex; flex-direction:column; gap:10px; margin-top:1.5rem; }
  .sstep { display:flex; align-items:center; gap:10px; }
  .sdot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
  .sdot.active { background:#C4924A; animation:blink 1.2s ease-in-out infinite; }
  .sdot.done { background:#C4924A; opacity:.5; } .sdot.pending { background:#EDE8DF; }
  .loc-badge { display:flex; align-items:center; gap:8px; background:#F0F7F1; border:1px solid #B8D9BC; border-radius:10px; padding:.65rem 1rem; margin-bottom:1.25rem; }
  .locdot { width:7px; height:7px; border-radius:50%; background:#7A9E7E; animation:blink 1.4s ease-in-out infinite; flex-shrink:0; }
  .mtabs { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:1.25rem; }
  .mtab { background:#FFF; border:1.5px solid #EDE8DF; border-radius:11px; padding:.75rem 1rem; cursor:pointer; font-family:'Nunito',sans-serif; font-size:13px; font-weight:500; color:#A89880; transition:all .2s; text-align:center; display:flex; align-items:center; justify-content:center; gap:7px; }
  .mtab:hover { border-color:#C4924A; color:#2C2417; }
  .mtab.active { border-color:#C4924A; background:linear-gradient(135deg,#FDF6EC,#FBF1E3); color:#2C2417; font-weight:600; }
  .no-results { background:#F8F6F2; border:1px solid #EDE8DF; border-radius:10px; padding:.85rem 1rem; font-size:12px; color:#A89880; margin-bottom:.7rem; line-height:1.5; }
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
        setError("⏳ Even wachten — te veel zoekopdrachten tegelijk. Probeer over 30 seconden opnieuw.");
        setStep("upload");
        return;
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

  const identifyText = () => {
    if (!textQuery.trim()) return;
    const name = textQuery.trim();
    const words = name.split(" ");
    setIdentifiedItem(name); setSearchQuery(name);
    setSimilarQuery(words.length>1 ? words.slice(1).join(" ") : name);
    setSizeRelevant(false); setItemCategory(null); setSizeCat(null);
    setStep("match_type");
    fetchPriceEst(name);
  };

  const fetchPriceEst = async name => {
    setPriceEstLoading(true); setPriceEst(null);
    try {
      const r = await fetch("/api/claude", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-sonnet-4-5", max_tokens:200,
          messages:[{ role:"user", content:'You are a resale market expert. Current second-hand resale price for: "'+name+'"?\nReply ONLY with JSON:\n{"min":50,"max":150,"rarity":"common","tip":"one actionable buying tip"}\nrarity: common/uncommon/rare/very_rare' }]
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
    const condText = condition==="new" ? "brand new" : condition==="used" ? "second-hand/pre-owned" : "new or used";
    const qualText = condition==="new" ? "" : (QUALITY_OPTS.find(q=>q.val===quality)?.label || "");
    const sizeText = effSize ? "size "+effSize : "";
    const priceText = (priceMin||priceMax) ? "price "+currency+(priceMin||"0")+"-"+currency+(priceMax||"any") : "";
    const platforms = getSearchPlatforms(condition, userLocation?.countryCode, radius, userLocation?.continentCode, itemCategory);
    const shopType = condition==="new" ? "physical retail stores or boutiques" : "physical vintage, thrift, consignment or streetwear stores";
    const filters = [condText, qualText, sizeText, priceText].filter(Boolean).join(", ");

    const hasBudget = !!(priceMin || priceMax);
    const listingPrompt =
      'Search the web for listings of: "' + activeQ + '" on ' + platforms + '\n' +
      'Preferred filters: ' + filters + ', location: ' + locText + '\n\n' +
      'RULES:\n' +
      '1. Search and find REAL listings — copy exact URLs from your search results\n' +
      '2. If nothing found with all filters, relax filters one by one (first location, then size, then price)\n' +
      '3. Always return 3 listings — even if not perfect match, show closest available\n' +
      '4. Only use URLs that actually appeared in search results\n\n' +
      'Reply ONLY JSON: {"listings":[{"title":"...","price":"'+currency+'XX","platform":"...","url":"https://...","condition":"...","location":"..."},{"title":"...","price":"...","platform":"...","url":"https://...","condition":"...","location":"..."},{"title":"...","price":"...","platform":"...","url":"https://...","condition":"...","location":"..."}]}';

    const shopsPrompt =
      'Search the web for physical stores selling: "' + identifiedItem + '" in ' + locText + '\n' +
      'Look for vintage shops, consignment stores, sneaker boutiques, designer resellers in ' + locText + '\n' +
      'If nothing in ' + locText + ', find nearest stores in surrounding area\n' +
      'Reply ONLY JSON: {"shops":[{"name":"...","description":"...","address":"city, country","url":"https://...","tip":"..."},{"name":"...","description":"...","address":"...","url":"https://...","tip":"..."},{"name":"...","description":"...","address":"...","url":"https://...","tip":"..."}]}';

    const [listingRes, shopRes] = await Promise.allSettled([
      fetch("/api/claude", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-sonnet-4-5", max_tokens:1000,
          tools:[{ type:"web_search_20250305", name:"web_search" }],
          messages:[{ role:"user", content: listingPrompt }]
        }),
      }).then(r=>r.json()),
      fetch("/api/claude", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-sonnet-4-5", max_tokens:600,
          tools:[{ type:"web_search_20250305", name:"web_search" }],
          messages:[{ role:"user", content: shopsPrompt }]
        }),
      }).then(r=>r.json()),
    ]);

    setSearchPhase(3);

    let foundListings = [];
    let foundShops = [];

    if (listingRes.status==="fulfilled") {
      const data = listingRes.value;
      if (data?.error?.type === "rate_limit_error" || data?.type === "error" && data?.error?.type === "rate_limit_error") {
        setError("⏳ Te veel zoekopdrachten tegelijk. Wacht even 30 seconden en probeer opnieuw.");
        setStep("location");
        return;
      }
      const txt = (data.content||[]).filter(b=>b.type==="text").map(b=>b.text).join("");
      const p = parseJSON(txt);
      if (p?.listings?.length) foundListings = p.listings.slice(0,3);
    }

    if (shopRes.status==="fulfilled") {
      const data = shopRes.value;
      const txt = (data.content||[]).filter(b=>b.type==="text").map(b=>b.text).join("");
      const p = parseJSON(txt);
      if (p?.shops?.length) foundShops = p.shops.slice(0,3);
    }

    setListings(foundListings);
    setShopResults(foundShops);
    setStep("results");
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
  const rC = { common:"#5A8060", uncommon:"#A06B2A", rare:"#8B3A3A", very_rare:"#6B2F8B" };
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
          ? <><div className="est-pulse"/><div><div style={{fontSize:11,fontWeight:700,color:"#A89880",letterSpacing:".12em",textTransform:"uppercase",marginBottom:2}}>Checking market prices…</div><div style={{fontSize:12,color:"#A89880"}}>Estimating typical resale value</div></div></>
          : priceEst?.min>0
            ? <><div style={{fontSize:20,flexShrink:0}}>{priceEst.rarity==="very_rare"?"💎":priceEst.rarity==="rare"?"🔍":priceEst.rarity==="uncommon"?"🧭":"✅"}</div>
               <div style={{flex:1}}>
                 <div style={{display:"flex",alignItems:"baseline",gap:8,marginBottom:3}}>
                   <span style={{fontSize:11,fontWeight:700,color:"#A89880",letterSpacing:".12em",textTransform:"uppercase"}}>Typical resale price</span>
                   <span style={{fontSize:15,fontWeight:700,color:"#2C2417",fontFamily:"'Playfair Display',serif",fontStyle:"italic"}}>{currency}{priceEst.min}–{currency}{priceEst.max}</span>
                 </div>
                 {priceEst.rarity&&<div style={{fontSize:11,color:rC[priceEst.rarity],fontWeight:600,marginBottom:3}}>{rL[priceEst.rarity]}</div>}
                 {priceEst.tip&&<div style={{fontSize:12,color:"#7A7268",fontStyle:"italic",lineHeight:1.4}}>{priceEst.tip}</div>}
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
    <div style={{background:"#FDFAF6",borderRadius:20}}>
      <style>{S}</style>
      <div className="app slide-in">
        <div className="app-header">
          <h1 className="app-title">Scan &amp; Find</h1>
          <p className="app-sub">Online deals · Hidden gem shops</p>
        </div>
        {currentIdx>=0&&<div className="progress-row">{STEP_ORDER.map((s,i)=><div key={s} className={"pdot "+(i<currentIdx?"done":i===currentIdx?"active":"")}/>)}</div>}
        {error&&<div className="err">{error}</div>}

        {step==="upload"&&(
          <div className="slide-in">
            {locLoading&&<div className="loc-badge"><div className="locdot"/><span style={{fontSize:12,color:"#4A6E4F"}}>Detecting your location…</span></div>}
            {userLocation&&!locLoading&&(
              <div className="loc-badge">
                <span style={{fontSize:18}}>{getFlag(userLocation.countryCode)}</span>
                <div>
                  <div style={{fontSize:10,fontWeight:700,color:"#C4924A",letterSpacing:".1em",textTransform:"uppercase"}}>Shopping from</div>
                  <div style={{fontSize:13,color:"#2C2417",fontWeight:500}}>{userLocation.city?userLocation.city+", ":""}{userLocation.country}</div>
                </div>
              </div>
            )}
            <div className="mtabs">
              <button className={"mtab "+(inputMode==="photo"?"active":"")} onClick={()=>setInputMode("photo")}>
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                Scan a photo
              </button>
              <button className={"mtab "+(inputMode==="text"?"active":"")} onClick={()=>setInputMode("text")}>
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
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
                    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#C4924A" strokeWidth={1.4}><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  </div>
                  <p style={{fontSize:15,fontWeight:500,margin:"0 0 5px",color:"#2C2417"}}>Drop your photo here</p>
                  <p style={{fontSize:12,color:"#A89880",margin:0}}>or tap to browse your gallery</p>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:12}}>
                  <button className="btn-ghost" onClick={()=>fileRef.current.click()}>Upload photo</button>
                  <button className="btn-ghost" onClick={()=>camRef.current.click()}>📷 Take photo</button>
                </div>
                <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>handleFile(e.target.files[0])}/>
                <input ref={camRef} type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={e=>handleFile(e.target.files[0])}/>
              </>
            ):(
              <>
                <p style={{fontSize:13,color:"#A89880",margin:"0 0 1rem",lineHeight:1.5}}>Type brand, model, colour — anything.</p>
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
                <img src={imageData} alt="" style={{width:110,height:110,objectFit:"cover",borderRadius:14,border:"1.5px solid #EDE8DF",display:"block",position:"relative",zIndex:1}}/>
              </div>
            ):<div style={{width:70,height:70,background:"linear-gradient(135deg,#FDF6EC,#FBF1E3)",borderRadius:16,margin:"0 auto 1.5rem",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28}}>🔍</div>}
            <p style={{color:"#2C2417",fontSize:13,letterSpacing:".1em",textTransform:"uppercase",fontWeight:600,margin:"0 0 5px"}}>Identifying your item</p>
            <p style={{color:"#A89880",fontSize:12,margin:0}}>AI is reading the image…</p>
          </div>
        )}

        {step==="match_type"&&(
          <div className="slide-in">
            <div className="id-pill">
              {imageData?<img src={imageData} alt="" style={{width:52,height:52,objectFit:"cover",borderRadius:8,border:"1px solid #E8D9C0",flexShrink:0}}/>
                :<div style={{width:40,height:40,background:"#F2EBE0",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{itemCategory==="watches"?"⌚":itemCategory==="jewelry"?"💍":"🔍"}</div>}
              <div style={{flex:1,minWidth:0}}>
                <span className="lbl" style={{margin:0}}>Identified as</span>
                <div style={{color:"#2C2417",fontSize:15,fontFamily:"'Playfair Display',serif",fontStyle:"italic",lineHeight:1.3,marginTop:2}}>{identifiedItem||"Scanning…"}</div>
              </div>
              <button className="rescan" onClick={reset} style={{flexShrink:0}}>Start over</button>
            </div>
            <PriceWidget/>
            <span className="lbl">What are you looking for?</span>
            <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:"1.25rem"}}>
              {[{val:"exact",label:"Exact match",desc:"This specific item"},{val:"similar",label:"Similar style",desc:"Same category or aesthetic"}].map(({val,label,desc})=>(
                <button key={val} className={"choice-card "+(matchType===val?"selected":"")} onClick={()=>setMatchType(val)}>
                  <span style={{fontSize:14,color:"#2C2417",display:"block",fontWeight:500}}>{label}</span>
                  <span style={{fontSize:12,color:"#A89880",display:"block",marginTop:2}}>{desc}</span>
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
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:"1rem"}}>
              {Object.entries(SIZE_CATS).map(([key,cat])=>(
                <button key={key} className={"size-chip "+(sizeCat===key?"selected":"")} onClick={()=>{setSizeCat(sizeCat===key?null:key);setSelectedSize(null);}}>{cat.label}</button>
              ))}
            </div>
            {sizeCat&&SIZE_CATS[sizeCat]&&(
              <div style={{marginBottom:"1rem"}}>
                <span className="lbl" style={{marginBottom:8}}>Pick your size</span>
                <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
                  {SIZE_CATS[sizeCat].sizes.map(s=>(
                    <button key={s} className={"size-chip "+(selectedSize===s?"selected":"")} style={{minWidth:48}} onClick={()=>setSelectedSize(selectedSize===s?null:s)}>{s}</button>
                  ))}
                </div>
              </div>
            )}
            <div style={{marginBottom:"1.25rem"}}>
              <label style={{fontSize:10,color:"#C4924A",display:"block",marginBottom:6,letterSpacing:".15em",textTransform:"uppercase",fontWeight:700}}>Or type a custom size</label>
              <input className="text-input" type="text" placeholder='e.g. "IT 42", "UK 12", "W32 L32"' value={customSize} onChange={e=>{setCustomSize(e.target.value);if(e.target.value)setSelectedSize(null);}}/>
            </div>
            <button className="btn-primary" onClick={()=>setStep("condition")}>{effSize?"Continue with size "+effSize:"Continue without size"}</button>
          </div>
        )}

        {step==="condition"&&(
          <div className="slide-in">
            <Back to={sizeRelevant?"size":"match_type"}/>
            <span className="lbl">First-hand or second-hand?</span>
            <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:"1.25rem"}}>
              {[{val:"new",label:"First-hand only",desc:"Brand new from retail"},{val:"used",label:"Second-hand only",desc:"Pre-owned, vintage, refurbished"},{val:"both",label:"Show me both",desc:"All options — best price wins"}].map(({val,label,desc})=>(
                <button key={val} className={"choice-card "+(condition===val?"selected":"")} onClick={()=>setCondition(val)}>
                  <span style={{fontSize:14,color:"#2C2417",display:"block",fontWeight:500}}>{label}</span>
                  <span style={{fontSize:12,color:"#A89880",display:"block",marginTop:2}}>{desc}</span>
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
            <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:"1.25rem"}}>
              {QUALITY_OPTS.map(({val,label,desc,dot})=>(
                <button key={val} className={"choice-card "+(quality===val?"selected":"")} onClick={()=>setQuality(val)}>
                  <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
                    <div className="cdot" style={{background:dot,marginTop:4}}/>
                    <div>
                      <span style={{fontSize:14,color:"#2C2417",display:"block",fontWeight:500}}>{label}</span>
                      <span style={{fontSize:12,color:"#A89880",display:"block",marginTop:2}}>{desc}</span>
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
            <p style={{color:"#A89880",fontSize:12,margin:"0 0 1.25rem"}}>Leave blank to skip</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:"1rem"}}>
              <div>
                <label style={{fontSize:10,color:"#C4924A",display:"block",marginBottom:6,letterSpacing:".15em",textTransform:"uppercase",fontWeight:700}}>Min ({currency})</label>
                <input className="text-input" type="number" placeholder="0" min="0" value={priceMin} onChange={e=>setPriceMin(e.target.value)}/>
              </div>
              <div>
                <label style={{fontSize:10,color:"#C4924A",display:"block",marginBottom:6,letterSpacing:".15em",textTransform:"uppercase",fontWeight:700}}>Max ({currency})</label>
                <input className="text-input" type="number" placeholder="No limit" min="0" value={priceMax} onChange={e=>setPriceMax(e.target.value)}/>
              </div>
            </div>
            {budgetWarn&&priceEst&&(
              <div className={"bwarn "+budgetWarn}>
                <span style={{fontSize:18,flexShrink:0}}>{budgetWarn==="danger"?"⚠️":"💡"}</span>
                <div>
                  <div style={{fontSize:12,fontWeight:700,color:budgetWarn==="danger"?"#A03020":"#8B6020",marginBottom:3}}>{budgetWarn==="danger"?"Budget may be too low":"Heads up on pricing"}</div>
                  <div style={{fontSize:12,color:budgetWarn==="danger"?"#A03020":"#8B6020",lineHeight:1.5}}>Typically sells for <strong>{currency}{priceEst.min}–{currency}{priceEst.max}</strong>.{budgetWarn==="danger"?" Very hard to find at this price.":" You may need some patience."}</div>
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
            {userLocation&&<p style={{color:"#A89880",fontSize:12,margin:"0 0 1rem"}}>You're in <strong style={{color:"#2C2417"}}>{userLocation.country}</strong>.</p>}
            <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:"1.25rem"}}>
              {[
                {val:"country",label:userLocation?userLocation.country+" only":"My country only",icon:userLocation?getFlag(userLocation.countryCode):"📍",desc:"Local shops & platforms"},
                {val:"continent",label:userLocation?userLocation.continent:"My continent",icon:"🌍",desc:"Shops & platforms across your continent"},
                {val:"worldwide",label:"Worldwide",icon:"🌐",desc:"No limits, international shipping"},
              ].map(({val,label,icon,desc})=>(
                <button key={val} className={"choice-card "+(radius===val?"selected":"")} onClick={()=>setRadius(val)}>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <span style={{fontSize:24,lineHeight:1,flexShrink:0}}>{icon}</span>
                    <div>
                      <span style={{fontSize:14,color:"#2C2417",display:"block",fontWeight:500}}>{label}</span>
                      <span style={{fontSize:12,color:"#A89880",display:"block",marginTop:2}}>{desc}</span>
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
            <p style={{color:"#2C2417",fontSize:13,letterSpacing:".1em",textTransform:"uppercase",fontWeight:600,margin:"0 0 5px"}}>Searching for you</p>
            <p style={{color:"#A89880",fontSize:12,margin:"0 0 1.5rem"}}>Finding real listings &amp; local shops…</p>
            <div className="ssteps">
              {[{label:"Scanning platforms for real listings",phase:1},{label:"Finding local hidden gem shops",phase:2},{label:"Putting it all together",phase:3}].map(({label,phase})=>(
                <div key={phase} className="sstep">
                  <div className={"sdot "+(searchPhase>phase?"done":searchPhase===phase?"active":"pending")}/>
                  <span style={{fontSize:13,color:searchPhase>=phase?"#2C2417":"#C2B9AE",fontWeight:searchPhase===phase?600:400}}>{label}</span>
                  {searchPhase>phase&&<span style={{fontSize:11,color:"#7A9E7E",marginLeft:"auto"}}>✓</span>}
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
                <div style={{color:"#2C2417",fontSize:17,fontFamily:"'Playfair Display',serif",fontStyle:"italic"}}>{identifiedItem}</div>
              </div>
              {imageData&&<img src={imageData} alt="" className="img-thumb"/>}
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:"0.85rem"}}>
              {effSize&&<span className="tag">Size {effSize}</span>}
              {condition==="new"&&<span className="tag">First-hand</span>}
              {condition==="used"&&<span className="tag">Second-hand</span>}
              {condition==="both"&&<span className="tag">New &amp; used</span>}
              {quality&&condition!=="new"&&<span className="tag">{QUALITY_OPTS.find(q=>q.val===quality)?.label}</span>}
              {(priceMin||priceMax)&&<span className="tag">{currency}{priceMin||"0"}–{priceMax?currency+priceMax:"any"}</span>}
              {radius&&userLocation&&<span className="tag">{locLbl()}</span>}
            </div>
            <div style={{height:1,background:"linear-gradient(90deg,#C4924A,transparent)",opacity:.3,marginBottom:"1rem"}}/>
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
            <div className="divgem"><span className="gem">{condition==="new"?"🏪":"💎"}</span></div>
            <div className="sec-title"><span>{condition==="new"?"Physical stores":"Hidden gem shops"}</span></div>
            {condition!=="new"&&shopResults.length>0&&(
              <div className="tip-box">
                <span style={{fontSize:16,flexShrink:0}}>🗺️</span>
                <p style={{fontSize:12,color:"#4A6E4F",margin:0,lineHeight:1.5}}>Real stores that may carry this. Call ahead — the best finds are never online.</p>
              </div>
            )}
            {shopResults.length===0&&<div className="no-results">No local shops found. Try broadening your search radius.</div>}
            {shopResults.map((s,i)=>(
              <div key={i} className="shop-card">
                <div style={{display:"flex",alignItems:"flex-start"}}>
                  <span className="shop-num">{i+1}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:14,color:"#2C2417",fontWeight:600,marginBottom:3}}>{s.name}</div>
                    {s.description&&<p style={{fontSize:12,color:"#5A6B5C",margin:"0 0 3px",lineHeight:1.5}}>{s.description}</p>}
                    {s.tip&&<p style={{fontSize:12,color:"#A89880",margin:"0 0 4px",fontStyle:"italic"}}>"{s.tip}"</p>}
                    <div>
                      <span className={"tag "+(condition!=="new"?"g":"")}>{condition==="new"?"Retail":"Physical store"}</span>
                      {s.address&&<span className="tag">{s.address}</span>}
                    </div>
                    {s.url&&<a href={s.url} className="shop-btn" target="_blank" rel="noopener noreferrer">Visit website →</a>}
                  </div>
                </div>
              </div>
            ))}
            <div style={{display:"flex",flexDirection:"column",gap:8,marginTop:"1rem"}}>
              <button className="btn-ghost" onClick={()=>{setListings([]);setShopResults([]);setStep("condition");}}>Adjust filters &amp; search again</button>
              <button className="rescan" style={{display:"block",textAlign:"center"}} onClick={reset}>Start a new scan</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
