"use client";

import { ArrowRight, CalendarDays, CheckCircle2, ChevronRight, ClipboardList, Cog, Construction, HardHat, Mail, MapPin, Menu, Phone, ShieldCheck, TrafficCone, Users, X, Zap } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import ProjectViewer from "@/components/project-viewer";

const defaultServices = [
  { icon: TrafficCone, title: "Conificación vial", text: "Instalación y retiro de conos, delineadores y elementos de canalización para obras y desvíos." },
  { icon: Construction, title: "Señalización vial temporal", text: "Implementación de señalética transitoria según normativa vigente." },
  { icon: HardHat, title: "Control temporal del tránsito", text: "Apoyo con bandereros y sistemas de control para mantener un flujo vehicular seguro." },
  { icon: Cog, title: "Servicios especiales", text: "Soluciones coordinadas para necesidades viales específicas de obras y faenas." },
];

const defaultProjects = [
  { title: "Conificación vial", detail: "Obras urbanas", crop: "gallery-one", image_url: "", location: "" },
  { title: "Señalización temporal", detail: "Desvíos y cortes de tránsito", crop: "gallery-two", image_url: "", location: "" },
  { title: "Control del tránsito", detail: "Apoyo en faenas", crop: "gallery-three", image_url: "", location: "" },
];

