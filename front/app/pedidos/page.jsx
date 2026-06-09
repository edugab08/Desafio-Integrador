"use client";
import{useState,useEffect,useCallback}from"react";
import{Card,Btn,Badge,Input,Select,Modal,ConfirmModal,SearchBar,Empty,Toast}from"../../components/ui";
import{SkeletonTable,ErrorBanner,SkeletonStyles}from"../../components/ui/Skeleton";
import{pedidosApi,clientesApi,produtosApi}from"../../lib/api";
import{PEDIDOS_MOCK}from"../../lib/data";
import{T}from"../../lib/tokens";
import{uid,brl,statusColor}from"../../lib/utils";
export default function PedidosPage(){
  const[pedidos,setPedidos]=useState([]);
  const[clientes,setClientes]=useState([]);
  const[produtos,setProdutos]=useState([]);
  const[loading,setLoading]=useState(true);
  const[apiError,setApiError]=useState(null);
  const[search,setSearch]=useState("");
  const[modal,setModal]=useState(false);
  const[del,setDel]=useState(null);
  const[detail,setDetail]=useState(null);
  const[form,setForm]=useState({clienteId:"",itens:[{produtoId:"",quantidade:1}],status:"Pendente",data:new Date().toISOString().split("T")[0]});
  const[errs,setErrs]=useState({});
  const[toasts,setToasts]=useState([]);
  const toast=(msg,type="info")=>{const id=uid();setToasts(ts=>[...ts,{id,msg,type}]);setTimeout(()=>setToasts(ts=>ts.filter(t=>t.id!==id)),3200);};
  const carregar=useCallback(async()=>{setLoading(true);try{const[p,c,pr]=await Promise.all([pedidosApi.list(),clientesApi.list(),produtosApi.list()]);setPedidos(p);setClientes(c);setProdutos(pr);setApiError(null);}catch(e){setApiError(e.message);setPedidos(PEDIDOS_MOCK);}finally{setLoading(false);};},[]);
  useEffect(()=>{carregar();},[carregar]);
  const validate=()=>{const e={};if(!form.clienteId)e.clienteId="Selecione um cliente";if(!form.itens[0]?.produtoId)e.produtoId="Selecione um produto";setErrs(e);return!Object.keys(e).length;};
  const save=async()=>{if(!validate())return;try{const n=await pedidosApi.create({clienteId:Number(form.clienteId),itens:form.itens.filter(i=>i.produtoId).map(i=>({produtoId:Number(i.produtoId),quantidade:Number(i.quantidade)})),status:form.status,data:form.data});setPedidos(ps=>[n,...ps]);toast("Pedido criado!","success");setModal(false);setForm({clienteId:"",itens:[{produtoId:"",quantidade:1}],status:"Pendente",data:new Date().toISOString().split("T")[0]});}catch(e){toast(e.message,"error");}};
  const remove=async()=>{try{await pedidosApi.remove(del.id);setPedidos(ps=>ps.filter(p=>p.id!==del.id));toast("Removido.","error");}catch(e){toast(e.message,"error");}finally{setDel(null);}};
  const updateStatus=async(id,status)=>{try{await pedidosApi.updateStatus(id,status);setPedidos(ps=>ps.map(p=>p.id===id?{...p,status}:p));}catch(e){toast(e.message,"error");}};
  const totalForm=form.itens.reduce((s,i)=>{const p=produtos.find(p=>p.id===Number(i.produtoId));return s+(p?p.preco*Number(i.quantidade):0);},0);
  const filtered=pedidos.filter(p=>(p.cliente?.nome??p.clienteNome??"").toLowerCase().includes(search.toLowerCase())||String(p.id).includes(search));
  return(<div style={{display:"flex",flexDirection:"column",gap:20}}>
    <SkeletonStyles/>
    <div style={{display:"flex",gap:16,alignItems:"center",flexWrap:"wrap"}}><SearchBar value={search} onChange={setSearch} placeholder="Buscar pedido..."/><Btn onClick={()=>setModal(true)}>+ Novo Pedido</Btn></div>
    {apiError&&<ErrorBanner msg={apiError} onRetry={carregar}/>}
    <div className="grid-3">
      {["Concluído","Pendente","Cancelado"].map(s=>{const sc=statusColor(s);return(<div key={s} style={{background:sc.bg,borderRadius:12,padding:"16px 20px"}}><div style={{fontWeight:800,fontSize:22,color:sc.fg}}>{loading?"—":pedidos.filter(p=>p.status===s).length}</div><div style={{fontSize:13,fontWeight:600,color:sc.fg,marginTop:2}}>{s}</div></div>);})}
    </div>
    <Card style={{padding:0}}>
      <div style={{padding:"16px 24px",borderBottom:`1px solid ${T.border}`}}><span style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:15}}>Pedidos</span></div>
      {loading?<SkeletonTable rows={5} cols={7}/>:filtered.length===0?<Empty icon="🛒" msg="Nenhum pedido"/>:(
        <div className="table-wrap"><table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead><tr style={{borderBottom:`1px solid ${T.border}`,background:"#fafbff"}}>{["#","Cliente","Itens","Total","Data","Status","Ações"].map(h=><th key={h} style={{padding:"12px 16px",textAlign:"left",fontSize:11,fontWeight:700,color:T.muted,textTransform:"uppercase",letterSpacing:.5,whiteSpace:"nowrap"}}>{h}</th>)}</tr></thead>
          <tbody>{filtered.map(p=>{const sc=statusColor(p.status);const cli=p.cliente?.nome??p.clienteNome??"-";const its=(p.itens??p.produtos??[]).map(i=>i.produto?.nome??i.nome??"").join(", ");return(<tr key={p.id} style={{borderBottom:"1px solid #f5f5f8"}}>
            <td style={{padding:"12px 16px",fontWeight:700,color:T.primary}}>#{p.id}</td>
            <td style={{padding:"12px 16px",fontWeight:600}}>{cli}</td>
            <td style={{padding:"12px 16px",color:T.muted,maxWidth:160,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{its}</td>
            <td style={{padding:"12px 16px",fontWeight:700,color:T.success,whiteSpace:"nowrap"}}>{brl(p.total)}</td>
            <td style={{padding:"12px 16px",color:T.muted,whiteSpace:"nowrap"}}>{new Date(p.data+"T00:00:00").toLocaleDateString("pt-BR")}</td>
            <td style={{padding:"12px 16px"}}><select value={p.status} onChange={e=>updateStatus(p.id,e.target.value)} style={{padding:"4px 10px",borderRadius:20,border:"none",background:sc.bg,color:sc.fg,fontWeight:700,fontSize:12,cursor:"pointer"}}>{["Pendente","Concluido","Cancelado"].map(s=><option key={s}>{s}</option>)}</select></td>
            <td style={{padding:"12px 16px"}}><div style={{display:"flex",gap:6}}><Btn small variant="secondary" onClick={()=>setDetail(p)}>👁️</Btn><Btn small variant="danger" onClick={()=>setDel(p)}>🗑️</Btn></div></td>
          </tr>);})}</tbody>
        </table></div>)}
    </Card>
    <Modal open={modal} onClose={()=>setModal(false)} title="Novo Pedido">
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <Select label="Cliente" value={form.clienteId} onChange={e=>setForm(f=>({...f,clienteId:e.target.value}))} error={errs.clienteId}><option value="">Selecione...</option>{clientes.map(c=><option key={c.id} value={c.id}>{c.nome}</option>)}</Select>
        {form.itens.map((item,idx)=>(<div key={idx} style={{display:"grid",gridTemplateColumns:"3fr 1fr",gap:12}}>
          <Select label={idx===0?"Produto":""} value={item.produtoId} onChange={e=>setForm(f=>({...f,itens:f.itens.map((it,i)=>i===idx?{...it,produtoId:e.target.value}:it)}))} error={idx===0?errs.produtoId:undefined}><option value="">Selecione...</option>{produtos.map(p=><option key={p.id} value={p.id}>{p.nome} — {brl(p.preco)}</option>)}</Select>
          <Input label={idx===0?"Qtd":""} type="number" min="1" value={item.quantidade} onChange={e=>setForm(f=>({...f,itens:f.itens.map((it,i)=>i===idx?{...it,quantidade:e.target.value}:it)}))}/>
        </div>))}
        <button onClick={()=>setForm(f=>({...f,itens:[...f.itens,{produtoId:"",quantidade:1}]}))} style={{background:"none",border:`1px dashed ${T.border}`,borderRadius:8,padding:"8px",cursor:"pointer",fontSize:12,color:T.muted,fontWeight:600}}>+ Adicionar produto</button>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          <Input label="Data" type="date" value={form.data} onChange={e=>setForm(f=>({...f,data:e.target.value}))}/>
          <Select label="Status" value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}>{["Pendente","Concluido","Cancelado"].map(s=><option key={s}>{s}</option>)}</Select>
        </div>
        {totalForm>0&&<div style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:10,padding:"12px 16px",fontSize:14}}>Total: <strong style={{color:T.success}}>{brl(totalForm)}</strong></div>}
      </div>
      <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:24}}><Btn variant="ghost" onClick={()=>setModal(false)}>Cancelar</Btn><Btn onClick={save}>➕ Criar Pedido</Btn></div>
    </Modal>
    <Modal open={!!detail} onClose={()=>setDetail(null)} title={`Pedido #${detail?.id}`}>
      {detail&&(<div style={{display:"flex",flexDirection:"column",gap:16}}>
        {[["Cliente",detail.cliente?.nome??detail.clienteNome],["Data",new Date(detail.data+"T00:00:00").toLocaleDateString("pt-BR")],["Total",brl(detail.total)],["Status",detail.status]].map(([k,v])=>(<div key={k} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:`1px solid ${T.border}`}}><span style={{color:T.muted,fontWeight:600,fontSize:13}}>{k}</span><span style={{fontWeight:700}}>{v}</span></div>))}
        <div>{(detail.itens??detail.produtos??[]).map((x,i)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",background:T.bg,borderRadius:10,padding:"10px 14px",marginBottom:8}}><span style={{fontWeight:600}}>{x.produto?.nome??x.nome}</span><span style={{color:T.muted}}>x{x.quantidade??x.qtd}</span></div>))}</div>
      </div>)}
    </Modal>
    <ConfirmModal open={!!del} onClose={()=>setDel(null)} onConfirm={remove} name={`Pedido #${del?.id}`}/>
    <Toast toasts={toasts}/>
  </div>);
}
