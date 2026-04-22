"use client";
import AppShell from '../../components/AppShell';
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Badge, Panel } from '../../components/Cards';

export default function FirewallPage() {
  const [policies, setPolicies] = useState<any[]>([]);
  const [form, setForm] = useState<any>({ scope: 'Whole network', action: 'Allow' });
  const load = async () => setPolicies(await api('/api/policies/firewall'));
  useEffect(() => { load(); }, []);
  async function save() { await api('/api/policies/firewall', { method: 'POST', body: JSON.stringify(form) }); setForm({ scope: 'Whole network', action: 'Allow' }); load(); }
  return (
    <AppShell title="Firewall" subtitle="Packet filtering firewall, active policies, and change history">
      <div className="grid twoCol">
        <Panel title="Policy Editor">
          <div className="formGrid">
            <label><span>Target Scope</span><select className="field" value={form.scope || ''} onChange={e=>setForm({...form, scope:e.target.value})}><option>Whole network</option><option>Single IP</option><option>Device group</option></select></label>
            <label><span>Action</span><select className="field" value={form.action || ''} onChange={e=>setForm({...form, action:e.target.value})}><option>Allow</option><option>Deny</option><option>Quarantine</option><option>Block</option></select></label>
            <label><span>Port / Range</span><input className="field" value={form.port || ''} onChange={e=>setForm({...form, port:e.target.value})} placeholder="443" /></label>
            <label><span>Target IP</span><input className="field" value={form.target || ''} onChange={e=>setForm({...form, target:e.target.value})} placeholder="192.168.50.222" /></label>
            <label className="full"><span>Notes</span><textarea className="field area" value={form.notes || ''} onChange={e=>setForm({...form, notes:e.target.value})} placeholder="Reason, change window, rollback note"></textarea></label>
          </div>
          <div className="row gap topRow">
            <button className="primaryBtn slim" onClick={save}>Save firewall rule</button>
            <button className="ghostBtn" onClick={()=>alert(JSON.stringify(form, null, 2))}>Preview JSON</button>
          </div>
          <div className="row gap topRow">
            <Badge tone="core">Suggestions</Badge>
            <button className="ghostBtn" onClick={()=>setForm({ scope:'Single IP', action:'Deny', port:'23', target:'192.168.50.0/24', notes:'Block telnet' })}>Block telnet</button>
            <button className="ghostBtn" onClick={()=>setForm({ scope:'Whole network', action:'Allow', port:'443', notes:'Allow HTTPS' })}>Allow HTTPS</button>
          </div>
        </Panel>
        <Panel title="Packet posture">
          <div className="muted">Packet filtering mode. Rules save locally and appear below as active policies.</div>
        </Panel>
      </div>
      <Panel title="Active policies and change history">
        <table className="table"><thead><tr><th>Created</th><th>Policy</th><th>Status</th><th>Details</th></tr></thead><tbody>{policies.map((p:any)=><tr key={p.id}><td>{p.created_at}</td><td>{p.kind}</td><td><Badge tone={p.active ? 'good' : 'neutral'}>{p.active ? 'active' : 'staged'}</Badge></td><td><pre className="preTiny">{JSON.stringify(p.payload, null, 2)}</pre></td></tr>)}</tbody></table>
      </Panel>
    </AppShell>
  );
}
