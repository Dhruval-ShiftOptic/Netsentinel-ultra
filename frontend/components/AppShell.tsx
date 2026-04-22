"use client";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { api, clearToken } from '../lib/api';
import { menu } from '../lib/menu';

export default function AppShell({ title, subtitle, children, onSearch }: { title: string; subtitle?: string; children: React.ReactNode; onSearch?: (q: string)=>void; }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [dark, setDark] = useState(true);
  const [updatedAt, setUpdatedAt] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('ns_theme');
    const darkMode = saved !== 'light';
    setDark(darkMode);
    document.documentElement.dataset.theme = darkMode ? 'dark' : 'light';
    setUpdatedAt(new Date().toLocaleTimeString());
    api('/api/auth/me').then(setUser).catch(() => router.push('/login'));
  }, [router]);

  useEffect(() => { onSearch?.(search); }, [search, onSearch]);
  const initials = useMemo(() => (user?.username || 'NS').slice(0,2).toUpperCase(), [user]);

  return (
    <div className="shell">
      <aside className="sidebar glass floating">
        <div className="brand">
          <div className="brandLogo">NS</div>
          <div>
            <div className="brandTitle">Netsentinel Ultra</div>
            <div className="brandSub">Enterprise network intelligence</div>
          </div>
        </div>
        <input className="search" placeholder="Search pages, IPs, policies" value={search} onChange={(e)=>setSearch(e.target.value)} />
        <nav className="menu">
          {menu.map(item => (
            <Link key={item.href} href={item.href} className={pathname === item.href ? 'menuItem active' : 'menuItem'}>{item.label}</Link>
          ))}
        </nav>
      </aside>
      <main className="mainPane">
        <header className="topbar glass floating">
          <div>
            <div className="eyebrow">Network</div>
            <h1>{title}</h1>
            {subtitle ? <p className="subtitle">{subtitle}</p> : null}
          </div>
          <div className="topActions">
            <span className="stamp">Updated {updatedAt}</span>
            <button className="iconBtn" onClick={()=>router.push('/alerts')}>🔔</button>
            <button className="iconBtn" onClick={()=>{ const next = !dark; setDark(next); localStorage.setItem('ns_theme', next ? 'dark' : 'light'); document.documentElement.dataset.theme = next ? 'dark' : 'light'; }}>◐</button>
            <button className="avatar" onClick={()=>router.push('/profile')}>{initials}</button>
            <button className="ghostBtn" onClick={()=>{ clearToken(); router.push('/login'); }}>Logout</button>
          </div>
        </header>
        <section className="pageWrap">{children}</section>
      </main>
    </div>
  );
}
