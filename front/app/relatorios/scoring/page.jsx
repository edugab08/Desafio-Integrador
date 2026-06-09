
"use client";
import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from "recharts";
import { Card, SectionHead, Badge, ProgressBar, ChartTip } from "../../../components/ui";
import { LoadingScreen, ErrorBanner, SkeletonStyles } from "../../../components/ui/Skeleton";
import { relatoriosApi } from "../../../lib/api";
import { CHURN_MOCK } from "../../../lib/data";
import { T } from "../../../lib/tokens";
import { brl } from "../../../lib/utils";

export default function ScoringPage() {
  const [dados,   setDados]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro,    setErro]    = useState(null);

  useEffect(() => {
    relatoriosApi.scoring()
      .then(d => { setDados(d); setErro(null); })
      .catch(e => { setErro(e.message); })
      .finally(() => setLoading(false));
  }, []);

  const clientes  = dados?.clientes?.length ? dados.clientes : CHURN_MOCK;
  const sorted    = [...clientes].sort((a,b) => (b.score_pct ?? b.scoring ?? 0) - (a.score_pct ?? a.scoring ?? 0));
  const totalCLV  = clientes.reduce((s,c) => s + (c.clv ?? 0), 0);

  if (loading) return <LoadingScreen msg="Calculando scoring de propensão..."/>;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
      <SkeletonStyles/>
      {erro && <ErrorBanner msg={erro}/>}

      <div style={{ background:"linear-gradient(135deg,#0a1628,#103556)", borderRadius:20, padding:"28px 32px", border:"1px solid rgba(255,255,255,.06)" }}>
        <span style={{ fontSize:10, fontWeight:800, padding:"3px 8px", borderRadius:6, background:"rgba(16,185,129,.25)", color:"#6ee7b7", textTransform:"uppercase" }}>Estratégico · Relatório 2</span>
        <h2 style={{ fontFamily:"'Syne',sans-serif", color:"#fff", fontSize:24, fontWeight:800, marginTop:10, marginBottom:6 }}>Scoring de Propensão e Expansão de Receita</h2>
        <p style={{ color:"#94a3b8", fontSize:13 }}>Clientes com maior potencial identificados pelo Random Forest.</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginTop:22 }}>
          {[["CLV Total",brl(totalCLV),"#10b981"],["Maior Score",`${sorted[0]?.score_pct ?? sorted[0]?.scoring ?? 0}%`,T.primary],["Clientes",clientes.length,"#8b5cf6"]].map(([l,v,c])=>(
            <div key={l} style={{ background:"rgba(255,255,255,.06)", borderRadius:12, padding:"14px 16px", borderLeft:`3px solid ${c}` }}>
              <div style={{ fontSize:11, color:"#64748b", fontWeight:600, marginBottom:4 }}>{l}</div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:800, color:"#fff" }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      <Card>
        <SectionHead title="Ranking de Propensão à Compra" sub="Meta: score acima de 70%"/>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={sorted} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f8" horizontal={false}/>
            <XAxis type="number" domain={[0,100]} tick={{fontSize:11}} tickFormatter={v=>`${v}%`}/>
            <YAxis dataKey="nome" type="category" tick={{fontSize:11}} width={150}/>
            <Tooltip content={<ChartTip/>}/>
            <Bar dataKey={d=>d.score_pct ?? d.scoring ?? 0} name="Score %" radius={[0,6,6,0]}>
              {sorted.map((_,i) => <Cell key={i} fill={i===0?"#e11d74":i<3?"#10b981":"#3b82f6"}/>)}
            </Bar>
            <ReferenceLine x={70} stroke="#f59e0b" strokeDasharray="6 3"/>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card style={{ padding:0 }}>
        <div style={{ padding:"16px 24px", borderBottom:`1px solid ${T.border}`, display:"flex", justifyContent:"space-between" }}>
          <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:15 }}>Plano de Expansão de Receita</span>
          <Badge label="Por potencial" bg="#f0fdf4" fg="#10b981"/>
        </div>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
          <thead><tr style={{ borderBottom:`1px solid ${T.border}`, background:"#fafbff" }}>
            {["#","Cliente","Score","CLV","Estratégia","Prioridade"].map(h => <th key={h} style={{ padding:"11px 14px", textAlign:"left", fontSize:11, fontWeight:700, color:T.muted, textTransform:"uppercase", letterSpacing:.4 }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {sorted.map((c,i) => {
              const score = c.score_pct ?? c.scoring ?? 0;
              const est   = c.estrategia ?? (score>=80?"Upsell imediato + premium":score>=60?"Campanha personalizada":"Reengajamento");
              const prio  = c.prioridade ?? (score>=80?"Alta":score>=60?"Média":"Baixa");
              const pc    = score>=80?{bg:"#fdf4ff",fg:"#7c3aed"}:score>=60?{bg:"#fff7ed",fg:"#c2410c"}:{bg:"#f0f9ff",fg:"#1d4ed8"};
              return (
                <tr key={i} style={{ borderBottom:"1px solid #f5f5f8" }}>
                  <td style={{ padding:"11px 14px", fontWeight:700, color:i===0?"#a16207":T.muted }}>#{i+1}</td>
                  <td style={{ padding:"11px 14px", fontWeight:600 }}>{c.nome}</td>
                  <td style={{ padding:"11px 14px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <ProgressBar value={score} color="#10b981" height={7}/>
                      <b style={{ color:"#10b981", minWidth:34 }}>{score}%</b>
                    </div>
                  </td>
                  <td style={{ padding:"11px 14px", fontWeight:700, color:T.info }}>{c.clv ? brl(c.clv) : "—"}</td>
                  <td style={{ padding:"11px 14px", fontSize:12, color:T.muted, fontWeight:600 }}>{est}</td>
                  <td style={{ padding:"11px 14px" }}><Badge label={prio} bg={pc.bg} fg={pc.fg}/></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
