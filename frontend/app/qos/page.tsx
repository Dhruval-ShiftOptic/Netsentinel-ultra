"use client";
import AppShell from '../../components/AppShell';
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Badge, Panel } from '../../components/Cards';

export default function QoSPage() {
  const [policies, setPolicies] = useState<any[]>([]);
  const [form, setForm] = useState<any>({ profile: 'High priority' });
  const load = async () => setPolicies(await api('/api/policies/qos'));
  useEffect(() => { load(); }, []);
  async function save() { await api('/api/policies/qos', { method: 'POST', body: JSON.stringify(form) }); setForm({ profile: 'High priority' }); load(); }
  return (
    <AppShell title="QoS" subtitle="Priority shaping, per-IP bandwidth policy, and active changes">
      <div className="grid twoCol">
        <Panel title="Policy Editor">
          <div className="formGrid">
            <label><span>Profile</span><select className="field" value={form.profile || ''} onChange={e=>setForm({...form, profile:e.target.value})}><option>Realtime</option><option>High priority</option><option>Balanced</option><option>Bulk</option></select></label>
            <label><span>Target IP</span><input className="field" value={form.target || ''} onChange={e=>setForm({...form, target:e.target.value})} placeholder="192.168.50.48" /></label>
            <label><span>Download cap</span><input className="field" value={form.download || ''} onChange={e=>setForm({...form, download:e.target.value})} placeholder="80 Mbps" /></label>
            <label><span>Upload cap</span><input className="field" value={form.upload || ''} onChange={e=>setForm({...form, upload:e.target.value})} placeholder="20 Mbps" /></label>
            <label className="full"><span>Notes</span><textarea className="field area" value={form.notes || ''} onChange={e=>setForm({...form, notes:e.target.value})} placeholder="Burst priority or fairness note"></textarea></label>
          </div>
          <div className="row gap topRow"><button className="primaryBtn slim" onClick={save}>Apply QoS profile</button><button className="ghostBtn" onClick={()=>alert(JSON.stringify(form, null, 2))}>Preview JSON</button></div>
        </Panel>
        <Panel title="QoS live posture"><div className="healthBars"><div><span>Interactive traffic preserved</span><progress max="100" value="91"></progress></div><div><span>Bulk shaped under allowance</span><progress max="100" value="83"></progress></div><div><span>Latency under load</span><progress max="100" value="88"></progress></div></div></Panel>
      </div>
      <Panel title="Active policies and change history"><table className="table"><thead><tr><th>Created</th><th>Policy</th><th>Status</th><th>Details</th></tr></thead><tbody>{policies.map((p:any)=><tr key={p.id}><td>{p.created_at}</td><td>{p.kind}</td><td><Badge tone={p.active ? 'good' : 'neutral'}>{p.active ? 'active' : 'staged'}</Badge></td><td><pre className="preTiny">{JSON.stringify(p.payload, null, 2)}</pre></td></tr>)}</tbody></table></Panel>
    </AppShell>
  );
}
