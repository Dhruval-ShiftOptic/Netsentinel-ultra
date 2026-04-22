"use client";
import AppShell from '../../components/AppShell';
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Badge, Panel } from '../../components/Cards';

function NodeCard({ node, devices, onRename, onToggle }: any) {
  return <div className="treeNode"><input className="nodeEdit" value={node.name} onChange={(e)=>onRename(node.id, e.target.value)} /><div className="muted">{node.ip}</div><Badge tone={node.online ? 'good':'neutral'}>{node.online ? 'online':'offline'}</Badge>{devices?.length ? <div className="leafWrap">{devices.map((d:any)=><div key={d.id} className="leaf"><div>{d.alias}</div><div className="muted">{d.ip}</div><button className="miniBtn" onClick={()=>onToggle(d.id, !d.internet_linked)}>{d.internet_linked ? 'Unlink from internet' : 'Link to internet'}</button></div>)}</div> : null}</div>;
}

export default function TopologyPage() {
  const [data, setData] = useState<any>(null);
  const load = ()=> api('/api/topology').then(setData);
  useEffect(load, []);
  if(!data) return <AppShell title="Infrastructure Topology" subtitle="Editable multi-node tree view"><div className="loading">Loading…</div></AppShell>;
  return (
    <AppShell title="Infrastructure Topology" subtitle="Admin can add, remove, rename, link, and unlink nodes and downstream devices">
      <Panel title="Multi-node topology" right={<button className="ghostBtn" onClick={async()=>{ await api('/api/topology/node', { method:'POST', body: JSON.stringify({ name:`New node ${Date.now()%1000}`, ip:`10.10.${data.children.length+1}.1` })}); load(); }}>Add node</button>}>
        <div className="topologyTree">
          {data.root ? <NodeCard node={data.root} devices={[]} onRename={async(id:number,name:string)=>{await api(`/api/topology/node/${id}`, { method:'POST', body: JSON.stringify({ name })}); load();}} onToggle={async(id:number,linked:boolean)=>{await api(`/api/topology/device-link/${id}`, { method:'POST', body: JSON.stringify({ internet_linked: linked })}); load();}} /> : null}
          <div className="branchRow">{data.children.map((branch:any)=><div key={branch.node.id} className="branchCol"><NodeCard node={branch.node} devices={branch.devices} onRename={async(id:number,name:string)=>{await api(`/api/topology/node/${id}`, { method:'POST', body: JSON.stringify({ name })}); load();}} onToggle={async(id:number,linked:boolean)=>{await api(`/api/topology/device-link/${id}`, { method:'POST', body: JSON.stringify({ internet_linked: linked })}); load();}} /><div className="row gap topRow"><button className="ghostBtn" onClick={async()=>{ await api('/api/topology/link', { method:'POST', body: JSON.stringify({ parent_id: data.root.id, child_id: branch.node.id })}); load(); }}>Link</button><button className="ghostBtn" onClick={async()=>{ await api('/api/topology/unlink', { method:'POST', body: JSON.stringify({ child_id: branch.node.id })}); load(); }}>Unlink</button><button className="ghostBtn" onClick={async()=>{ await api(`/api/topology/node/${branch.node.id}`, { method:'DELETE' }); load(); }}>Remove</button></div></div>)}</div>
        </div>
      </Panel>
    </AppShell>
  );
}
