"use client";
import {useEffect,useState} from 'react';
import {toast} from 'sonner';
type RetryResult={ok?:boolean;errors?:string[];error?:string};
export default function NotificationStatus(){
  const [data,setData]=useState<any>(null);
  const [lastError,setLastError]=useState('');
  async function refresh(){const r=await fetch('/api/admin/notifications',{cache:'no-store'});if(r.ok)setData(await r.json());}
  useEffect(()=>{void refresh();},[]);
  async function retry(){const r=await fetch('/api/admin/notifications',{method:'POST'});const result=await r.json().catch(()=>null) as RetryResult|null;if(r.ok&&result?.ok){setLastError('');toast.success('Avisos enviados correctamente');await refresh();return;}const message=result?.errors?.[0]||result?.error||'No fue posible procesar los avisos';setLastError(message);toast.error(message);await refresh();}
  if(!data)return null;
  return <div className="notification-status"><div><b>Notificaciones por correo · {data.configured?'Configuradas':'Pendiente de configurar'}</b><small>{data.counts.sent||0} aceptadas por el proveedor · {data.counts.pending||0} pendientes · {data.counts.failed||0} con error</small>{!data.configured && <small>La solicitud se guarda aunque falte activar el proveedor de correo.</small>}{lastError && <small className="notification-error-detail">Resend: {lastError}</small>}</div>{data.configured && <button className="button button-white" onClick={retry}>Procesar pendientes</button>}</div>;
}
