"use client";
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header  from "../components/Header";
import "./globals.css";

export default function RootLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <html lang="pt-BR">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
      </head>
      <body>
        <div className="app-shell">
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)}/>
          <div className="app-content">
            <Header onMenuClick={() => setSidebarOpen(o => !o)}/>
            <main className="app-main">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
