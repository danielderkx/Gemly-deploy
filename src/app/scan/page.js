'use client';
import { useRouter } from "next/navigation";
import Scanner from "../Scanner";

export default function ScanPage() {
  const router = useRouter();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400;1,500&family=Nunito:wght@300;400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        body{background:#F2EDE6;font-family:'Nunito',sans-serif;min-height:100vh;}
        .sn{display:flex;align-items:center;justify-content:space-between;padding:1rem 1.5rem;background:#FDFAF6;border-bottom:1px solid #EDE8DF;position:sticky;top:0;z-index:100;min-height:58px;}
        .sn-logo{font-family:'Playfair Display',serif;font-size:20px;font-style:italic;font-weight:500;color:#2C2417;cursor:pointer;letter-spacing:-.02em;white-space:nowrap;}
        .sn-logo b{color:#C4924A;font-weight:400;}
        .sn-back{background:none;border:1.5px solid #D9D0C3;border-radius:9px;padding:.45rem .9rem;font-size:11px;font-family:'Nunito',sans-serif;font-weight:600;color:#7A6E62;cursor:pointer;transition:all .2s;letter-spacing:.06em;text-transform:uppercase;white-space:nowrap;flex-shrink:0;}
        .sn-back:hover{border-color:#C4924A;color:#C4924A;}
        .sb{min-height:calc(100vh - 58px);display:flex;flex-direction:column;align-items:center;padding:2.5rem 1.5rem 4rem;}
        .sw{width:100%;max-width:540px;}
      `}</style>

      <nav className="sn">
        <div className="sn-logo" onClick={() => router.push('/')}>Gem<b>ly</b></div>
        <button className="sn-back" onClick={() => router.push('/')}>← Back</button>
      </nav>

      <div className="sb">
        <div className="sw">
          <Scanner />
        </div>
      </div>
    </>
  );
}
