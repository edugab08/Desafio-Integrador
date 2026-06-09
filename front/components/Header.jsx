"use client";
import { usePathname } from "next/navigation";
import { T } from "../lib/tokens";

const PAGES = {
  "/":           { icon:"📊", label:"Dashboard"  },
  "/clientes":   { icon:"👥", label:"Clientes"   },
  "/produtos":   { icon:"📦", label:"Produtos"   },
  "/pedidos":    { icon:"🛒", label:"Pedidos"    },
  "/relatorios": { icon:"📋", label:"Relatórios" },
  "/ia":         { icon:"🤖", label:"IA & Churn" },
};

export default function Header({ onMenuClick }) {
  const pathname = usePathname();
  const key  = Object.keys(PAGES).find(k => k==="/" ? pathname==="/" : pathname.startsWith(k)) || "/";
  const page = PAGES[key];
  return (
    <header style={{ background:"#fff", height:62, padding:"0 20px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:`1px solid ${T.border}`, boxShadow:"0 1px 0 rgba(0,0,0,.04)", flexShrink:0 }}>
      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        <button onClick={onMenuClick} style={{ background:"none", border:"none", cursor:"pointer", padding:"6px", borderRadius:8, fontSize:20, color:T.muted, display:"flex", alignItems:"center" }}>☰</button>
        <div>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:15, color:T.text }}>{page.icon} {page.label}</div>
          <div style={{ fontSize:11, color:T.muted }}>Sistema de Análise Empresarial</div>
        </div>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <div className="hide-mobile" style={{ fontSize:12, color:T.muted, fontWeight:600, background:T.bg, padding:"6px 12px", borderRadius:8, border:`1px solid ${T.border}` }}>
          📅 {new Date().toLocaleDateString("pt-BR",{ day:"2-digit", month:"short", year:"numeric" })}
        </div>
        <div style={{ width:34, height:34, borderRadius:9, background:`linear-gradient(135deg,${T.primary},#f97316)`, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:800, fontSize:14 }}>A</div>
      </div>
    </header>
  );
}
