"use client";
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { apiBase } from '../lib/api';

export default function SetupWizard() {
  const [deviceName, setDeviceName] = useState('Netsentinel Ultra Core');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [remoteLogin, setRemoteLogin] = useState(true);
  const [msg, setMsg] = useState('');
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg('');
    const res = await fetch(`${apiBase}/api/auth/setup`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ device_name: deviceName, username, password, remote_login: remoteLogin }) });
    const data = await res.json();
    if (!res.ok) return setMsg(data.detail || 'Setup failed');
    router.push('/login');
  }

  return (
    <div className="authShell">
      <div className="aurora auroraA"></div>
      <div className="aurora auroraB"></div>
      <form className="authCard glass floating wizard" onSubmit={submit}>
        <div className="pill">First time setup</div>
        <h1>Bring the gateway online</h1>
        <p className="subtitle">This initial wizard stores the administrator credentials on local hardware, names the appliance, and enables the remote login portal.</p>
        <div className="setupGrid">
          <label>Appliance name<input className="field" value={deviceName} onChange={(e)=>setDeviceName(e.target.value)} /></label>
          <label>Administrator username<input className="field" value={username} onChange={(e)=>setUsername(e.target.value)} /></label>
          <label className="full">Administrator password<input className="field" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} /></label>
        </div>
        <label className="toggleRow"><input type="checkbox" checked={remoteLogin} onChange={(e)=>setRemoteLogin(e.target.checked)} /> Enable remote login portal</label>
        {msg ? <div className="errorBox">{msg}</div> : null}
        <button className="primaryBtn" type="submit">Finish setup</button>
      </form>
    </div>
  );
}
