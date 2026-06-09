
"use client";
import { useState, useEffect, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, SectionHead, StatCard, ChartTip, Badge, ProgressBar } from "../../components/ui";
import { LoadingScreen, ErrorBanner, SkeletonStyles } from "../../components/ui/Skeleton";
import { relatoriosApi, mlServiceApi } from "../../lib/api";
import { CHURN_MOCK } from "../../lib/data";
import { T } from "../../lib/tokens";
import { brl, churnColor } from "../../lib/utils";

export default function IAPage() {
  const [churnDados, setChurnDados] = useState(null);
  const [modelInfo,  setModelInfo]  = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [treinando,  setTreinando]  = useState(false);
  const [progress,   setProgress]   = useState(0);
  const [erro,       setErro]       = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    Promise.all([
      relatoriosApi.churn().catch(() => null),
      mlServiceApi.info().catch(() => null),
    ]).then(([churn, info]) => {
      if (churn) setChurnDados(churn);
      if (info)  setModelInfo(info);
      setErro(null);
    }).catch(e => setErro(e.message))
      .finally(() => setLoading(false));
  }, []);

  const runModel = async () => {
    setTreinando(true); setProgress(0);
    let p = 0;
    timerRef.current = setInterval(() => {
      p += Math.random() * 8 + 4;
      if (p >= 100) { p = 100; clearInterval(timerRef.current); }
      setProgress(Math.min(p, 100));
    }, 180);
    try {
      await mlServiceApi.train();
      const [churn, info] = await Promise.all([relatoriosApi.churn(), mlServiceApi.info().catch(()=>null)]);
      setChurnDados(churn);
      if (info) setModelInfo(info);
    } catch (e) {
      setErro(e.message);
    } finally {
      setTreinando(false);
    }
  };

  if (loading) return <LoadingScreen msg="Carregando módulo de IA..."/>;

  const clientes = churnDados?.clientes?.length ? churnDados.clientes : CHURN_MOCK;
  const alto   = clientes.filter(c => (c.churn_pct ?? c.churn ?? 0) >= 60);
  const medio  = clientes.filter(c => { const v = c.churn_pct ?? c.churn ?? 0; return v>=30 && v<60; });
  const baixo  = clientes.filter(c => (c.churn_pct ?? c.churn ?? 0) < 30);
  const metricas = churnDados?.metricas ?? modelInfo;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
      <SkeletonStyles/>
      {erro && <ErrorBanner msg={erro}/>}

      {/* Hero */}
      <Card style={{ background:`linear-gradient(135deg,${T.dark},#1e2d4a)`, borderColor:"transparent" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:16 }}>
          <div>
            <h2 style={{ fontFamily:"'Syne',sans-serif", color:"#fff", fontSize:22, fontWeight:800, margin:"0 0 6px" }}>Módulo de IA — Random Forest</h2>
            <p style={{ color:"#94a3b8", fontSize:13, margin:0 }}>Classificação de clientes · Churn Rate · Scoring de propensão</p>
          </div>
          <button onClick={runModel} disabled={treinando} style={{ padding:"10px 20px", borderRadius:10, border:"none", cursor:"pointer", fontSize:13, fontWeight:700, background:`linear-gradient(135deg,${T.primary},#f97316)`, color:"#fff", opacity:treinando?.6:1 }}>
            {treinando ? "Treinando..." : "▶ Retreinar Modelo"}
          </button>
        </div>
        {treinando && (
          <div style={{ marginTop:20 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
              <span style={{ fontSize:12, color:"#94a3b8", fontWeight:600 }}>Treinando modelo...</span>
              <span style={{ fontSize:12, color:T.primary, fontWeight:700 }}>{Math.round(progress)}%</span>
            </div>
            <div style={{ height:6, background:"rgba(255,255,255,.1)", borderRadius:99, overflow:"hidden" }}>
              <div style={{ width:`${progress}%`, height:"100%", background:`linear-gradient(90deg,${T.primary},#f97316)`, borderRadius:99, transition:"width .2s" }}/>
            </div>
          </div>
        )}
      </Card>

      {/* Métricas do modelo */}
      {metricas && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16 }}>
          <StatCard icon="🎯" label="Acurácia"   value={`${metricas.acuracia ?? metricas.acuracia_churn ?? "—"}%`}  color={T.success}/>
          <StatCard icon="📈" label="Precision"  value={`${metricas.precision ?? "—"}%`}  color="#f97316"/>
          <StatCard icon="🔁" label="Recall"     value={`${metricas.recall ?? "—"}%`}     color="#8b5cf6"/>
          <StatCard icon="⚖️" label="F1-Score"   value={`${metricas.f1_score ?? "—"}%`}   color="#06b6d4"/>
        </div>
      )}

      {/* KPIs risco */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
        <StatCard icon="✅" label="Baixo Risco (< 30%)"   value={baixo.length}  color={T.success}/>
        <StatCard icon="⚠️" label="Risco Médio (30–60%)"  value={medio.length}  color={T.warning}/>
        <StatCard icon="🚨" label="Alto Risco (≥ 60%)"    value={alto.length}   color={T.danger}/>
      </div>

      {/* Gráfico */}
      <Card>
        <SectionHead title="Score de Compra vs Risco de Churn"/>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={clientes}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f8"/>
            <XAxis dataKey="nome" tick={{fontSize:10}} interval={0}/>
            <YAxis domain={[0,100]} tickFormatter={v=>`${v}%`} tick={{fontSize:12}}/>
            <Tooltip content={<ChartTip/>}/><Legend/>
            <Bar dataKey={d=>d.scoring ?? d.score_pct ?? 0} fill={T.success} name="Score de Compra %" radius={[4,4,0,0]}/>
            <Bar dataKey={d=>d.churn_pct ?? d.churn ?? 0}   fill={T.danger}  name="Risco de Churn %"  radius={[4,4,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Tabela */}
      <Card style={{ padding:0 }}>
        <div style={{ padding:"16px 24px", borderBottom:`1px solid ${T.border}` }}>
          <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:15 }}>Classificação de Clientes</span>
        </div>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
          <thead><tr style={{ borderBottom:`1px solid ${T.border}`, background:"#fafbff" }}>
            {["Cliente","Score de Compra","Risco de Churn","Classificação","Ação Sugerida"].map(h => <th key={h} style={{ padding:"11px 14px", textAlign:"left", fontSize:11, fontWeight:700, color:T.muted, textTransform:"uppercase", letterSpacing:.4 }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {clientes.map((c,i) => {
              const churnVal = c.churn_pct ?? c.churn ?? 0;
              const scoreVal = c.scoring ?? c.score_pct ?? 0;
              const cc = churnColor(churnVal);
              return (
                <tr key={i} style={{ borderBottom:"1px solid #f5f5f8" }}>
                  <td style={{ padding:"11px 14px", fontWeight:600 }}>{c.nome}</td>
                  <td style={{ padding:"11px 14px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <ProgressBar value={scoreVal} color={T.success} height={7}/>
                      <b style={{ color:T.success, minWidth:36 }}>{scoreVal}%</b>
                    </div>
                  </td>
                  <td style={{ padding:"11px 14px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <ProgressBar value={churnVal} color={cc.fg} height={7}/>
                      <b style={{ color:cc.fg, minWidth:36 }}>{churnVal}%</b>
                    </div>
                  </td>
                  <td style={{ padding:"11px 14px" }}><Badge label={c.segmento ?? cc.label} bg={cc.bg} fg={cc.fg}/></td>
                  <td style={{ padding:"11px 14px", fontSize:12, color:T.muted, fontWeight:600 }}>{c.acao_sugerida ?? (churnVal>=60?"Contato urgente":churnVal>=30?"Monitorar":"Manter relacionamento")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
