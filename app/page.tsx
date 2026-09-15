"use client";

import { ArrowRight, CalendarDays, CheckCircle2, ChevronRight, ClipboardList, Construction, HardHat, Mail, MapPin, Menu, MessageCircle, Phone, TrafficCone, Users, X, Zap } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import ProjectViewer from "@/components/project-viewer";

const defaultServices = [
  { icon: TrafficCone, title: "Conificación vial", text: "Instalación y retiro de conos, delineadores y elementos de canalización para obras y desvíos." },
  { icon: Construction, title: "Señalización vial temporal", text: "Implementación de señalética transitoria según normativa vigente." },
  { icon: HardHat, title: "Control temporal del tránsito", text: "Apoyo con bandereros y sistemas de control para mantener un flujo vehicular seguro." },
];

const defaultProjects = [
  { title: "Conificación vial", detail: "Obras urbanas", crop: "gallery-one", image_url: "", location: "" },
  { title: "Señalización temporal", detail: "Desvíos y cortes de tránsito", crop: "gallery-two", image_url: "", location: "" },
  { title: "Control del tránsito", detail: "Apoyo en faenas", crop: "gallery-three", image_url: "", location: "" },
];

function Logo({ inverse = false, logoUrl = "" }: { inverse?: boolean; logoUrl?: string }) {
  return (
    <a className={`brand ${inverse ? "brand-inverse" : ""}`} href="#inicio" aria-label="AUTOMEGA SpA, inicio">
      {logoUrl ? <img className="brand-logo-image" src={logoUrl} alt="" /> : <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>}
      <span><strong>AUTOMEGA <em>SpA</em></strong><small>SEGURIDAD Y CONTROL VIAL</small></span>
    </a>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("inicio");
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [formState, setFormState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [services, setServices] = useState(defaultServices);
  const [projects, setProjects] = useState(defaultProjects);
  const [site, setSite] = useState({ hero_title:"Seguridad y control en cada vía", hero_text:"Servicios de conificación y señalización vial temporal para obras, faenas y desvíos en Concepción y la Región del Biobío.", about_title:"Seguridad vial para cada trabajo", phone:"+56 9 6647 3375", whatsapp:"+56 9 6647 3375", email:"diego.mora@automegaspa.com", coverage:"Concepción y toda la Región del Biobío", hero_image:"", about_image:"", logo_url:"" });

  useEffect(() => {
    try { const cached = JSON.parse(localStorage.getItem("automega_site_settings") || "{}"); if (cached && typeof cached === "object") setSite(current => ({ ...current, ...cached })); } catch {}
    fetch("/api/site", { cache: "no-store" }).then(response => response.json()).then((payload: any) => { const { settings, services: remoteServices, projects: remoteProjects } = payload;
      if (settings) setSite(current => { const next = { ...current, ...settings }; try { localStorage.setItem("automega_site_settings", JSON.stringify(next)); } catch {} return next; });
      if (remoteServices?.length) setServices(remoteServices.map((item: { title:string; description:string }, index:number) => ({ icon:[TrafficCone,Construction,HardHat][index%3], title:item.title, text:item.description })));
      if (remoteProjects?.length) { let localImages: Record<string,string> = {}; try { localImages = JSON.parse(localStorage.getItem("automega_project_images") || "{}"); } catch {} setProjects(remoteProjects.map((item: { title:string; description:string; image_url?:string; location?:string }, index:number) => ({ title:item.title, detail:item.description, location:item.location || "", crop:["gallery-one","gallery-two","gallery-three"][index%3], image_url:item.image_url || localImages[`project-${index+1}`] || "" }))); }
    }).catch(() => undefined);
  }, []);

  useEffect(() => {
    const context = (document as Document & { modelContext?: { registerTool: (tool: unknown, options?: { signal?: AbortSignal }) => void | Promise<void> } }).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    void Promise.resolve(context.registerTool({
      name:"submit_quote_request", title:"Solicitar cotización AUTOMEGA SpA",
      description:"Envía una solicitud de cotización vial y la registra en el mismo sistema usado por el formulario visible.",
      inputSchema:{type:"object",properties:{name:{type:"string"},company:{type:"string"},phone:{type:"string"},email:{type:"string",format:"email"},city:{type:"string"},service:{type:"string"},message:{type:"string"}},required:["name","phone","email","city","service","message"],additionalProperties:false},
      annotations:{readOnlyHint:false,untrustedContentHint:true},
      async execute(input:unknown){const value=input as Record<string,unknown>;for(const key of ["name","phone","email","city","service","message"]){if(typeof value[key]!=="string"||!String(value[key]).trim())throw new Error(`El campo ${key} es obligatorio`);}const response=await fetch("/api/quotes",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(value)});if(!response.ok)throw new Error("No fue posible enviar la solicitud");setFormState("success");return {status:"received",message:"Solicitud registrada correctamente"};}
    },{signal:lifecycle.signal})).catch(()=>undefined);
    return () => lifecycle.abort();
  }, []);

  useEffect(() => {
    function trackSection() {
      const sections = ["nosotros","servicios","cobertura","proyectos","contacto"];
      const visible = sections.map(id => ({id,top:document.getElementById(id)?.getBoundingClientRect().top ?? Infinity})).filter(item=>item.top <= 160).sort((a,b)=>b.top-a.top);
      setActiveSection(visible[0]?.id || "inicio");
    }
    window.addEventListener("scroll", trackSection, {passive:true});
    trackSection();
    return ()=>window.removeEventListener("scroll",trackSection);
  }, []);

  async function submitQuote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormState("loading");
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const response = await fetch("/api/quotes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!response.ok) throw new Error("No fue posible enviar");
      setFormState("success");
      form.reset();
    } catch { setFormState("error"); }
  }

  return (
    <main>
      <header className="site-header" id="inicio">
        <Logo logoUrl={site.logo_url} />
        <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Abrir menú">{menuOpen ? <X /> : <Menu />}</button>
        <nav className={menuOpen ? "nav-open" : ""} aria-label="Navegación principal">
          {[["Inicio", "#inicio"], ["Nosotros", "#nosotros"], ["Servicios", "#servicios"], ["Cobertura", "#cobertura"], ["Proyectos", "#proyectos"], ["Contacto", "#contacto"]].map(([label, href]) => <a key={label} href={href} className={activeSection === href.slice(1) ? "active-section" : ""} aria-current={activeSection === href.slice(1) ? "location" : undefined} onClick={() => setMenuOpen(false)}>{label}</a>)}
        </nav>
        <a className="button button-yellow header-cta" href="#contacto">Solicitar cotización <ChevronRight size={18} /></a>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow light">Gestión de tránsito temporal</div>
          <h1>{site.hero_title.includes("en cada vía") ? <>Seguridad y control <span>en cada vía</span></> : site.hero_title}</h1>
          <p>{site.hero_text}</p>
          <div className="hero-actions"><a className="button button-yellow" href="#contacto">Solicitar cotización <ChevronRight size={20} /></a><a className="button button-outline" href="#servicios">Ver servicios <ChevronRight size={20} /></a></div>
        </div>
        <div className={`photo-crop hero-photo ${site.hero_image ? "custom-photo" : ""}`} role="img" aria-label="Operación de seguridad vial en una carretera de Concepción"><img src={site.hero_image || "/images/vial.png"} alt="" fetchPriority="high" decoding="async" /><div className="hero-photo-badge"><MapPin /><span><strong>Operación regional</strong><small>Concepción · Biobío</small></span></div></div>
      </section>

      <section className="feature-strip" aria-label="Ventajas">
        {[[Zap, "Respuesta rápida", "Atención ágil y soluciones oportunas."], [MapPin, "Cobertura regional", "Concepción y toda la Región del Biobío."], [Users, "Personal capacitado", "Equipos certificados y con experiencia."]].map(([Icon, title, text]) => <div className="feature" key={String(title)}><span><Icon size={26} /></span><div><strong>{String(title)}</strong><p>{String(text)}</p></div></div>)}
      </section>

      <section className="section" id="servicios">
        <div className="section-heading split-heading"><div><div className="eyebrow">Nuestros servicios</div><h2>Soluciones para trabajos viales seguros</h2></div><div className="location-pill"><MapPin size={16} /> Concepción · Región del Biobío</div></div>
        <div className="service-grid">{services.map(({ icon: Icon, title, text }) => <article className="service-card" key={title}><span className="icon-tile"><Icon /></span><div><h3>{title}</h3><p>{text}</p></div><ArrowRight className="card-arrow" /></article>)}</div>
      </section>

      <section className="section about-grid" id="nosotros">
        <div className="about-copy"><div className="eyebrow">Sobre AUTOMEGA SpA</div><h2>{site.about_title === "Seguridad vial para cada trabajo" ? <>Seguridad vial para <span>cada trabajo</span></> : site.about_title}</h2><p>En AUTOMEGA SpA entregamos servicios de conificación, señalización temporal y control del tránsito para obras, faenas y desvíos en Concepción y distintas ciudades de la Región del Biobío.</p><p>Contamos con equipos certificados y una operación orientada a la seguridad, para que cada proyecto se desarrolle de forma eficiente y segura.</p><a className="button button-yellow" href="#contacto">Conocer más sobre nosotros <ChevronRight size={18} /></a></div>
        <div className="photo-crop about-photo" role="img" aria-label="Conificación de una vía urbana"><img src={site.about_image || "/images/vial2.png"} alt="" loading="lazy" decoding="async" /></div>
      </section>

      <section className="section process-section">
        <div className="section-heading"><div className="eyebrow">Nuestro proceso</div><h2>Cómo trabajamos</h2></div>
        <div className="process-grid">{[[ClipboardList, "Evaluamos", "Analizamos las condiciones de la vía y los requerimientos."], [CalendarDays, "Planificamos", "Definimos la mejor solución de señalización y control."], [HardHat, "Implementamos", "Desplegamos los equipos y supervisamos la operación."]].map(([Icon, title, text], index) => <article className="process-card" key={String(title)}><b>{index + 1}</b><span className="process-icon"><Icon /></span><div><h3>{String(title)}</h3><p>{String(text)}</p></div><ChevronRight /></article>)}</div>
      </section>

      <section className="section" id="proyectos">
        <div className="section-heading split-heading"><div><div className="eyebrow">Nuestros proyectos</div><h2>Trabajos realizados</h2></div><span className="gallery-instruction">Selecciona un trabajo para ver sus detalles</span></div>
        <div className="project-grid">{projects.map((project, index) => <article className="project-card" key={project.title}><button type="button" className={`photo-crop project-photo gallery-open ${project.crop}`} aria-label={`Ver detalles de ${project.title}`} onClick={() => setSelectedProject(index)}><img src={project.image_url || `/images/${index === 0 ? "vial.png" : index === 1 ? "vial2.png" : "vial3.png"}`} alt={project.title} loading="lazy" decoding="async" /><span className="gallery-open-label">Ampliar fotografía ↗</span></button><div className="project-info"><span><TrafficCone size={20} /></span><div><h3>{project.title}</h3><p>{project.detail}</p></div><b>0{index + 1}</b></div></article>)}</div>
      </section>

      <section className="coverage" id="cobertura"><div className="coverage-copy"><div className="eyebrow light">Nuestra cobertura</div><h2>Cobertura en la <span>Región del Biobío</span></h2><p>Brindamos soluciones de seguridad vial en {site.coverage}, acompañando obras, faenas y desvíos.</p></div><div className="coverage-place"><MapPin /><strong>Concepción</strong><span>Región del Biobío</span></div></section>

      <section className="section contact-section" id="contacto">
        <div className="section-heading"><div className="eyebrow">Contáctanos</div><h2>Solicita una cotización</h2><p>Cuéntanos sobre tu proyecto y te contactaremos a la brevedad.</p></div>
        <div className="contact-grid">
          <form className="quote-form" onSubmit={submitQuote}>
            <div className="field-grid"><label>Nombre *<input name="name" required /></label><label>Empresa<input name="company" /></label><label>Teléfono *<input name="phone" required /></label><label>Correo *<input name="email" type="email" required /></label><label>Ciudad o comuna *<input name="city" required /></label><label>Servicio requerido *<select name="service" required defaultValue=""><option value="" disabled>Seleccionar</option>{services.map(s => <option key={s.title}>{s.title}</option>)}</select></label></div>
            <label>Mensaje *<textarea name="message" required rows={5} /></label>
            <button className="button button-yellow submit-button" disabled={formState === "loading"}>{formState === "loading" ? "Enviando solicitud…" : "Enviar solicitud"} <ChevronRight size={18} /></button>
            {formState === "success" && <p className="form-message success"><CheckCircle2 /> Tu solicitud fue enviada correctamente. Te contactaremos pronto.</p>}
            {formState === "error" && <p className="form-message error">No pudimos enviar la solicitud. Revisa los datos e inténtalo nuevamente.</p>}
          </form>
          <aside className="contact-card"><h3>También puedes contactarnos directamente</h3><div className="contact-line"><span><Phone /></span><div><a href={`tel:${site.phone.replace(/[^+\d]/g, "")}`}><strong>{site.phone}</strong></a><small>Atención de lunes a viernes</small></div></div><div className="contact-line"><span><Mail /></span><div><a href={`mailto:${site.email}`}><strong>{site.email}</strong></a><small>Te responderemos a la brevedad</small></div></div><hr /><div className="contact-line"><span className="gray"><MapPin /></span><div><strong>{site.coverage}</strong><small>Operamos en toda la Región</small></div></div></aside>
        </div>
      </section>

      <footer><div className="footer-main"><Logo /><nav>{[["Inicio", "inicio"], ["Nosotros", "nosotros"], ["Servicios", "servicios"], ["Cobertura", "cobertura"], ["Proyectos", "proyectos"], ["Contacto", "contacto"]].map(([label, id]) => <a key={label} href={`#${id}`}>{label}</a>)}</nav><span className="location-pill"><MapPin size={14} /> Concepción · Región del Biobío</span></div><div className="footer-bottom"><span>© {new Date().getFullYear()} AUTOMEGA SpA. Todos los derechos reservados.</span><span>Términos de uso &nbsp; | &nbsp; Privacidad</span></div></footer>
      <a className="whatsapp" href={`https://wa.me/${site.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent("Hola AUTOMEGA SpA, necesito cotizar un servicio de seguridad vial.")}`} target="_blank" rel="noopener noreferrer" aria-label="Solicitar cotización por WhatsApp"><img src="/whatsapp.svg" width="30" height="30" alt="" /><span>¿Cotizamos tu proyecto?</span></a>
      {selectedProject !== null && <ProjectViewer project={projects[selectedProject]} image={projects[selectedProject].image_url || `/images/${selectedProject === 0 ? "vial.png" : selectedProject === 1 ? "vial2.png" : "vial3.png"}`} onClose={() => setSelectedProject(null)} />}
    </main>
  );
}
