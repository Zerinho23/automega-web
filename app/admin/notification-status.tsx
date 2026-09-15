"use client";
import {useEffect,useState} from 'react';
import {toast} from 'sonner';
export default function NotificationStatus(){
  const [data,setData]=useState<any>(null);
  async function refresh(){const r=await fetch('/api/admin/notifications',{cache:'no-store'});if(r.ok)setData(await r.json());}
  useEffect(()=>{void refresh();},[]);
  async function retry(){const r=await fetch('/api/admin/notifications',{method:'POST'});if(r.ok){toast.success('Avisos procesados');await refresh();}else toast.error('No fue posible procesar los avisos');}
  if(!data)return null;
  return <div className="notification-status"><div><b>Notificaciones por correo · {data.configured?'Configuradas':'Pendiente de configurar'}</b><small>{data.counts.sent||0} aceptadas por el proveedor · {data.counts.pending||0} pendientes · {data.counts.failed||0} con error</small>{!data.configured && <small>La solicitud se guarda aunque falte activar el proveedor de correo.</small>}</div>{data.configured && <button className="button button-white" onClick={retry}>Procesar pendientes</button>}</div>;
}
