"use client";
import AppShell from '../../components/AppShell';
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Badge, Panel } from '../../components/Cards';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  useEffect(()=>{ api('/api/alerts').then(setAlerts); }, []);
  return <AppShell title="Alerts" subtitle="Device joins, disconnects, requests, scans, and major events"><Panel title="Recent alerts"><div className="listStack">{alerts.map(a=><div key={a.id} className="alertRow"><div><strong>{a.title}</strong><div>{a.message}</div><div className="muted">{a.created_at}</div></div><Badge tone={a.severity==='critical'?'bad':a.severity==='warning'?'warn':'good'}>{a.severity}</Badge></div>)}</div></Panel></AppShell>;
}
