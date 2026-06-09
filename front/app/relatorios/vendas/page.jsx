"use client";
import{useState,useEffect}from"react";
import{ComposedChart,Area,Bar,AreaChart,XAxis,YAxis,CartesianGrid,Tooltip,Legend,ResponsiveContainer}from"recharts";
import{Card,SectionHead,ChartTip,Badge}from"../../../components/ui";
import{LoadingScreen,ErrorBanner,SkeletonStyles}from"../../../components/ui/Skeleton";
import{relatoriosApi}from"../../../lib/api";
import{VENDAS_MENSAIS}from"../../../lib/data";
import{T}from"../../../lib/tokens";
import{brl}from"../../../lib/utils";
export default function VendasPage(){
  const[dados,setDados]=useState(null);
  const[loading,setLoading]=useState(true);
  const[erro,setErro]=useState(null);
  useEffect(()=>{relatoriosApi.vendas().then(d=>{setDados(d);setErro(null);}).catch(e=>setErro(e.message)).finally(()=>setLoading(false));},[]);
  const meses=dados?.detalhesMensais?.length?dados.detalhesMensais:VENDAS_MENSAIS.map(m=>({...m,total_pedidos:m.pedidos}));
  const resumo=dados?.resumo??{totalReceita:0,totalPedidos:0,ticketMedio:0};
  const acumulado=meses.reduce((acc,m,i)=>{acc.push({...m,recAcum:(acc[i-1]?.recAcum||0)+Number(m.receita||0)});return acc;},[]);
  if(loading)return<LoadingScreen msg="Gerando relatório de vendas..."/>;
  return(
    <div style={{display:"flex",flexDirection:"column",gap:24}}>
      <SkeletonStyles/>
      {erro&&<ErrorBanner msg={erro}/>}
      <div style={{background:`linear-gradient(135deg,${T.dark},#1e2d4a)`,borderRadius:20,padding:"28px 32px",border:"1px solid rgba(255,255,255,.06)"}}>
        <span style={{fontSize:10,fontWeight:800,padding:"3px 8px",borderRadius:6,background:`${T.primary}30`,color:T.primary,textTransform:"uppercase"}}>Gerencial · Relatório 1</span>
        <h2 style={{fontFamily:"'Syne',sans-serif",color:"#fff",fontSize:22,fontWeight:800,marginTop:10,marginBottom:6}}>Análise de Desempenho de Vendas</h2>
        <p style={{color:"#94a3b8",fontSize:13}}>Visão completa das métricas de vendas do período.</p>
        <div className="grid-3" style={{marginTop:20}}>
          {[["Receita Total",brl(resumo.totalReceita),T.primary],["Total Pedidos",resumo.totalPedidos,"#f97316"],["Ticket Médio",brl(resumo.ticketMedio),"#06b6d4"]].map(([l,v,c])=>(
            <div key={l} style={{background:"rgba(255,255,255,.06)",borderRadius:12,padding:"14px 16px",borderLeft:`3px solid ${c}`}}>
              <div style={{fontSize:11,color:"#64748b",fontWeight:600,marginBottom:4}}>{l}</div>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:800,color:"#fff"}}>{v}</div>
            </div>
          ))}
        </div>
      </div>
      <Card><SectionHead title="Receita e Volume Mensal"/>
        <div className="table-wrap"><ResponsiveContainer width="100%" height={260}><ComposedChart data={meses}>
          <defs><linearGradient id="gA" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={T.primary} stopOpacity={.18}/><stop offset="95%" stopColor={T.primary} stopOpacity={0}/></linearGradient></defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f8"/>
          <XAxis dataKey="mes" tick={{fontSize:12}}/><YAxis yAxisId="l" tick={{fontSize:12}} tickFormatter={v=>`R$${(v/1000).toFixed(0)}k`}/><YAxis yAxisId="r" orientation="right" tick={{fontSize:12}}/>
          <Tooltip content={<ChartTip money/>}/><Legend/>
          <Area yAxisId="l" type="monotone" dataKey="receita" fill="url(#gA)" stroke={T.primary} strokeWidth={2.5} name="Receita (R$)"/>
          <Bar yAxisId="r" dataKey="total_pedidos" fill="#f97316" opacity={.75} name="Pedidos" radius={[4,4,0,0]}/>
        </ComposedChart></ResponsiveContainer></div>
      </Card>
      <Card><SectionHead title="Receita Acumulada"/>
        <div className="table-wrap"><ResponsiveContainer width="100%" height={200}><AreaChart data={acumulado}>
          <defs><linearGradient id="gAcum" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={.2}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient></defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f8"/>
          <XAxis dataKey="mes" tick={{fontSize:11}}/><YAxis tick={{fontSize:11}} tickFormatter={v=>`R$${(v/1000).toFixed(0)}k`}/>
          <Tooltip content={<ChartTip money/>}/>
          <Area type="monotone" dataKey="recAcum" stroke="#10b981" strokeWidth={2.5} fill="url(#gAcum)" name="Acumulado"/>
        </AreaChart></ResponsiveContainer></div>
      </Card>
      <Card style={{padding:0}}>
        <div style={{padding:"16px 24px",borderBottom:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:15}}>Detalhamento Mensal</span><Badge label={`${meses.length} meses`} bg="#f0f4ff" fg={T.info}/></div>
        <div className="table-wrap"><table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead><tr style={{borderBottom:`1px solid ${T.border}`,background:"#fafbff"}}>{["Mês","Pedidos","Receita","Ticket Médio"].map(h=><th key={h} style={{padding:"11px 16px",textAlign:"left",fontSize:11,fontWeight:700,color:T.muted,textTransform:"uppercase",letterSpacing:.4,whiteSpace:"nowrap"}}>{h}</th>)}</tr></thead>
          <tbody>{meses.map((m,i)=>(<tr key={i} style={{borderBottom:"1px solid #f5f5f8"}}>
            <td style={{padding:"11px 16px",fontWeight:700}}>{m.mes}</td>
            <td style={{padding:"11px 16px"}}>{m.total_pedidos??m.pedidos}</td>
            <td style={{padding:"11px 16px",fontWeight:700,color:T.success}}>{brl(m.receita)}</td>
            <td style={{padding:"11px 16px"}}>{brl(Number(m.receita)/Number(m.total_pedidos??m.pedidos||1))}</td>
          </tr>))}</tbody>
        </table></div>
      </Card>
    </div>
  );
}
