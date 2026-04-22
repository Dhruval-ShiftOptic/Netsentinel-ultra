"use client";
import AppShell from '../../components/AppShell';
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Badge, Panel } from '../../components/Cards';

export default function IdsPage() {
  const [policies, setPolicies] = useState<any[]>([]);
  const [form, setForm] = useState<any>({ mode: 'Detect + block', sensitivity: 'High' });
  const load = async () => setPolicies(await api('/api/policies/ids_ips'));
  useEffect(() => { load(); }, []);
  async function save() { await api('/api/policies/ids_ips', { method: 'POST', body: JSON.stringify(form) }); load(); }
  return (
    <AppShell title="IDS / IPS" subtitle="Enterprise-style detection tuning, response mode, and signatures">
      <div className="grid twoCol">
        <Panel title="Policy Editor">
          <div className="formGrid">
            <label><span>Policy mode</span><select className="field" value={form.mode || ''} onChange={e=>setForm({...form, mode:e.target.value})}><option>Detect only</option><option>Detect + block</option><option>Detect + quarantine</option></select></label>
            <label><span>Target IP / segment</span><input className="field" value={form.target || ''} onChange={e=>setForm({...form, target:e.target.value})} placeholder="192.168.50.0/24" /></label>
            <label><span>Sensitivity</span><select className="field" value={form.sensitivity || ''} onChange={e=>setForm({...form, sensitivity:e.target.value})}><option>Low</option><option>Medium</option><option>High</option><option>Paranoid</option></select></label>
            <label className="full"><span>Exception notes</span><textarea className="field area" value={form.notes || ''} onChange={e=>setForm({...form, notes:e.target.value})} placeholder="Operational caveats"></textarea></label>
          </div>
          <div className="row gap topRow"><button className="primaryBtn slim" onClick={save}>Deploy detection policy</button><button className="ghostBtn" onClick={()=>alert(JSON.stringify(form, null, 2))}>Preview JSON</button></div>
        </Panel>
        <Panel title="Detection health"><div className="healthBars"><div><span>Scan detection confidence</span><progress max="100" value="94"></progress></div><div><span>False positive suppression</span><progress max="100" value="89"></progress></div><div><span>Auto-response success</span><progress max="100" value="92"></progress></div></div></Panel>
      </div>
      <Panel title="Active policies and change history"><table className="table"><thead><tr><th>Created</th><th>Policy</th><th>Status</th><th>Details</th></tr></thead><tbody>{policies.map((p:any)=><tr key={p.id}><td>{p.created_at}</td><td>{p.kind}</td><td><Badge tone={p.active ? 'good' : 'neutral'}>{p.active ? 'active' : 'staged'}</Badge></td><td><pre className="preTiny">{JSON.stringify(p.payload, null, 2)}</pre></td></tr>)}</tbody></table></Panel>
    </AppShell>
  );
}