function Logo({ inverse = false }: { inverse?: boolean; logoUrl?: string }) {
  return (
    <a className={`brand ${inverse ? "brand-inverse" : ""}`} href="#inicio" aria-label="AUTOMEGA SpA, inicio">
      <svg className="brand-symbol" viewBox="0 0 64 58" aria-hidden="true">
        <path d="M3 55 25 3h11L15 55H3Z" />
        <path d="M30 3h10l22 52H49L25 14 30 3Z" />
        <path d="m17 39 5-11h19l6 11H17Z" />
      </svg>
      <span><strong>AUTOMEGA <em>SpA</em></strong><small>SOLUCIONES VIALES</small></span>
    </a>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("inicio");
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [selectedService, setSelectedService] = useState('');
  const [formError, setFormError] = useState('');
  const [formState, setFormState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [services, setServices] = useState(defaultServices);
  const [projects, setProjects] = useState(defaultProjects);
  const [site, setSite] = useState({ hero_title:"Soluciones viales para un futuro más seguro", hero_text:"Conificación, señalización vial temporal y control del tránsito en Concepción y toda la Región del Biobío. Trabajamos con compromiso, experiencia y un equipo altamente capacitado.", about_title:"Seguridad vial para cada trabajo", phone:"+56 9 6647 3375", whatsapp:"+56 9 6647 3375", email:"diego.mora@automegaspa.com", coverage:"Concepción y toda la Región del Biobío", hero_image:"", about_image:"", logo_url:"" });
  const serviceImages = ["/images/vial.png", "/images/vial2.png", "/images/vial3.png", "/images/hero-automega-dusk.png"];
  const projectLocations = Array.from(new Set(projects.map(project => project.location?.trim()).filter(Boolean))) as string[];

  useEffect(() => {
    try { const cached = JSON.parse(localStorage.getItem("automega_site_settings") || "{}"); if (cached && typeof cached === "object") setSite(current => ({ ...current, ...cached })); } catch {}
    fetch("/api/site", { cache: "no-store" }).then(response => { if (!response.ok) throw new Error('Contenido no disponible'); return response.json(); }).then((payload: any) => { const { settings, services: remoteServices, projects: remoteProjects } = payload;
      if (settings) setSite(current => { const next = { ...current, ...settings }; try { localStorage.setItem("automega_site_settings", JSON.stringify(next)); } catch {} return next; });
      if (Array.isArray(remoteServices)) setServices(remoteServices.map((item: { title:string; description:string }, index:number) => ({ icon:[TrafficCone,Construction,HardHat,Cog][index%4], title:item.title, text:item.description })));
      if (Array.isArray(remoteProjects)) setProjects(remoteProjects.map((item: { title:string; description:string; image_url?:string; location?:string }, index:number) => ({ title:item.title, detail:item.description, location:item.location || "", crop:["gallery-one","gallery-two","gallery-three"][index%3], image_url:item.image_url || "" })));
    }).catch(() => undefined);
  }, []);

  useEffect(() => {
    document.body.style.overflow = quoteOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [quoteOpen]);

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
      const visible = sections.map(id => { const element=document.getElementById(id); return {id,top:element && element.getClientRects().length ? element.getBoundingClientRect().top : Infinity}; }).filter(item=>item.top <= 160).sort((a,b)=>b.top-a.top);
      setActiveSection(visible[0]?.id || "inicio");
    }
    window.addEventListener("scroll", trackSection, {passive:true});
    trackSection();
    return ()=>window.removeEventListener("scroll",trackSection);
  }, []);

  async function submitQuote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormState("loading");
    setFormError('');
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const response = await fetch("/api/quotes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!response.ok) { const result = await response.json().catch(() => ({})) as {error?:string}; throw new Error(result.error || 'No pudimos enviar la solicitud. Inténtalo nuevamente.'); }
      setFormState("success");
      form.reset();
      setSelectedService('');
    } catch (error) { setFormError(error instanceof Error ? error.message : 'No pudimos enviar la solicitud.'); setFormState("error"); }
  }

  return (
    <main>
      <header className="site-header" id="inicio">
        <Logo />
        <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={menuOpen} aria-controls="main-navigation">{menuOpen ? <X /> : <Menu />}</button>
        <nav id="main-navigation" className={menuOpen ? "nav-open" : ""} aria-label="Navegación principal">
          {[["Inicio", "#inicio"], ["Nosotros", "#nosotros"], ["Servicios", "#servicios"], ["Cobertura", "#cobertura"], ["Proyectos", "#proyectos"], ["Contacto", "#contacto"]].map(([label, href]) => <a key={label} href={href} className={activeSection === href.slice(1) ? "active-section" : ""} aria-current={activeSection === href.slice(1) ? "location" : undefined} onClick={() => setMenuOpen(false)}>{label}</a>)}
        </nav>
        <a className="header-phone" href={`tel:${site.phone.replace(/[^+\d]/g, "")}`}><Phone size={16} /> {site.phone}</a>
        <button className="button button-yellow header-cta" type="button" onClick={() => setQuoteOpen(true)}><CalendarDays size={15} /> Solicitar cotización <ChevronRight size={16} /></button>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow light"><span className="hero-eyebrow-icon"><ShieldCheck /></span>Seguridad hoy, comunidades más conectadas</div>
          <h1>{site.hero_title === "Soluciones viales para un futuro más seguro" ? <><span className="hero-title-line">Soluciones viales</span><span className="hero-title-line">para un futuro</span><span className="hero-title-line hero-title-accent">más seguro</span></> : site.hero_title.includes("en cada vía") ? <>Seguridad y control <span>en cada vía</span></> : site.hero_title}</h1>
          <p>{site.hero_text}</p>
          <ul className="hero-solutions" aria-label="Tipos de trabajo que atendemos"><li><CheckCircle2 /> Obras viales</li><li><CheckCircle2 /> Faenas</li><li><CheckCircle2 /> Desvíos temporales</li></ul>
          <div className="hero-actions"><button className="button button-yellow" type="button" onClick={() => setQuoteOpen(true)}><CalendarDays size={17} /> Solicitar cotización <ChevronRight size={18} /></button><a className="button button-outline" href="#servicios">Conocer nuestros servicios <ChevronRight size={18} /></a></div>
          <div className="hero-assurance" aria-label="Información comercial"><div><strong>Servicio integral</strong><span>Planificación, instalación y retiro</span></div><div><strong>Atención a empresas</strong><span>Soluciones ajustadas a cada obra</span></div></div>
        </div>
        <div className={`photo-crop hero-photo ${site.hero_image ? "custom-photo" : ""}`} role="img" aria-label="Operación de seguridad vial en una carretera de Concepción"><img src={site.hero_image || "/images/hero-automega-dusk.png"} alt="" fetchPriority="high" decoding="async" /><div className="hero-side-phrase">Vías seguras<br /><em>Personas primero</em></div><div className="hero-photo-badge"><span><strong>Trabajamos por ciudades</strong><small>más conectadas</small></span></div></div>
      </section>

      <section className="feature-strip" aria-label="Ventajas">
        {[[ShieldCheck, "Trabajo seguro", "Estándares y protocolos."], [Users, "Equipo especializado", "Personal capacitado."], [Zap, "Respuesta rápida", "Nos adaptamos a tus tiempos."]].map(([Icon, title, text]) => <div className="feature" key={String(title)}><span><Icon size={26} /></span><div><strong>{String(title)}</strong><p>{String(text)}</p></div></div>)}
      </section>

      <section className="section" id="servicios">
        <div className="section-heading split-heading"><div><div className="eyebrow">Nuestros servicios</div><h2>Soluciones integrales en seguridad vial</h2><p>Contamos con equipos, materiales y personal especializado para cada tipo de proyecto.</p></div><a className="section-link" href="#contacto">Ver todos los servicios <ArrowRight size={17} /></a></div>
        <div className="service-grid">{services.map(({ icon: Icon, title, text }, index) => <button className="service-card" type="button" onClick={() => { setSelectedService(title); setQuoteOpen(true); }} key={title} aria-label={`Cotizar ${title}`}><span className="service-media"><img src={projects[index]?.image_url || serviceImages[index % serviceImages.length]} alt="" loading="lazy" decoding="async" /></span><span className="icon-tile"><Icon /></span><div><h3>{title}</h3><p>{text}</p><span className="card-link">Ver más <ArrowRight size={15} /></span></div></button>)}</div>
      </section>

      <section className="section about-grid" id="nosotros">
        <div className="about-copy"><div className="eyebrow">Sobre AUTOMEGA</div><h2>{site.about_title === "Seguridad vial para cada trabajo" ? <>Comprometidos con la seguridad de nuestra región</> : site.about_title}</h2><p>Somos una empresa de Concepción dedicada a brindar soluciones en seguridad vial, con un enfoque en la calidad, responsabilidad y compromiso en cada proyecto.</p><p>Nuestro objetivo es contribuir a un tránsito más seguro, protegiendo a personas, trabajadores y conductores, a través de servicios confiables y un equipo altamente capacitado.</p><button className="button button-yellow" type="button" onClick={() => setQuoteOpen(true)}>Conocer más sobre nosotros <ChevronRight size={18} /></button></div>
        <div className="about-visual"><div className="photo-crop about-photo" role="img" aria-label="Conificación de una vía urbana"><img src={site.about_image || "/images/vial2.png"} alt="" loading="lazy" decoding="async" /></div><div className="about-quote"><strong>Un entorno más seguro</strong><span>es un mejor futuro para todos.</span></div></div>
        <div className="about-metrics" aria-label="Resumen del contenido publicado"><div><span><ClipboardList /></span><strong>{String(projects.length).padStart(2,"0")}</strong><small>Trabajos publicados</small></div><div><span><MapPin /></span><strong>{String(Math.max(projectLocations.length,1)).padStart(2,"0")}</strong><small>Comunas registradas</small></div><div><span><ShieldCheck /></span><strong>{String(services.length).padStart(2,"0")}</strong><small>Servicios activos</small></div></div>
      </section>

      <section className="coverage" id="cobertura"><div className="coverage-copy"><div className="eyebrow light">Cobertura</div><h2>Concepción y toda la <span>Región del Biobío</span></h2><p>Prestamos nuestros servicios en {site.coverage}. Nos desplazamos donde tu proyecto lo necesite.</p><button className="button button-outline" type="button" onClick={() => setQuoteOpen(true)}>Ver cobertura completa <ChevronRight size={18} /></button></div><div className="coverage-map" aria-hidden="true"><span /><MapPin /></div><div className="coverage-locations"><span>Comunas donde trabajamos</span><ul>{(projectLocations.length ? projectLocations : ["Concepción", "Talcahuano", "San Pedro de la Paz", "Chiguayante", "Hualpén"]).map(location => <li key={location}><CheckCircle2 /> {location}</li>)}<li><CheckCircle2 /> Y más comunas</li></ul></div></section>

      <section className="section" id="proyectos">
        <div className="section-heading split-heading"><div><div className="eyebrow">Nuestros proyectos</div><h2>Trabajos que generan un cambio real</h2></div><span className="gallery-instruction">Selecciona un trabajo para ver sus detalles</span></div>
        <div className="project-grid">{projects.map((project, index) => <article className="project-card" key={project.title}><button type="button" className={`photo-crop project-photo gallery-open ${project.crop}`} aria-label={`Ver detalles de ${project.title}`} onClick={() => setSelectedProject(index)}><img src={project.image_url || serviceImages[index % serviceImages.length]} alt={project.title} loading="lazy" decoding="async" /><span className="gallery-open-label">Ver trabajo <ArrowRight size={14} /></span></button><div className="project-info"><span><TrafficCone size={20} /></span><div><h3>{project.title}</h3><p>{project.detail}</p>{project.location && <small><MapPin size={14} /> {project.location}</small>}</div><button type="button" aria-label={`Abrir ${project.title}`} onClick={() => setSelectedProject(index)}><ArrowRight /></button></div></article>)}</div>
      </section>

      {quoteOpen && <section className="contact-overlay" role="dialog" aria-modal="true" aria-labelledby="quote-title" onMouseDown={(event) => { if (event.target === event.currentTarget) setQuoteOpen(false); }}>
        <div className="section contact-section">
        <button className="quote-modal-close" type="button" onClick={() => setQuoteOpen(false)} aria-label="Cerrar formulario"><X /></button>
        <div className="section-heading"><div className="eyebrow">Contáctanos</div><h2 id="quote-title">Solicita una cotización</h2><p>Cuéntanos sobre tu proyecto y te contactaremos a la brevedad.</p></div>
        <div className="contact-grid">
          <form className="quote-form" onSubmit={submitQuote}>
            <p className="form-help">Los campos con * son obligatorios.</p>
            <div className="field-grid"><label>Nombre *<input name="name" required maxLength={200} autoComplete="name" placeholder="Tu nombre" /></label><label>Empresa<input name="company" maxLength={200} autoComplete="organization" placeholder="Opcional" /></label><label>Teléfono *<input name="phone" type="tel" required maxLength={22} pattern="[+0-9\s\(\)\-]{8,22}" autoComplete="tel" placeholder="+56 9 1234 5678" /></label><label>Correo *<input name="email" type="email" required maxLength={254} autoComplete="email" placeholder="nombre@empresa.cl" /></label><label>Ciudad o comuna *<input name="city" required maxLength={200} placeholder="Ubicación de la obra" /></label><label>Servicio requerido *<select name="service" required value={selectedService} onChange={event => setSelectedService(event.target.value)}><option value="" disabled>Seleccionar servicio</option>{services.map(s => <option key={s.title}>{s.title}</option>)}</select></label></div>
            <label>Mensaje *<textarea name="message" required rows={5} maxLength={4000} placeholder="Describe el trabajo, la ubicación y la fecha estimada." /></label>
            <button className="button button-yellow submit-button" disabled={formState === "loading"}>{formState === "loading" ? "Enviando solicitud…" : "Enviar solicitud"} <ChevronRight size={18} /></button>
            {formState === "success" && <p className="form-message success"><CheckCircle2 /> Tu solicitud fue enviada correctamente. Te contactaremos pronto.</p>}
            {formState === "error" && <p className="form-message error" role="alert">{formError}</p>}
          </form>
          <aside className="contact-card"><h3>También puedes contactarnos directamente</h3><div className="contact-line"><span><Phone /></span><div><a href={`tel:${site.phone.replace(/[^+\d]/g, "")}`}><strong>{site.phone}</strong></a><small>Atención de lunes a viernes</small></div></div><div className="contact-line"><span><Mail /></span><div><a href={`mailto:${site.email}`}><strong>{site.email}</strong></a><small>Te responderemos a la brevedad</small></div></div><hr /><div className="contact-line"><span className="gray"><MapPin /></span><div><strong>{site.coverage}</strong><small>Operamos en toda la Región</small></div></div></aside>
        </div>
        </div>
      </section>}

      <section className="project-cta-band" id="contacto"><div><span>Atención para empresas y obras</span><h2>¿Tienes un proyecto en mente?</h2><p>Cotiza con nosotros y recibe una propuesta personalizada según tus necesidades.</p></div><button className="button button-yellow" type="button" onClick={() => setQuoteOpen(true)}>Solicitar cotización <ArrowRight size={18} /></button><div className="cta-contact"><a href={`tel:${site.phone.replace(/[^+\d]/g, "")}`}><Phone /> {site.phone}</a><a href={`mailto:${site.email}`}><Mail /> {site.email}</a><span><MapPin /> {site.coverage}</span></div></section>

      <footer><div className="footer-main"><div className="footer-brand"><Logo inverse /><p>Seguridad, coordinación y control vial para obras y faenas de la Región del Biobío.</p></div><nav>{[["Inicio", "inicio"], ["Nosotros", "nosotros"], ["Servicios", "servicios"], ["Cobertura", "cobertura"], ["Proyectos", "proyectos"], ["Contacto", "contacto"]].map(([label, id]) => <a key={label} href={`#${id}`}>{label}</a>)}</nav><div className="footer-contact"><a href={`tel:${site.phone.replace(/[^+\d]/g, "")}`}><Phone /> {site.phone}</a><a href={`mailto:${site.email}`}><Mail /> {site.email}</a><span><MapPin /> {site.coverage}</span></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} AUTOMEGA SpA. Todos los derechos reservados.</span><span>Vías más seguras para un mejor futuro.</span></div></footer>
      <a className="whatsapp" href={`https://wa.me/${site.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent("Hola AUTOMEGA SpA, necesito cotizar un servicio de seguridad vial.")}`} target="_blank" rel="noopener noreferrer" aria-label="Solicitar cotización por WhatsApp"><img src="/whatsapp.svg" width="30" height="30" alt="" /><span>¿Cotizamos tu proyecto?</span></a>
      {selectedProject !== null && projects[selectedProject] && <ProjectViewer project={projects[selectedProject]} image={projects[selectedProject].image_url || serviceImages[selectedProject % serviceImages.length]} onClose={() => setSelectedProject(null)} />}
    </main>
  );
}
