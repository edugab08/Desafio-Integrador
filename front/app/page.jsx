"use client";
import{useState,useEffect}from"react";
import{AreaChart,Area,BarChart,Bar,PieChart,Pie,Cell,XAxis,YAxis,CartesianGrid,Tooltip,Legend,ResponsiveContainer}from"recharts";
import{Card,SectionHead,StatCard,ChartTip}from"../components/ui";
import{SkeletonKpi,ErrorBanner,SkeletonStyles}from"../components/ui/Skeleton";
import{dashboardApi}from"../lib/api";
import{VENDAS_MENSAIS,CATEGORIAS,VENDAS_ESTADO,COLORS}from"../lib/data";
import{brl}from"../lib/utils";
import{T}from"../lib/tokens";
export default function DashboardPage(){
  const[dados,setDados]=useState(null);
  const[loading,setLoading]=useState(true);
  const[erro,setErro]=useState(null);
  const reload=()=>{setLoading(true);dashboardApi.tudo().then(d=>{setDados(d);setErro(null);}).catch(e=>setErro(e.message)).finally(()=>setLoading(false));};
  useEffect(()=>{reload();},[]);
  const kpis=dados?.kpis??{totalReceita:0,totalPedidos:0,totalClientes:0,totalProdutos:0};
  const vm=dados?.vendasMensais?.length?dados.vendasMensais:VENDAS_MENSAIS;
  const ve=dados?.vendasEstado?.length?dados.vendasEstado:VENDAS_ESTADO;
  const cat=dados?.categorias?.length?dados.categorias:CATEGORIAS;
  return(
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <SkeletonStyles/>
      {erro&&<ErrorBanner msg={erro} onRetry={reload}/>}
      <div className="grid-4">
        {loading?[1,2,3,4].map(i=><SkeletonKpi key={i}/>):<>
          <StatCard icon="💰" label="Receita Total"    value={brl(kpis.totalReceita)}  trend={12.4} color={T.primary}/>
          <StatCard icon="🛒" label="Total de Pedidos" value={kpis.totalPedidos}        trend={8.1}  color="#f97316"/>
          <StatCard icon="👥" label="Clientes"         value={kpis.totalClientes}       trend={5.3}  color="#8b5cf6"/>
          <StatCard icon="📦" label="Produtos"         value={kpis.totalProdutos}       trend={-2.1} color="#06b6d4"/>
        </>}
      </div>
      <Card><SectionHead title="Receita Mensal" sub="Evolução financeira do ano"/>
        <ResponsiveContainer width="100%" height={260}><AreaChart data={vm}>
          <defs><linearGradient id="gR" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={T.primary} stopOpacity={.18}/><stop offset="95%" stopColor={T.primary} stopOpacity={0}/></linearGradient></defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f5"/>
          <XAxis dataKey="mes" tick={{fontSize:12}}/><YAxis tick={{fontSize:12}} tickFormatter={v=>`R$${(v/1000).toFixed(0)}k`}/>
          <Tooltip content={<ChartTip money/>}/>
          <Area type="monotone" dataKey="receita" stroke={T.primary} strokeWidth={2.5} fill="url(#gR)" name="Receita"/>
        </AreaChart></ResponsiveContainer>
      </Card>
      <div className="grid-2-1">
        <Card><SectionHead title="Vendas por Mês"/>
          <ResponsiveContainer width="100%" height={220}><BarChart data={vm}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f5"/>
            <XAxis dataKey="mes" tick={{fontSize:12}}/><YAxis tick={{fontSize:12}}/>
            <Tooltip content={<ChartTip/>}/><Bar dataKey="pedidos" fill="#f97316" name="Pedidos" radius={[6,6,0,0]}/>
          </BarChart></ResponsiveContainer>
        </Card>
        <Card><SectionHead title="Categorias"/>
          <ResponsiveContainer width="100%" height={220}><PieChart>
            <Pie data={cat} cx="50%" cy="50%" innerRadius={52} outerRadius={82} paddingAngle={4} dataKey="value">
              {cat.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
            </Pie><Tooltip/><Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize:12}}/>
          </PieChart></ResponsiveContainer>
        </Card>
      </div>
      <Card><SectionHead title="Vendas por Estado"/>
        <div className="table-wrap"><ResponsiveContainer width="100%" height={200}><BarChart data={ve}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f5"/>
          <XAxis dataKey="estado" tick={{fontSize:13,fontWeight:700}}/><YAxis tick={{fontSize:12}}/>
          <Tooltip content={<ChartTip/>}/><Bar dataKey="v" name="Pedidos" radius={[6,6,0,0]}>
            {ve.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
          </Bar>
        </BarChart></ResponsiveContainer></div>
      </Card>
    </div>
  );
}
