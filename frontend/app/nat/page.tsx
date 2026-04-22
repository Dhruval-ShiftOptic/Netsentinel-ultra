"use client";
import AppShell from '../../components/AppShell';
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Badge, Panel } from '../../components/Cards';

export default function NatPage() {
  const [policies, setPolicies] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [form, setForm] = useState<any>({ rule_type: 'Port forward', protocol: 'TCP' });
  const load = async () => { const [p,d] = await Promise.all([api('/api/policies/nat'), api('/api/devices')]); setPolicies(p); setDevices(d); };
  useEffect(() => { load(); }, []);
  async function save() { await api('/api/policies/nat', { method: 'POST', body: JSON.stringify(form) }); load(); }
  return (
    <AppShell title="NAT" subtitle="Translation policy, port forwarding, and edge publishing">
      <div className="grid twoCol">
        <Panel title="Policy Editor">
          <div className="formGrid">
            <label><span>Rule type</span><select className="field" value={form.rule_type || ''} onChange={e=>setForm({...form, rule_type:e.target.value})}><option>Port forward</option><option>1:1 NAT</option><option>Masquerade</option><option>Hairpin</option></select></label>
            <label><span>External IP / port</span><input className="field" value={form.external || ''} onChange={e=>setForm({...form, external:e.target.value})} placeholder="203.0.113.20:443" /></label>
            <label><span>Internal target</span><input className="field" value={form.internal || ''} onChange={e=>setForm({...form, internal:e.target.value})} placeholder="192.168.50.48:8443" /></label>
            <label><span>Protocol</span><select className="field" value={form.protocol || ''} onChange={e=>setForm({...form, protocol:e.target.value})}><option>TCP</option><option>UDP</option><option>TCP+UDP</option></select></label>
            <label className="full"><span>Notes</span><textarea className="field area" value={form.notes || ''} onChange={e=>setForm({...form, notes:e.target.value})} placeholder="Change log notes"></textarea></label>
          </div>
          <div className="row gap topRow"><button className="primaryBtn slim" onClick={save}>Save NAT rule</button><button className="ghostBtn" onClick={()=>alert(JSON.stringify(form, null, 2))}>Preview JSON</button></div>
        </Panel>
        <Panel title="Devices on network"><table className="table"><thead><tr><th>Device</th><th>IP</th><th>State</th></tr></thead><tbody>{devices.map((d:any)=><tr key={d.id}><td>{d.alias}</td><td>{d.ip}</td><td>{d.internet_linked ? 'linked' : 'unlinked'}</td></tr>)}</tbody></table></Panel>
      </div>
      <Panel title="Active policies and change history"><table className="table"><thead><tr><th>Created</th><th>Policy</th><th>Status</th><th>Details</th></tr></thead><tbody>{policies.map((p:any)=><tr key={p.id}><td>{p.created_at}</td><td>{p.kind}</td><td><Badge tone={p.active ? 'good' : 'neutral'}>{p.active ? 'active' : 'staged'}</Badge></td><td><pre className="preTiny">{JSON.stringify(p.payload, null, 2)}</pre></td></tr>)}</tbody></table></Panel>
    </AppShell>
  );
}
