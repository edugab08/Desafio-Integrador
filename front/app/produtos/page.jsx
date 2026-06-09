"use client";
import{useState,useEffect,useCallback}from"react";
import{Card,Btn,Badge,Input,Select,Modal,ConfirmModal,SearchBar,Empty,Toast}from"../../components/ui";
import{SkeletonTable,ErrorBanner,SkeletonStyles}from"../../components/ui/Skeleton";
import{produtosApi}from"../../lib/api";
import{PRODUTOS_MOCK,CATEGORIAS_PRODUTO}from"../../lib/data";
import{T}from"../../lib/tokens";
import{uid,brl}from"../../lib/utils";
const VAZIO={nome:"",preco:"",estoque:"",categoria:""};
export default function ProdutosPage(){
  const[produtos,setProdutos]=useState([]);
  const[loading,setLoading]=useState(true);
  const[apiError,setApiError]=useState(null);
  const[search,setSearch]=useState("");
  const[modal,setModal]=useState(false);
  const[editing,setEditing]=useState(null);
  const[del,setDel]=useState(null);
  const[form,setForm]=useState(VAZIO);
  const[errs,setErrs]=useState({});
  const[toasts,setToasts]=useState([]);
  const toast=(msg,type="info")=>{const id=uid();setToasts(ts=>[...ts,{id,msg,type}]);setTimeout(()=>setToasts(ts=>ts.filter(t=>t.id!==id)),3200);};
  const carregar=useCallback(async(q="")=>{setLoading(true);try{setProdutos(await produtosApi.list(q));setApiError(null);}catch(e){setApiError(e.message);setProdutos(PRODUTOS_MOCK);}finally{setLoading(false);};},[]);
  useEffect(()=>{carregar();},[carregar]);
  useEffect(()=>{const t=setTimeout(()=>carregar(search),500);return()=>clearTimeout(t);},[search,carregar]);
  const open=(p=null)=>{setEditing(p);setForm(p?{...p,preco:String(p.preco),estoque:String(p.estoque)}:VAZIO);setErrs({});setModal(true);};
  const validate=()=>{const e={};if(!form.nome.trim())e.nome="Nome obrigatório";if(!form.preco||isNaN(form.preco)||Number(form.preco)<=0)e.preco="Preço deve ser positivo";if(form.estoque===""||isNaN(form.estoque)||Number(form.estoque)<0)e.estoque="Estoque não pode ser negativo";setErrs(e);return!Object.keys(e).length;};
  const save=async()=>{if(!validate())return;const d={...form,preco:Number(form.preco),estoque:Number(form.estoque)};try{if(editing){const u=await produtosApi.update(editing.id,d);setProdutos(ps=>ps.map(p=>p.id===editing.id?u:p));toast("Produto atualizado!","success");}else{const n=await produtosApi.create(d);setProdutos(ps=>[...ps,n]);toast("Produto cadastrado!","success");}setModal(false);}catch(e){toast(e.message,"error");}};
  const remove=async()=>{try{await produtosApi.remove(del.id);setProdutos(ps=>ps.filter(p=>p.id!==del.id));toast("Removido.","error");}catch(e){toast(e.message,"error");}finally{setDel(null);}};
  return(<div style={{display:"flex",flexDirection:"column",gap:20}}>
    <SkeletonStyles/>
    <div style={{display:"flex",gap:16,alignItems:"center",flexWrap:"wrap"}}><SearchBar value={search} onChange={setSearch} placeholder="Buscar produto..."/><Btn onClick={()=>open()}>+ Novo Produto</Btn></div>
    {apiError&&<ErrorBanner msg={apiError} onRetry={()=>carregar(search)}/>}
    <Card style={{padding:0}}>
      <div style={{padding:"16px 24px",borderBottom:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:15}}>Catálogo</span><Badge label={loading?"...":produtos.length} bg="#f0fdf4" fg="#15803d"/></div>
      {loading?<SkeletonTable rows={5} cols={6}/>:produtos.length===0?<Empty icon="📦" msg="Nenhum produto"/>:(
        <div className="table-wrap"><table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead><tr style={{borderBottom:`1px solid ${T.border}`,background:"#fafbff"}}>{["ID","Produto","Preço","Estoque","Categoria","Ações"].map(h=><th key={h} style={{padding:"12px 16px",textAlign:"left",fontSize:11,fontWeight:700,color:T.muted,textTransform:"uppercase",letterSpacing:.5,whiteSpace:"nowrap"}}>{h}</th>)}</tr></thead>
          <tbody>{produtos.map(p=>(<tr key={p.id} style={{borderBottom:"1px solid #f5f5f8"}}>
            <td style={{padding:"12px 16px",color:T.muted,fontWeight:600}}>#{p.id}</td>
            <td style={{padding:"12px 16px",fontWeight:600}}>{p.nome}</td>
            <td style={{padding:"12px 16px",fontWeight:700,color:T.success}}>{brl(p.preco)}</td>
            <td style={{padding:"12px 16px"}}><Badge label={`${p.estoque} un.`} bg={p.estoque<10?"#fef2f2":p.estoque<20?"#fef9c3":"#f0fdf4"} fg={p.estoque<10?T.danger:p.estoque<20?T.warning:T.success}/></td>
            <td style={{padding:"12px 16px"}}>{p.categoria?<Badge label={p.categoria} bg="#f5f3ff" fg="#7c3aed"/>:<span style={{color:T.muted}}>—</span>}</td>
            <td style={{padding:"12px 16px"}}><div style={{display:"flex",gap:6}}><Btn small variant="secondary" onClick={()=>open(p)}>✏️</Btn><Btn small variant="danger" onClick={()=>setDel(p)}>🗑️</Btn></div></td>
          </tr>))}</tbody>
        </table></div>)}
    </Card>
    <Modal open={modal} onClose={()=>setModal(false)} title={editing?"Editar Produto":"Novo Produto"}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <div style={{gridColumn:"1/-1"}}><Input label="Nome" value={form.nome} onChange={e=>setForm(f=>({...f,nome:e.target.value}))} error={errs.nome} placeholder="Ex: Notebook Pro X"/></div>
        <Input label="Preço (R$)" type="number" value={form.preco} onChange={e=>setForm(f=>({...f,preco:e.target.value}))} error={errs.preco} min="0" step="0.01"/>
        <Input label="Estoque" type="number" value={form.estoque} onChange={e=>setForm(f=>({...f,estoque:e.target.value}))} error={errs.estoque} min="0"/>
        <div style={{gridColumn:"1/-1"}}><Select label="Categoria (opcional)" value={form.categoria} onChange={e=>setForm(f=>({...f,categoria:e.target.value}))}><option value="">Sem categoria</option>{CATEGORIAS_PRODUTO.map(c=><option key={c}>{c}</option>)}</Select></div>
      </div>
      <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:24}}><Btn variant="ghost" onClick={()=>setModal(false)}>Cancelar</Btn><Btn onClick={save}>{editing?"💾 Salvar":"➕ Cadastrar"}</Btn></div>
    </Modal>
    <ConfirmModal open={!!del} onClose={()=>setDel(null)} onConfirm={remove} name={del?.nome}/>
    <Toast toasts={toasts}/>
  </div>);
}
