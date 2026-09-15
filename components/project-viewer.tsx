"use client";
import { useEffect, useRef } from 'react';
import { X, MapPin } from 'lucide-react';
export default function ProjectViewer({project,image,onClose}:{project:{title:string;detail:string;location?:string};image:string;onClose:()=>void}){
  const dialog=useRef<HTMLDialogElement>(null);
  useEffect(()=>{dialog.current?.showModal();const previous=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=previous;};},[]);
  return <dialog ref={dialog} className="project-viewer project-detail-dialog" onCancel={onClose} onClick={e=>{if(e.target===dialog.current)onClose();}} aria-labelledby="project-viewer-title">
    <header className="detail-toolbar"><span>PORTAFOLIO · AUTOMEGA SpA</span><button className="viewer-close" onClick={onClose} aria-label="Cerrar proyecto" autoFocus><X size={20}/></button></header>
    <div className="detail-layout"><figure className="detail-photo"><img src={image} alt={project.title} decoding="async"/><figcaption>Fotografía del proyecto</figcaption></figure><section className="detail-content"><span className="detail-tag">Trabajo realizado</span><h2 id="project-viewer-title">{project.title}</h2><dl><div><dt>Servicio / descripción</dt><dd>{project.detail || "Sin descripción registrada"}</dd></div>{project.location && <div><dt>Ubicación</dt><dd><MapPin size={16}/>{project.location}</dd></div>}</dl><div className="detail-cta"><h3>¿Necesitas apoyo en tu obra?</h3><p>Cuéntanos dónde y qué servicio necesitas.</p><a className="button button-yellow" href="#contacto" onClick={onClose}>Solicitar cotización ↗</a></div></section></div>
  </dialog>;
}
