"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { T } from "../lib/tokens";

const NAV = [
  { href:"/",           icon:"📊", label:"Dashboard"  },
  { href:"/clientes",   icon:"👥", label:"Clientes"   },
  { href:"/produtos",   icon:"📦", label:"Produtos"   },
  { href:"/pedidos",    icon:"🛒", label:"Pedidos"    },
  { href:"/relatorios", icon:"📋", label:"Relatórios" },
  { href:"/ia",         icon:"🤖", label:"IA & Churn" },
];

export default function Sidebar({ open, onClose }) {
  const pathname = usePathname();
  return (
    <>
      {/* Overlay — clica fora fecha no mobile */}
      {open && <div className="sidebar-overlay" onClick={onClose}/>}

      <aside className={`sidebar ${open ? "open" : ""}`} style={{
        background: T.dark, color: "#fff",
        display: "flex", flexDirection: "column",
        height: "100vh", boxShadow: "4px 0 32px rgba(0,0,0,.2)",
      }}>
        {/* Logo */}
        <div style={{
          padding: "22px 18px",
          borderBottom: "1px solid rgba(255,255,255,.07)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: `linear-gradient(135deg,${T.primary},#f97316)`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17,
            }}>📈</div>
            <div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 15 }}>DataSight</div>
              <div style={{ fontSize: 9, color: "#475569", letterSpacing: 1.5, textTransform: "uppercase" }}>Analytics</div>
            </div>
          </div>

          {/* Botão X — só visível no mobile via CSS */}
          <button
            onClick={onClose}
            className="sidebar-close-btn"
            style={{
              background: "rgba(255,255,255,.1)", border: "none",
              color: "#94a3b8", cursor: "pointer",
              width: 28, height: 28, borderRadius: 6, fontSize: 13,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >✕</button>
        </div>

        {/* Nav */}
        <nav style={{
          flex: 1, padding: "14px 10px",
          display: "flex", flexDirection: "column",
          gap: 2, overflowY: "auto",
        }}>
          {NAV.map(n => {
            const active = n.href === "/" ? pathname === "/" : pathname.startsWith(n.href);
            return (
              <Link key={n.href} href={n.href} onClick={onClose} style={{ textDecoration: "none" }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "11px 14px", borderRadius: 10,
                  cursor: "pointer", transition: "all .15s",
                  background: active ? `${T.primary}22` : "transparent",
                  color: active ? "#f43f8e" : "#64748b",
                  fontWeight: active ? 700 : 400, fontSize: 14,
                  borderLeft: active ? `3px solid ${T.primary}` : "3px solid transparent",
                }}>
                  <span style={{ fontSize: 17 }}>{n.icon}</span>
                  <span style={{ fontFamily: "'Outfit',sans-serif" }}>{n.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
