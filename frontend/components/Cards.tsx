import React from 'react';

export function StatCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return <div className="card statCard floating"><div className="statLabel">{label}</div><div className="statValue">{value}</div>{hint ? <div className="statHint">{hint}</div> : null}</div>;
}

export function Panel({ title, right, children, className='' }: { title?: string; right?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return <div className={`card panel floating ${className}`}>{title || right ? <div className="panelHead"><div className="panelTitle">{title}</div><div>{right}</div></div> : null}{children}</div>;
}

export function Badge({ children, tone='neutral' }: { children: React.ReactNode; tone?: 'neutral'|'good'|'warn'|'bad'|'core' }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}
