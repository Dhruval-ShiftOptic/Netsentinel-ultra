"use client";
import AppShell from '../../components/AppShell';
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Badge, Panel } from '../../components/Cards';

export default function TimeMachinePage() {
  const [devices, setDevices] = useState<any[]>([]);
  const [selected, setSelected] = useState('');
  const [events, setEvents] = useState<any[]>([]);
  useEffect(()=>{ api('/api/devices').then((d)=>{ setDevices(d); if(d[0]) setSelected(String(d[0].id)); }); }, []);
  useEffect(()=>{ if(selected) api(`/api/time-machine/${selected}`).then(setEvents); }, [selected]);
  return (
    <AppShell title="Time Machine" subtitle="Historical per-IP activity, requests, transfers, and policy changes for the last 24 hours">
      <Panel title="IP activity timeline" right={<select className="field small" value={selected} onChange={(e)=>setSelected(e.target.value)}>{devices.map(d=><option key={d.id} value={d.id}>{d.alias} · {d.ip}</option>)}</select>}>
        <div className="listStack">{events.map(e => <details key={e.id} className="timeline"><summary><div><strong>{e.alias}</strong> <span className="muted">{e.ip}</span><div>{e.summary}</div><div className="muted">{e.at}</div></div><Badge tone="core">{e.category}</Badge></summary><div className="timelineBody">{e.details.map((line:string,idx:number)=><div key={idx} className="muted">• {line}</div>)}</div></details>)}</div>
      </Panel>
    </AppShell>
  );
}
