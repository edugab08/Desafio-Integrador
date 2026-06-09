const BASE    = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";
const ML_BASE = process.env.NEXT_PUBLIC_ML_URL  ?? "http://localhost:8000";
async function req(url, opts={}) {
  const res = await fetch(url,{headers:{"Content-Type":"application/json",...opts.headers},...opts});
  if(!res.ok){const b=await res.json().catch(()=>({}));throw new Error(b.message??`Erro ${res.status}`);}
  if(res.status===204)return null;
  return res.json();
}
const api    = (p,o) => req(`${BASE}${p}`,o);
const ml     = (p,o) => req(`${ML_BASE}${p}`,o);
const post   = (p,d) => api(p,{method:"POST",body:JSON.stringify(d)});
const put    = (p,d) => api(p,{method:"PUT", body:JSON.stringify(d)});
const patch  = (p,d) => api(p,{method:"PATCH",body:JSON.stringify(d)});
const del    = p     => api(p,{method:"DELETE"});
const mlPost = (p,d) => ml(p,{method:"POST",body:JSON.stringify(d)});
export const dashboardApi  = { tudo:()=>api("/dashboard") };
export const clientesApi   = { list:(s="")=>api(`/clientes${s?`?search=${encodeURIComponent(s)}`:""}`) , get:id=>api(`/clientes/${id}`), create:d=>post("/clientes",d), update:(id,d)=>put(`/clientes/${id}`,d), remove:id=>del(`/clientes/${id}`) };
export const produtosApi   = { list:(s="")=>api(`/produtos${s?`?search=${encodeURIComponent(s)}`:""}`) , get:id=>api(`/produtos/${id}`), create:d=>post("/produtos",d), update:(id,d)=>put(`/produtos/${id}`,d), remove:id=>del(`/produtos/${id}`), estoqueCritico:(l=20)=>api(`/produtos/estoque-critico?limiar=${l}`) };
export const pedidosApi    = { list:cid=>api(`/pedidos${cid?`?clienteId=${cid}`:""}`)                   , get:id=>api(`/pedidos/${id}`), create:d=>post("/pedidos",d), updateStatus:(id,s)=>patch(`/pedidos/${id}/status`,{status:s}), remove:id=>del(`/pedidos/${id}`) };
export const relatoriosApi = { vendas:()=>api("/relatorios/vendas"), produtosClientes:()=>api("/relatorios/produtos-clientes"), churn:()=>api("/relatorios/churn"), scoring:()=>api("/relatorios/scoring") };
export const mlServiceApi  = { info:()=>ml("/model/info"), train:()=>mlPost("/model/train",{}), churn:c=>mlPost("/predict/churn",{clientes:c}), scoring:c=>mlPost("/predict/scoring",{clientes:c}) };
