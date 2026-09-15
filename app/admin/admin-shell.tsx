"use client";

import { Bell, ExternalLink, FileText, FolderKanban, Gauge, Home, Image, LogOut, Mail, Menu, Settings, Shield, TrafficCone, Users, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const links = [
  ["/admin", "Resumen", Gauge], ["/admin/home", "Página principal", Home], ["/admin/services", "Servicios", TrafficCone],
  ["/admin/projects", "Proyectos", FolderKanban], ["/admin/images", "Imágenes", Image], ["/admin/quotes", "Cotizaciones", FileText],
  ["/admin/contact", "Datos de contacto", Users], ["/admin/settings", "Configuración", Settings],
] as const;

function AdminLogo() {
  return <Link href="/admin" className="admin-brand"><span className="admin-mark"><i /></span><span><strong>AUTOMEGA <em>SpA</em></strong><small>SEGURIDAD Y CONTROL VIAL</small></span></Link>;
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  if (path === "/admin/login") return <>{children}</>;

  async function signOut() {
    const supabase = createClient();
    if (supabase) await supabase.auth.signOut(); else await fetch("/api/auth/demo", { method: "DELETE" });
    router.replace("/admin/login"); router.refresh();
  }

  return (
    <div className="admin-layout">
      <aside className={`admin-sidebar ${open ? "open" : ""}`}>
        <div className="admin-sidebar-head"><AdminLogo /><button onClick={() => setOpen(false)} aria-label="Cerrar menú"><X /></button></div>
        <nav>{links.map(([href, label, Icon]) => <Link key={href} href={href} className={path === href ? "active" : ""} onClick={() => setOpen(false)}><Icon />{label}</Link>)}</nav>
        <button className="logout" onClick={signOut}><LogOut /> Cerrar sesión</button>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar"><button className="admin-menu" onClick={() => setOpen(true)}><Menu /></button><div className="admin-topbar-title"><strong>Panel administrativo</strong><small>AUTOMEGA SpA</small></div><div><small className="admin-environment"><b /> Producción</small><a href="/" target="_blank" className="admin-view-site"><ExternalLink /> Ver sitio web</a><Bell /><span /> <i>AM</i><b>Administrador</b></div></header>
        <div className="admin-content">{children}</div>
      </div>
    </div>
  );
}
