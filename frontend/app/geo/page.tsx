"use client";
import AppShell from '../../components/AppShell';
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Badge, Panel } from '../../components/Cards';
const regions = ['Africa','Asia','Europe','North America','South America','Oceania'];
export default function GeoPage() {
  const [policies, setPolicies] = useState<any[]>([]);
  const [form, setForm] = useState<any>({ scope: 'Whole network', direction: 'Outbound', region: 'Africa', action: 'Block' });
  const load = async () => setPolicies(await api('/api/policies/geo'));
  useEffect(() => { load(); }, []);
  async function save() { await api('/api/policies/geo', { method: 'POST', body: JSON.stringify(form) }); load(); }
  return (
    <AppShell title="Geo Controls" subtitle="Regional allow and block lists for inbound, outbound, or both">
      <div className="grid twoCol">
        <Panel title="Policy Editor">
          <div className="formGrid">
            <label><span>Target Scope</span><select className="field" value={form.scope || ''} onChange={e=>setForm({...form, scope:e.target.value})}><option>Whole network</option><option>Single IP</option></select></label>
            <label><span>Region</span><select className="field" value={form.region || ''} onChange={e=>setForm({...form, region:e.target.value})}>{regions.map(r=><option key={r}>{r}</option>)}</select></label>
            <label><span>Direction</span><select className="field" value={form.direction || ''} onChange={e=>setForm({...form, direction:e.target.value})}><option>Inbound</option><option>Outbound</option><option>Both</option></select></label>
            <label><span>Action</span><select className="field" value={form.action || ''} onChange={e=>setForm({...form, action:e.target.value})}><option>Allow</option><option>Block</option></select></label>
            <label><span>Target IP</span><input className="field" value={form.target || ''} onChange={e=>setForm({...form, target:e.target.value})} placeholder="Optional dedicated IP" /></label>
            <label className="full"><span>Notes</span><textarea className="field area" value={form.notes || ''} onChange={e=>setForm({...form, notes:e.target.value})} placeholder="Purpose and exceptions"></textarea></label>
          </div>
          <div className="row gap topRow"><button className="primaryBtn slim" onClick={save}>Save geo policy</button><button className="ghostBtn" onClick={()=>alert(JSON.stringify(form, null, 2))}>Preview JSON</button></div>
        </Panel>
        <Panel title="Interactive region board"><div className="regionMap">{regions.map(region => <button key={region} className={`regionCell ${form.region===region?'selected':''}`} onClick={()=>setForm({...form, region})}>{region}</button>)}</div></Panel>
      </div>
      <Panel title="Active policies and change history"><table className="table"><thead><tr><th>Created</th><th>Policy</th><th>Status</th><th>Details</th></tr></thead><tbody>{policies.map((p:any)=><tr key={p.id}><td>{p.created_at}</td><td>{p.kind}</td><td><Badge tone={p.active ? 'good' : 'neutral'}>{p.active ? 'active' : 'staged'}</Badge></td><td><pre className="preTiny">{JSON.stringify(p.payload, null, 2)}</pre></td></tr>)}</tbody></table></Panel>
    </AppShell>
  );
}
