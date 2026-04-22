"use client";
import AppShell from '../../components/AppShell';
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Badge, Panel } from '../../components/Cards';

export default function SupervisorPage() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(()=>{ api('/api/supervisor').then(setItems); }, []);
  return <AppShell title="Device Supervisor" subtitle="Heartbeat, silent device monitoring, and recovery orchestration"><Panel title="Supervised devices">{items.filter(s=>s.state!=='none').length ? <table className="table"><thead><tr><th>Device</th><th>Power source</th><th>Heartbeat</th><th>Recovery</th><th>Status</th></tr></thead><tbody>{items.filter(s=>s.state!=='none').map(s=><tr key={s.id}><td>{s.device}</td><td>{s.power_source}</td><td>{s.heartbeat_window}</td><td>{s.recovery_window}</td><td><Badge tone={s.state === 'stable' ? 'good' : 'warn'}>{s.state}</Badge></td></tr>)}</tbody></table> : <div className="emptyBox">None supervised right now.</div>}</Panel></AppShell>;
}
