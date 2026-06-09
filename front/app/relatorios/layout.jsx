"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { T } from "../../lib/tokens";

export default function RelatoriosLayout({ children }) {
  const pathname = usePathname();
  const isIndex  = pathname === "/relatorios";

  return (
    <div>
      {!isIndex && (
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
          <Link href="/relatorios" style={{ textDecoration:"none" }}>
            <button style={{ background:"#f3f4f6", border:"none", cursor:"pointer", padding:"8px 16px", borderRadius:8, fontSize:13, fontWeight:600, color:T.muted, display:"flex", alignItems:"center", gap:6 }}>
              ← Voltar aos Relatórios
            </button>
          </Link>
          <div style={{ display:"flex", gap:8 }}>
            <button style={{ padding:"8px 16px", borderRadius:8, border:`1px solid ${T.border}`, background:"#fff", cursor:"pointer", fontSize:12, fontWeight:700, color:T.muted }}>🖨️ Imprimir</button>
            <button style={{ padding:"8px 16px", borderRadius:8, border:"none", background:`linear-gradient(135deg,${T.primary},#f97316)`, cursor:"pointer", fontSize:12, fontWeight:700, color:"#fff" }}>⬇️ Exportar PDF</button>
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
