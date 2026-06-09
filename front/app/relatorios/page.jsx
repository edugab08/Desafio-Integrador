"use client";
import Link from "next/link";
import { T } from "../../lib/tokens";

const RELATORIOS = [
  { href:"/relatorios/vendas",           tag:"Gerencial",   label:"Análise de Vendas",         sub:"Receita, pedidos, cancelamentos e crescimento anual",      icon:"📊", color:T.primary  },
  { href:"/relatorios/produtos-clientes",tag:"Gerencial",   label:"Produtos & Clientes",        sub:"Ranking de produtos, categorias e top clientes",           icon:"📦", color:"#f97316"  },
  { href:"/relatorios/churn",            tag:"Estratégico", label:"Churn & Retenção",           sub:"Análise de risco de cancelamento e plano de ação",         icon:"🔮", color:"#ef4444"  },
  { href:"/relatorios/scoring",          tag:"Estratégico", label:"Scoring & Expansão",         sub:"Propensão de compra, RFM e expansão de receita (CLV)",     icon:"🚀", color:"#10b981"  },
];

export default function RelatoriosPage() {
  const gerenciais   = RELATORIOS.filter(r => r.tag === "Gerencial");
  const estrategicos = RELATORIOS.filter(r => r.tag === "Estratégico");

  const renderGroup = (list, tagBg, tagColor) => (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:28 }}>
      {list.map(r => (
        <Link key={r.href} href={r.href} style={{ textDecoration:"none" }}>
          <div style={{ background:"#fff", borderRadius:16, padding:24, cursor:"pointer", border:`1px solid ${T.border}`, borderLeft:`4px solid ${r.color}`, boxShadow:"0 1px 4px rgba(0,0,0,.05)", transition:"all .2s" }}
            onMouseEnter={e => { e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.boxShadow="0 8px 32px rgba(0,0,0,.10)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow="0 1px 4px rgba(0,0,0,.05)"; }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div style={{ width:48, height:48, borderRadius:14, background:`${r.color}18`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24 }}>{r.icon}</div>
              <span style={{ fontSize:11, fontWeight:700, padding:"3px 8px", borderRadius:6, background:tagBg, color:tagColor }}>{r.tag.toUpperCase()}</span>
            </div>
            <div style={{ marginTop:16 }}>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:17, fontWeight:800, marginBottom:6 }}>{r.label}</div>
              <div style={{ fontSize:13, color:T.muted, lineHeight:1.5 }}>{r.sub}</div>
            </div>
            <div style={{ marginTop:18, display:"flex", alignItems:"center", gap:6, fontSize:13, fontWeight:700, color:r.color }}>
              Abrir relatório →
            </div>
          </div>
        </Link>
      ))}
    </div>
  );

  return (
    <div style={{ maxWidth:960 }}>
      {/* Hero */}
      <div style={{ background:`linear-gradient(135deg,#0c0f1a,#1c2d4a)`, borderRadius:20, padding:"36px 40px", marginBottom:32, border:"1px solid rgba(255,255,255,.06)" }}>
        <h1 style={{ fontFamily:"'Syne',sans-serif", color:"#fff", fontSize:28, fontWeight:800, letterSpacing:-.6, marginBottom:8 }}>📋 Central de Relatórios</h1>
        <p style={{ color:"#94a3b8", fontSize:14, maxWidth:480, lineHeight:1.6, marginBottom:24 }}>
          Relatórios gerenciais e estratégicos gerados com base nos dados do sistema e no modelo Random Forest.
        </p>
        <div style={{ display:"flex", gap:24 }}>
          {[["2","Relatórios Gerenciais",T.primary],["2","Relatórios Estratégicos","#10b981"],["1","Modelo de IA",T.info]].map(([n,l,c]) => (
            <div key={l}>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:28, fontWeight:800, color:c }}>{n}</div>
              <div style={{ fontSize:12, color:"#64748b", fontWeight:600 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Gerenciais */}
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
        <span style={{ fontSize:11, fontWeight:800, padding:"3px 10px", borderRadius:6, background:`${T.primary}18`, color:T.primary, textTransform:"uppercase", letterSpacing:.8 }}>Gerenciais</span>
        <span style={{ fontSize:12, color:T.muted }}>Análise dos dados cadastrados</span>
      </div>
      {renderGroup(gerenciais, `${T.primary}18`, T.primary)}

      {/* Estratégicos */}
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
        <span style={{ fontSize:11, fontWeight:800, padding:"3px 10px", borderRadius:6, background:"rgba(239,68,68,.12)", color:"#ef4444", textTransform:"uppercase", letterSpacing:.8 }}>Estratégicos</span>
        <span style={{ fontSize:12, color:T.muted }}>Tomada de decisão com IA — Random Forest</span>
      </div>
      {renderGroup(estrategicos, "rgba(239,68,68,.12)", "#ef4444")}
    </div>
  );
}
