"use client";
import AppShell from '../../components/AppShell';
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Badge, Panel } from '../../components/Cards';

export default function DestinationsPage() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(()=>{ api('/api/destinations').then(setRows); }, []);
  return <AppShell title="Top Destinations" subtitle="Top requested DNS and destinations per device"><Panel title="Per-device destinations"><div className="listStack">{rows.map((row:any)=><details key={row.device_id} className="timeline"><summary><div><strong>{row.alias}</strong> <span className="muted">{row.ip}</span></div><Badge tone="core">{row.entries.length} top destinations</Badge></summary><div className="timelineBody">{row.entries.map((e:any, i:number)=><div className="row between" key={i}><div>{e.domain}</div><div className="muted">{e.hits} hits</div></div>)}</div></details>)}</div></Panel></AppShell>;
}
