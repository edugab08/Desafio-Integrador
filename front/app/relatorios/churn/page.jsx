
"use client";
import { useState, useEffect } from "react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, SectionHead, Badge, ProgressBar, ChartTip } from "../../../components/ui";
import { LoadingScreen, ErrorBanner, SkeletonStyles } from "../../../components/ui/Skeleton";
import { relatoriosApi } from "../../../lib/api";
import { CHURN_MOCK } from "../../../lib/data";
import { T } from "../../../lib/tokens";
import { brl, churnColor } from "../../../lib/utils";

export default function ChurnPage() {
  const [dados,   setDados]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro,    setErro]    = useState(null);

  useEffect(() => {
    relatoriosApi.churn()
      .then(d => { setDados(d); setErro(null); })
      .catch(e => { setErro(e.message); })
      .finally(() => setLoading(false));
  }, []);

  const clientes = dados?.clientes?.length ? dados.clientes : CHURN_MOCK;
  const alto  = clientes.filter(c => (c.churn_pct ?? c.churn ?? 0) >= 60);
  const medio = clientes.filter(c => { const v = c.churn_pct ?? c.churn ?? 0; return v >= 30 && v < 60; });
  const baixo = clientes.filter(c => (c.churn_pct ?? c.churn ?? 0) < 30);
  const sorted = [...clientes].sort((a,b) => (b.churn_pct ?? b.churn ?? 0) - (a.churn_pct ?? a.churn ?? 0));

  if (loading) return <LoadingScreen msg="Executando modelo de churn..."/>;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
      <SkeletonStyles/>
      {erro && <ErrorBanner msg={erro}/>}

      <div style={{ background:"linear-gradient(135deg,#1a0a2e,#0f3460)", borderRadius:20, padding:"28px 32px", border:"1px solid rgba(255,255,255,.06)" }}>
        <span style={{ fontSize:10, fontWeight:800, padding:"3px 8px", borderRadius:6, background:"rgba(239,68,68,.25)", color:"#fca5a5", textTransform:"uppercase" }}>Estratégico · Relatório 1</span>
        <h2 style={{ fontFamily:"'Syne',sans-serif", color:"#fff", fontSize:24, fontWeight:800, marginTop:10, marginBottom:6 }}>Análise de Churn e Retenção</h2>
        <p style={{ color:"#94a3b8", fontSize:13 }}>Clientes em risco identificados pelo modelo Random Forest · {dados?.modelo ?? "Random Forest"}</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginTop:22 }}>
          {[["Alto Risco", alto.length, "#ef4444"], ["Risco Médio", medio.length, "#f59e0b"], ["Baixo Risco", baixo.length, "#10b981"]].map(([l,v,c]) => (
            <div key={l} style={{ background:"rgba(255,255,255,.06)", borderRadius:12, padding:"14px 16px", borderLeft:`3px solid ${c}` }}>
              <div style={{ fontSize:11, color:"#64748b", fontWeight:600, marginBottom:4 }}>{l}</div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:24, fontWeight:800, color:"#fff" }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <Card>
          <SectionHead title="Distribuição de Risco"/>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={[{name:"Alto",value:alto.length},{name:"Médio",value:medio.length},{name:"Baixo",value:baixo.length}]}
                cx="50%" cy="50%" outerRadius={85} paddingAngle={5} dataKey="value"
                label={({name,percent})=>`${(percent*100).toFixed(0)}%`} labelLine={false}>
                <Cell fill="#ef4444"/><Cell fill="#f59e0b"/><Cell fill="#10b981"/>
              </Pie>
              <Tooltip/><Legend iconType="circle" wrapperStyle={{fontSize:12}}/>
            </PieChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <SectionHead title="Score vs Churn"/>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={clientes.slice(0,8)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f8"/>
              <XAxis dataKey="nome" tick={{fontSize:9}} interval={0}/>
              <YAxis tick={{fontSize:11}} tickFormatter={v=>`${v}%`}/>
              <Tooltip content={<ChartTip/>}/><Legend/>
              <Bar dataKey={d=>d.scoring ?? d.churn_pct ?? 0} fill="#10b981" name="Score %" radius={[4,4,0,0]}/>
              <Bar dataKey={d=>d.churn_pct ?? d.churn ?? 0}   fill="#ef4444" name="Churn %"  radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card style={{ padding:0 }}>
        <div style={{ padding:"16px 24px", borderBottom:`1px solid ${T.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:15 }}>Plano de Ação de Retenção</span>
          <Badge label="Priorizado por urgência" bg="#fef2f2" fg="#ef4444"/>
        </div>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
          <thead><tr style={{ borderBottom:`1px solid ${T.border}`, background:"#fafbff" }}>
            {["Cliente","Churn %","Segmento","Ação Recomendada","Prazo"].map(h => <th key={h} style={{ padding:"11px 14px", textAlign:"left", fontSize:11, fontWeight:700, color:T.muted, textTransform:"uppercase", letterSpacing:.4 }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {sorted.map((c, i) => {
              const churnVal = c.churn_pct ?? c.churn ?? 0;
              const cb = churnColor(churnVal);
              const acao  = churnVal >= 60 ? "Contato urgente — oferta exclusiva" : churnVal >= 30 ? "Campanha de reengajamento" : "Manter relacionamento";
              const prazo = churnVal >= 60 ? "48h" : churnVal >= 30 ? "7 dias" : "30 dias";
              return (
                <tr key={i} style={{ borderBottom:"1px solid #f5f5f8" }}>
                  <td style={{ padding:"11px 14px", fontWeight:600 }}>{c.nome}</td>
                  <td style={{ padding:"11px 14px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <ProgressBar value={churnVal} color={cb.fg} height={7}/>
                      <b style={{ color:cb.fg, minWidth:34 }}>{churnVal}%</b>
                    </div>
                  </td>
                  <td style={{ padding:"11px 14px" }}><Badge label={c.segmento ?? cb.label} bg={cb.bg} fg={cb.fg}/></td>
                  <td style={{ padding:"11px 14px", fontSize:12, color:T.muted, fontWeight:600 }}>{c.acao_sugerida ?? acao}</td>
                  <td style={{ padding:"11px 14px" }}><Badge label={prazo} bg={churnVal>=60?"#fef2f2":churnVal>=30?"#fef9c3":"#f0fdf4"} fg={churnVal>=60?"#ef4444":churnVal>=30?"#f59e0b":"#10b981"}/></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
