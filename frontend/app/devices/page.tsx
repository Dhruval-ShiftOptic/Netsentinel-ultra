"use client";
import AppShell from '../../components/AppShell';
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Badge, Panel } from '../../components/Cards';
import EditableField from '../../components/EditableField';

export default function DevicesPage() {
  const [devices, setDevices] = useState<any[]>([]);
  const [filter, setFilter] = useState('');
  const load = ()=> api('/api/devices').then(setDevices);
  useEffect(load, []);
  const shown = devices.filter(d => JSON.stringify(d).toLowerCase().includes(filter.toLowerCase()));
  return (
    <AppShell title="Devices" subtitle="Block, unblock, rename, rebind, and inspect active status" onSearch={setFilter}>
      <Panel title="Device activity">
        <table className="table"><thead><tr><th>IP</th><th>Alias</th><th>Bound IP</th><th>Status</th><th>Traffic</th><th>Now</th><th>Actions</th></tr></thead>
        <tbody>{shown.map(d => <tr key={d.id}><td>{d.ip}</td><td><EditableField label="Alias" value={d.alias} onSave={async(v)=>{ await api(`/api/devices/${d.id}`, { method:'POST', body: JSON.stringify({ alias: v })}); load(); }} /></td><td><EditableField label="Bound IP" value={d.bound_ip || ''} onSave={async(v)=>{ await api(`/api/devices/${d.id}`, { method:'POST', body: JSON.stringify({ bound_ip: v })}); load(); }} /></td><td><Badge tone={d.blocked ? 'bad' : d.active ? 'good' : 'neutral'}>{d.blocked ? 'blocked' : d.status}</Badge></td><td>{d.traffic}</td><td>{d.active ? 'active' : 'inactive'}</td><td><div className="row gap"><button className="ghostBtn" onClick={async()=>{ await api(`/api/devices/${d.id}/toggle-block`, { method:'POST' }); load(); }}>{d.blocked ? 'Unblock' : 'Block'}</button><button className="ghostBtn" onClick={async()=>{ await api(`/api/devices/${d.id}`, { method:'POST', body: JSON.stringify({ active: !d.active })}); load(); }}>{d.active ? 'Mark idle' : 'Mark active'}</button></div></td></tr>)}</tbody></table>
      </Panel>
    </AppShell>
  );
}
