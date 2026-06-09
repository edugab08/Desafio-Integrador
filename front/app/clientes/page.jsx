"use client";
import{useState,useEffect,useCallback}from"react";
import{Card,Btn,Badge,Input,Select,Modal,ConfirmModal,SearchBar,Empty,Toast}from"../../components/ui";
import{SkeletonTable,ErrorBanner,SkeletonStyles}from"../../components/ui/Skeleton";
import{clientesApi}from"../../lib/api";
import{CLIENTES_MOCK,ESTADOS_BR}from"../../lib/data";
import{T}from"../../lib/tokens";
import{uid}from"../../lib/utils";
const VAZIO={nome:"",email:"",cidade:"",estado:"",pais:"Brasil"};
export default function ClientesPage(){
  const[clientes,setClientes]=useState([]);
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
  const carregar=useCallback(async(q="")=>{setLoading(true);try{setClientes(await clientesApi.list(q));setApiError(null);}catch(e){setApiError(e.message);setClientes(CLIENTES_MOCK);}finally{setLoading(false);};},[]);
  useEffect(()=>{carregar();},[carregar]);
  useEffect(()=>{const t=setTimeout(()=>carregar(search),500);return()=>clearTimeout(t);},[search,carregar]);
  const open=(c=null)=>{setEditing(c);setForm(c?{...c}:VAZIO);setErrs({});setModal(true);};
  const validate=()=>{const e={};if(!form.nome.trim())e.nome="Nome obrigatório";if(!form.email.trim())e.email="E-mail obrigatório";else if(!/\S+@\S+\.\S+/.test(form.email))e.email="E-mail inválido";if(!form.cidade.trim())e.cidade="Cidade obrigatória";if(!form.estado)e.estado="Estado obrigatório";setErrs(e);return!Object.keys(e).length;};
  const save=async()=>{if(!validate())return;try{if(editing){setClientes(cs=>cs.map(c=>c.id===editing.id?{...c,...form}:c));await clientesApi.update(editing.id,form);toast("Cliente atualizado!","success");}else{const n=await clientesApi.create(form);setClientes(cs=>[...cs,n]);toast("Cliente cadastrado!","success");}setModal(false);}catch(e){toast(e.message,"error");}};
  const remove=async()=>{try{await clientesApi.remove(del.id);setClientes(cs=>cs.filter(c=>c.id!==del.id));toast("Removido.","error");}catch(e){toast(e.message,"error");}finally{setDel(null);}};
  return(<div style={{display:"flex",flexDirection:"column",gap:20}}>
    <SkeletonStyles/>
    <div style={{display:"flex",gap:16,alignItems:"center",flexWrap:"wrap"}}><SearchBar value={search} onChange={setSearch} placeholder="Buscar cliente..."/><Btn onClick={()=>open()}>+ Novo Cliente</Btn></div>
    {apiError&&<ErrorBanner msg={apiError} onRetry={()=>carregar(search)}/>}
    <Card style={{padding:0}}>
      <div style={{padding:"16px 24px",borderBottom:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:15}}>Clientes</span><Badge label={loading?"...":clientes.length} bg="#f0f4ff" fg={T.info}/></div>
      {loading?<SkeletonTable rows={5} cols={7}/>:clientes.length===0?<Empty icon="👥" msg="Nenhum cliente"/>:(
        <div className="table-wrap"><table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead><tr style={{borderBottom:`1px solid ${T.border}`,background:"#fafbff"}}>{["ID","Nome","E-mail","Cidade","Estado","País","Ações"].map(h=><th key={h} style={{padding:"12px 16px",textAlign:"left",fontSize:11,fontWeight:700,color:T.muted,textTransform:"uppercase",letterSpacing:.5,whiteSpace:"nowrap"}}>{h}</th>)}</tr></thead>
          <tbody>{clientes.map(c=>(<tr key={c.id} style={{borderBottom:"1px solid #f5f5f8"}}>
            <td style={{padding:"12px 16px",color:T.muted,fontWeight:600}}>#{c.id}</td>
            <td style={{padding:"12px 16px"}}><div style={{display:"flex",alignItems:"center",gap:10}}><div style={{width:30,height:30,borderRadius:8,background:`linear-gradient(135deg,${T.primary},#f97316)`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:12,flexShrink:0}}>{c.nome[0]}</div><span style={{fontWeight:600}}>{c.nome}</span></div></td>
            <td style={{padding:"12px 16px",color:T.muted}}>{c.email}</td>
            <td style={{padding:"12px 16px"}}>{c.cidade}</td>
            <td style={{padding:"12px 16px"}}><Badge label={c.estado} bg="#f0f4ff" fg={T.info}/></td>
            <td style={{padding:"12px 16px",color:T.muted}}>{c.pais}</td>
            <td style={{padding:"12px 16px"}}><div style={{display:"flex",gap:6}}><Btn small variant="secondary" onClick={()=>open(c)}>✏️</Btn><Btn small variant="danger" onClick={()=>setDel(c)}>🗑️</Btn></div></td>
          </tr>))}</tbody>
        </table></div>)}
    </Card>
    <Modal open={modal} onClose={()=>setModal(false)} title={editing?"Editar Cliente":"Novo Cliente"}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <div style={{gridColumn:"1/-1"}}><Input label="Nome" value={form.nome} onChange={e=>setForm(f=>({...f,nome:e.target.value}))} error={errs.nome} placeholder="Ex: Tech Solutions Ltda"/></div>
        <div style={{gridColumn:"1/-1"}}><Input label="E-mail" type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} error={errs.email} placeholder="Ex: contato@empresa.com"/></div>
        <Input label="Cidade" value={form.cidade} onChange={e=>setForm(f=>({...f,cidade:e.target.value}))} error={errs.cidade}/>
        <Select label="Estado" value={form.estado} onChange={e=>setForm(f=>({...f,estado:e.target.value}))} error={errs.estado}><option value="">Selecione...</option>{ESTADOS_BR.map(u=><option key={u}>{u}</option>)}</Select>
        <div style={{gridColumn:"1/-1"}}><Input label="País" value={form.pais} onChange={e=>setForm(f=>({...f,pais:e.target.value}))}/></div>
      </div>
      <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:24}}><Btn variant="ghost" onClick={()=>setModal(false)}>Cancelar</Btn><Btn onClick={save}>{editing?"💾 Salvar":"➕ Cadastrar"}</Btn></div>
    </Modal>
    <ConfirmModal open={!!del} onClose={()=>setDel(null)} onConfirm={remove} name={del?.nome}/>
    <Toast toasts={toasts}/>
  </div>);
}
