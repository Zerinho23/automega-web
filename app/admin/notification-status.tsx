"use client";
import {useEffect,useState} from 'react';
import {toast} from 'sonner';
type RetryResult={ok?:boolean;errors?:string[];error?:string};
export default function NotificationStatus(){
  const [data,setData]=useState<any>(null);
  const [lastError,setLastError]=useState('');
  const [retrying,setRetrying]=useState(false);
  async function refresh(){const r=await fetch('/api/admin/notifications',{cache:'no-store'});if(r.ok)setData(await r.json());}
  useEffect(()=>{void refresh();},[]);
  async function retry(){setRetrying(true);try{const r=await fetch('/api/admin/notifications',{method:'POST'});const result=await r.json().catch(()=>null) as RetryResult|null;if(r.ok&&result?.ok){setLastError('');toast.success('Avisos enviados correctamente');await refresh();return;}const message=result?.errors?.[0]||result?.error||'No fue posible procesar los avisos';setLastError(message);toast.error(message);await refresh();}catch{setLastError('No fue posible conectar con el servicio de correo');toast.error('No fue posible conectar con el servicio de correo');}finally{setRetrying(false);}}
  if(!data)return null;
  const failed=Number(data.counts.failed||0);
  return <div className={`notification-status${failed?' notification-has-errors':''}`}><div><b>{failed?'Correos pendientes de revisión':data.configured?'Avisos por correo activos':'Avisos por correo sin configurar'}</b><small>{data.counts.sent||0} aceptados · {data.counts.pending||0} pendientes · {failed} con error</small>{lastError && <small className="notification-error-detail">Resend: {lastError}</small>}</div>{data.configured && <button className="button button-white" disabled={retrying} onClick={retry}>{retrying?'Procesando…':'Reintentar avisos'}</button>}</div>;
}
