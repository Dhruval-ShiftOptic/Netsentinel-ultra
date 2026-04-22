"use client";
import AppShell from '../../components/AppShell';
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Panel } from '../../components/Cards';

export default function ProfilePage() {
  const [me, setMe] = useState<any>(null);
  useEffect(()=>{ api('/api/auth/me').then(setMe); }, []);
  return <AppShell title="Profile" subtitle="Current signed-in administrator"><Panel title="Session"><div className="listStack"><div className="row between"><strong>Username</strong><span>{me?.username}</span></div><div className="row between"><strong>Role</strong><span>Administrator</span></div><div className="row between"><strong>Remote login</strong><span>{me?.remote_login ? 'enabled' : 'disabled'}</span></div></div></Panel></AppShell>;
}
