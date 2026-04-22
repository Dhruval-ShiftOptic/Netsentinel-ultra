"use client";
import { useEffect, useState } from 'react';
import { apiBase, setToken } from '../lib/api';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetch(`${apiBase}/api/auth/setup-status`).then(r=>r.json()).then((d)=>{ if(!d.ready) router.push('/setup'); }).catch(()=>{});
  }, [router]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setMsg('');
    const res = await fetch(`${apiBase}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
    const data = await res.json();
    if (!res.ok) return setMsg(data.detail || 'Login failed');
    setToken(data.token);
    router.push('/overview');
  }

  return (
    <div className="authShell">
      <div className="aurora auroraA"></div>
      <div className="aurora auroraB"></div>
      <form className="authCard glass floating" onSubmit={login}>
        <div className="brand bigBrand"><div className="brandLogo">NS</div><div><div className="brandTitle">Netsentinel Ultra Core</div><div className="brandSub">Secure remote login</div></div></div>
        <h1>Sign in to the gateway</h1>
        <p className="subtitle">Local credentials are stored on the hardware. Any approved administrator can sign in remotely.</p>
        <label>Username<input className="field" value={username} onChange={(e)=>setUsername(e.target.value)} /></label>
        <label>Password<input className="field" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} /></label>
        {msg ? <div className="errorBox">{msg}</div> : null}
        <button className="primaryBtn" type="submit">Enter dashboard</button>
      </form>
    </div>
  );
}
