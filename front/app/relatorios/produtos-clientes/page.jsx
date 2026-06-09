"use client";
import { useState, useEffect } from "react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, SectionHead, ChartTip, Badge, ProgressBar } from "../../../components/ui";
import { LoadingScreen, ErrorBanner, SkeletonStyles } from "../../../components/ui/Skeleton";
import { relatoriosApi } from "../../../lib/api";
import { PRODUTOS_MOCK, CLIENTES_MOCK, COLORS } from "../../../lib/data";
import { T } from "../../../lib/tokens";
import { brl } from "../../../lib/utils";

export default function ProdutosClientesPage() {
  const [dados,   setDados]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro,    setErro]    = useState(null);

  useEffect(() => {
    relatoriosApi.produtosClientes()
      .then(d => { setDados(d); setErro(null); })
      .catch(e => { setErro(e.message); })
      .finally(() => setLoading(false));
  }, []);

  const produtos   = dados?.topProdutos?.length  ? dados.topProdutos  : PRODUTOS_MOCK;
  const clientes   = dados?.topClientes?.length  ? dados.topClientes  : CLIENTES_MOCK;
  const totalRecClientes = clientes.reduce((s,c) => s + Number(c.receita ?? 0), 0);

  if (loading) return <LoadingScreen msg="Carregando relatório de produtos e clientes..."/>;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
      <SkeletonStyles/>
      {erro && <ErrorBanner msg={erro}/>}

      <div style={{ background:"linear-gradient(135deg,#0f2027,#203a43)", borderRadius:20, padding:"28px 32px", border:"1px solid rgba(255,255,255,.06)" }}>
        <span style={{ fontSize:10, fontWeight:800, padding:"3px 8px", borderRadius:6, background:`${T.primary}30`, color:T.primary, textTransform:"uppercase" }}>Gerencial · Relatório 2</span>
        <h2 style={{ fontFamily:"'Syne',sans-serif", color:"#fff", fontSize:24, fontWeight:800, marginTop:10, marginBottom:6 }}>Análise de Produtos e Clientes</h2>
        <p style={{ color:"#94a3b8", fontSize:13 }}>Ranking de desempenho de produtos e comportamento dos clientes.</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"3fr 2fr", gap:16 }}>
        <Card>
          <SectionHead title="Top Produtos por Receita"/>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={produtos} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f8" horizontal={false}/>
              <XAxis type="number" tick={{fontSize:11}} tickFormatter={v=>brl(v)}/>
              <YAxis dataKey="nome" type="category" tick={{fontSize:11}} width={130}/>
              <Tooltip content={<ChartTip money/>}/>
              <Bar dataKey={d=>Number(d.receita ?? d.preco ?? 0)} name="Receita" radius={[0,6,6,0]}>
                {produtos.map((_,i) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <SectionHead title="Por Categoria"/>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={[
                {name:"Informática",value:48},{name:"Periféricos",value:31},
                {name:"Áudio",value:12},{name:"Armazenamento",value:9}
              ]} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                {COLORS.map((c,i) => <Cell key={i} fill={c}/>)}
              </Pie>
              <Tooltip/><Legend iconType="circle" iconSize={9} wrapperStyle={{fontSize:12}}/>
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card style={{ padding:0 }}>
        <div style={{ padding:"16px 24px", borderBottom:`1px solid ${T.border}`, display:"flex", justifyContent:"space-between" }}>
          <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:15 }}>Ranking de Clientes</span>
          <Badge label={`${clientes.length} clientes`} bg="#fdf4ff" fg="#7c3aed"/>
        </div>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
          <thead><tr style={{ borderBottom:`1px solid ${T.border}`, background:"#fafbff" }}>
            {["#","Cliente","Estado","Pedidos","Receita","Participação"].map(h => <th key={h} style={{ padding:"11px 14px", textAlign:"left", fontSize:11, fontWeight:700, color:T.muted, textTransform:"uppercase", letterSpacing:.4 }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {clientes.map((c,i) => {
              const receita = Number(c.receita ?? 0);
              return (
                <tr key={i} style={{ borderBottom:"1px solid #f5f5f8" }}>
                  <td style={{ padding:"11px 14px", fontWeight:800, color:i===0?"#a16207":T.muted }}>#{i+1}</td>
                  <td style={{ padding:"11px 14px", fontWeight:600 }}>{c.nome}</td>
                  <td style={{ padding:"11px 14px" }}><Badge label={c.estado ?? "—"} bg="#f0f4ff" fg={T.info}/></td>
                  <td style={{ padding:"11px 14px" }}>{c.total_pedidos ?? c.pedidos ?? "—"}</td>
                  <td style={{ padding:"11px 14px", fontWeight:700, color:T.success }}>{brl(receita)}</td>
                  <td style={{ padding:"11px 14px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <ProgressBar value={receita} max={Number(clientes[0]?.receita ?? 1)} color={T.primary} height={6}/>
                      <span style={{ fontSize:11, fontWeight:700, color:T.primary, minWidth:36 }}>
                        {totalRecClientes > 0 ? `${((receita/totalRecClientes)*100).toFixed(1)}%` : "—"}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
