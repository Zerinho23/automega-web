"use client";
import { useEffect, useRef } from 'react';
import { X, MapPin } from 'lucide-react';
export default function ProjectViewer({project,image,onClose,onQuote}:{project:{title:string;detail:string;location?:string};image:string;onClose:()=>void;onQuote:()=>void}){
  const dialog=useRef<HTMLDialogElement>(null);
  useEffect(()=>{dialog.current?.showModal();const previous=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=previous;};},[]);
  return <dialog ref={dialog} className="project-viewer" onCancel={onClose} onClick={e=>{if(e.target===dialog.current)onClose();}} aria-labelledby="project-viewer-title">
    <button className="viewer-close" onClick={onClose} aria-label="Cerrar fotografía" autoFocus><X/></button>
    <div className="project-viewer-media">
      <img className="project-viewer-backdrop" src={image} alt="" aria-hidden="true" />
      <img className="project-viewer-image" src={image} alt={project.title}/>
    </div>
    <div className="project-viewer-details">
      <span className="eyebrow">Trabajo realizado</span>
      <h2 id="project-viewer-title">{project.title}</h2>
      <p>{project.detail}</p>
      {project.location && <p className="project-viewer-location"><MapPin size={17}/> {project.location}</p>}
      <button className="button button-yellow" type="button" onClick={onQuote}>Cotizar un trabajo similar</button>
    </div>
  </dialog>;
}
