export const brl = n => Number(n).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
export const uid = () => Date.now() + Math.floor(Math.random()*1000);
export const churnColor = v => {
  if (v < 30) return { bg:"#d1fae5", fg:"#065f46", label:"Ativo" };
  if (v < 60) return { bg:"#fef3c7", fg:"#92400e", label:"Risco Médio" };
  return             { bg:"#fee2e2", fg:"#991b1b", label:"Alto Risco" };
};
// Status padronizado sem acento — igual ao enum do backend (StatusPedido)
export const statusColor = s => ({
  "Concluido": { bg:"#d1fae5", fg:"#065f46" },
  "Concluído": { bg:"#d1fae5", fg:"#065f46" },  // compatibilidade
  "Pendente":  { bg:"#fef3c7", fg:"#92400e" },
  "Cancelado": { bg:"#fee2e2", fg:"#991b1b" },
}[s] || { bg:"#f3f4f6", fg:"#374151" });
