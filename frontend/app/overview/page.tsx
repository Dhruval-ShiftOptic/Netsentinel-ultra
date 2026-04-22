"use client";
import AppShell from '../../components/AppShell';
import { useEffect, useMemo, useState } from 'react';
import { api } from '../../lib/api';
import { Badge, Panel, StatCard } from '../../components/Cards';
import Graph from '../../components/Graph';

export default function OverviewPage() {
  const [data, setData] = useState<any>(null);
  useEffect(()=>{ api('/api/overview').then(setData); }, []);
  const graph = useMemo(()=> data?.graph || [12,18,22,19,30,42,34,53], [data]);
  if (!data) return <AppShell title="Overview" subtitle="Enterprise overview and live internet activity"><div className="loading">Loading…</div></AppShell>;
  return (
    <AppShell title="Overview" subtitle="Enterprise overview and live internet activity">
      <div className="grid stats4">
        <StatCard label="Incoming" value={`${data.summary.rx_mbps} Mbps`} hint="current inbound" />
        <StatCard label="Outgoing" value={`${data.summary.tx_mbps} Mbps`} hint="current outbound" />
        <StatCard label="Active devices" value={data.summary.active_devices} hint="online right now" />
        <StatCard label="Blocked devices" value={data.summary.blocked_devices} hint="quarantined or denied" />
      </div>
      <div className="grid twoCol">
        <Panel title="Internet activity graph">
          <Graph values={graph} />
        </Panel>
        <Panel title="Top destinations">
          <div className="listStack">{data.top_destinations.map((d:any)=><div key={d.domain} className="row between"><div><strong>{d.domain}</strong><div className="muted">{d.hits} requests</div></div><Badge tone="core">DNS</Badge></div>)}</div>
        </Panel>
      </div>
      <div className="grid twoCol">
        <Panel title="Top devices right now">
          <table className="table"><thead><tr><th>Alias</th><th>IP</th><th>Status</th><th>Traffic</th></tr></thead><tbody>{data.devices.slice(0,5).map((d:any)=><tr key={d.id}><td>{d.alias}</td><td>{d.ip}</td><td><Badge tone={d.blocked ? 'bad' : d.active ? 'good' : 'neutral'}>{d.blocked ? 'blocked' : d.active ? 'active' : 'idle'}</Badge></td><td>{d.traffic}</td></tr>)}</tbody></table>
        </Panel>
        <Panel title="Gateway features snapshot">
          <div className="featureGrid">
            <div className="feature"><div className="miniLabel">Remote login</div><strong>{data.settings.remote_login ? 'Enabled' : 'Disabled'}</strong></div>
            <div className="feature"><div className="miniLabel">VLANs</div><strong>{data.vlan_count}</strong></div>
            <div className="feature"><div className="miniLabel">Active VPN peers</div><strong>{data.vpn_active}</strong></div>
            <div className="feature"><div className="miniLabel">IDS mode</div><strong>{data.ids_mode}</strong></div>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
