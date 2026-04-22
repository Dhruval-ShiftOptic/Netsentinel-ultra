"use client";
import AppShell from '../../components/AppShell';
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Badge, Panel } from '../../components/Cards';

export default function VpnPage() {
  const [policies, setPolicies] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [form, setForm] = useState<any>({ account: 'WireGuard', region: 'India', scope: 'Single IP' });
  const load = async () => { const [p,d] = await Promise.all([api('/api/policies/vpn'), api('/api/devices')]); setPolicies(p); setDevices(d); };
  useEffect(() => { load(); }, []);
  async function save() { await api('/api/policies/vpn', { method: 'POST', body: JSON.stringify(form) }); load(); }
  return (
    <AppShell title="VPN" subtitle="Provider selection, split tunneling, and device / IP assignment">
      <div className="grid twoCol">
        <Panel title="Policy Editor">
          <div className="formGrid">
            <label><span>VPN account</span><select className="field" value={form.account || ''} onChange={e=>setForm({...form, account:e.target.value})}><option>WireGuard</option><option>OpenVPN</option><option>Cloudflare</option><option>Tailscale</option><option>Custom provider</option></select></label>
            <label><span>Region</span><select className="field" value={form.region || ''} onChange={e=>setForm({...form, region:e.target.value})}><option>Auto</option><option>US</option><option>EU</option><option>India</option><option>Japan</option><option>Singapore</option></select></label>
            <label><span>Target scope</span><select className="field" value={form.scope || ''} onChange={e=>setForm({...form, scope:e.target.value})}><option>Whole network</option><option>Single IP</option><option>Selected devices</option></select></label>
            <label><span>Selected IP</span><input className="field" value={form.target || ''} onChange={e=>setForm({...form, target:e.target.value})} placeholder="192.168.50.111" /></label>
            <label className="full"><span>Notes</span><textarea className="field area" value={form.notes || ''} onChange={e=>setForm({...form, notes:e.target.value})} placeholder="Peer details"></textarea></label>
          </div>
          <div className="row gap topRow"><button className="primaryBtn slim" onClick={save}>Create VPN policy</button><button className="ghostBtn" onClick={()=>alert(JSON.stringify(form, null, 2))}>Preview JSON</button></div>
        </Panel>
        <Panel title="VPN device usage"><table className="table"><thead><tr><th>Device</th><th>Target</th><th>Provider</th><th>Status</th></tr></thead><tbody>{devices.map((d:any)=><tr key={d.id}><td>{d.alias}</td><td>{d.ip}</td><td>{d.vpn_provider || 'none'}</td><td><Badge tone={d.vpn_connected ? 'good':'bad'}>{d.vpn_connected ? 'connected' : 'no vpn connection'}</Badge></td></tr>)}</tbody></table></Panel>
      </div>
      <Panel title="Active policies and change history"><table className="table"><thead><tr><th>Created</th><th>Policy</th><th>Status</th><th>Details</th></tr></thead><tbody>{policies.map((p:any)=><tr key={p.id}><td>{p.created_at}</td><td>{p.kind}</td><td><Badge tone={p.active ? 'good' : 'neutral'}>{p.active ? 'active' : 'staged'}</Badge></td><td><pre className="preTiny">{JSON.stringify(p.payload, null, 2)}</pre></td></tr>)}</tbody></table></Panel>
    </AppShell>
  );
}
