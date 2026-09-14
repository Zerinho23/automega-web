"use client";

import { LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient, hasSupabaseConfig } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError("");
    const form = new FormData(event.currentTarget); const email = String(form.get("email")); const password = String(form.get("password"));
    try {
      if (hasSupabaseConfig) {
        const supabase = createClient(); const { error } = await supabase!.auth.signInWithPassword({ email, password }); if (error) throw error;
      } else {
        const response = await fetch("/api/auth/demo", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) }); if (!response.ok) throw new Error("Credenciales incorrectas");
      }
      router.replace("/admin"); router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No fue posible iniciar sesión"); setLoading(false); }
  }
  return <main className="login-page"><section className="login-side"><div className="login-brand"><span className="admin-mark"><i /></span><div><strong>AUTOMEGA</strong><small>SEGURIDAD Y CONTROL VIAL</small></div></div><div><ShieldCheck /><h1>Control total del sitio</h1><p>Administra servicios, proyectos, imágenes, cotizaciones y contenido desde un solo lugar.</p></div></section><section className="login-panel"><form onSubmit={login}><span className="login-icon"><LockKeyhole /></span><h2>Bienvenido</h2><p>Ingresa tus credenciales para acceder al panel.</p><label>Correo electrónico<div><Mail /><input name="email" type="email" required defaultValue="admin@automega.cl" /></div></label><label>Contraseña<div><LockKeyhole /><input name="password" type="password" required /></div></label>{error && <p className="login-error">{error}</p>}<button className="button button-yellow" disabled={loading}>{loading ? "Ingresando…" : "Iniciar sesión"}</button><small className="demo-note">Las credenciales se validan de forma segura en el servidor.</small></form></section></main>;
}
