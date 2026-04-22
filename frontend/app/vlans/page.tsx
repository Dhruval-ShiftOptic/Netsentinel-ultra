"use client";
import AppShell from '../../components/AppShell';
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Badge, Panel } from '../../components/Cards';

export default function VlansPage() {
  const [vlans, setVlans] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [cidr, setCidr] = useState('');
  const load = ()=> api('/api/vlans').then(setVlans);
  useEffect(load, []);
  return <AppShell title="VLANs" subtitle="Create and review virtual LAN definitions"><div className="grid twoCol"><Panel title="Create VLAN"><div className="formGrid"><label><span>Name</span><input className="field" value={name} onChange={e=>setName(e.target.value)} /></label><label><span>Subnet</span><input className="field" value={cidr} onChange={e=>setCidr(e.target.value)} placeholder="192.168.60.0/24" /></label></div><button className="primaryBtn slim" onClick={async()=>{ await api('/api/vlans', { method:'POST', body: JSON.stringify({ name, cidr })}); setName(''); setCidr(''); load(); }}>Create VLAN</button></Panel><Panel title="Active VLANs"><table className="table"><thead><tr><th>Name</th><th>Subnet</th><th>Status</th></tr></thead><tbody>{vlans.map(v=><tr key={v.id}><td>{v.name}</td><td>{v.cidr}</td><td><Badge tone="good">active</Badge></td></tr>)}</tbody></table></Panel></div></AppShell>;
}
