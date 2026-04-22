from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
import sqlite3, json, hashlib, os, secrets
from pathlib import Path
from datetime import datetime, timedelta

BASE = Path(__file__).resolve().parent.parent
DATA = BASE / 'data'
DATA.mkdir(exist_ok=True)
DB = str(DATA / 'netsentinel.db')

app = FastAPI(title='Netsentinel Ultra Core API', version='1.0.0')
app.add_middleware(CORSMiddleware, allow_origins=['*'], allow_credentials=True, allow_methods=['*'], allow_headers=['*'])

def conn():
    c = sqlite3.connect(DB)
    c.row_factory = sqlite3.Row
    return c

def now(): return datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')
def hash_pw(password: str) -> str:
    salt = os.environ.get('NS_SECRET', 'netsentinel').encode()
    return hashlib.pbkdf2_hmac('sha256', password.encode(), salt, 120000).hex()

def exec_(query, params=(), fetch=False, many=False):
    with conn() as c:
        cur = c.cursor()
        if many: cur.executemany(query, params)
        else: cur.execute(query, params)
        c.commit()
        if fetch: return [dict(r) for r in cur.fetchall()]
        return cur.lastrowid

def one(query, params=()):
    with conn() as c:
        row = c.execute(query, params).fetchone()
        return dict(row) if row else None

def set_setting(key, value):
    exec_("INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value", (key, json.dumps(value)))

def get_setting(key, default=None):
    row = one("SELECT value FROM settings WHERE key=?", (key,))
    if not row: return default
    try: return json.loads(row['value'])
    except: return row['value']

def seed():
    set_setting('setup_complete', False)
    set_setting('device_name', 'Netsentinel Ultra Core')
    set_setting('management_ip', '192.168.50.1')
    set_setting('remote_login', True)
    set_setting('failover_mode', 'Auto')
    set_setting('ids_mode', 'Detect + block')
    set_setting('geo_default_direction', 'Outbound')
    set_setting('vpn_default_provider', 'WireGuard')
    set_setting('topology_refresh', '30s')
    devices = [
        ('192.168.50.48','Dhruval-pc','192.168.50.48','trusted','12.4 GB',1,0,1,'none',0),
        ('192.168.50.2','Netcore AP','192.168.50.2','core','4.2 GB',1,0,1,'none',0),
        ('192.168.50.29','TPLINK-UPLINK','192.168.50.29','restricted','1.8 GB',0,1,0,'none',0),
        ('192.168.50.111','RaspberryPi-NS','192.168.50.111','monitored','860 MB',1,0,1,'WireGuard',1),
        ('192.168.50.17','Finance-Desktop','192.168.50.17','trusted','2.4 GB',1,0,1,'OpenVPN',1),
        ('192.168.50.222','Guest-Gateway','192.168.50.222','restricted','240 MB',1,1,1,'none',0)
    ]
    exec_("DELETE FROM devices")
    exec_("INSERT INTO devices(ip,alias,bound_ip,status,traffic,active,blocked,internet_linked,vpn_provider,vpn_connected) VALUES(?,?,?,?,?,?,?,?,?,?)", devices, many=True)
    rows = exec_("SELECT id, ip, alias FROM devices", fetch=True)
    events = []
    for idx, d in enumerate(rows[:4], start=1):
        stamp1 = (datetime.utcnow()-timedelta(hours=idx)).strftime('%Y-%m-%d %H:%M')
        stamp2 = (datetime.utcnow()-timedelta(hours=idx, minutes=24)).strftime('%Y-%m-%d %H:%M')
        events.append((d['id'], 'Requested github.com', 'Firewall' if idx%2==0 else 'DNS / TLS', stamp1, json.dumps([f"Alias: {d['alias']}", f"IP: {d['ip']}", 'Traffic delta observed', 'Policy state checked'])))
        events.append((d['id'], 'Uploaded design archive', 'Transfer', stamp2, json.dumps([f"Alias: {d['alias']}", 'Upload burst allowed', 'QoS high priority granted'])))
    exec_("DELETE FROM time_events")
    exec_("INSERT INTO time_events(device_id,summary,category,at,details) VALUES(?,?,?,?,?)", events, many=True)
    exec_("DELETE FROM topology_nodes")
    nodes = [
        ('Netsentinel Core','10.0.0.1',1,None),
        ('Netsentinel Branch • Factory','10.20.0.1',1,1),
        ('Netsentinel Branch • Office','10.30.0.1',1,1)
    ]
    exec_("INSERT INTO topology_nodes(name,ip,online,parent_id) VALUES(?,?,?,?)", nodes, many=True)
    exec_("DELETE FROM policies")
    sample_policies = [
        ('firewall', json.dumps({'scope':'Single IP','action':'Deny','port':'443','target':'192.168.50.222','notes':'blocked test host'}), 1, now()),
        ('qos', json.dumps({'profile':'High priority','target':'192.168.50.48','download':'80 Mbps','upload':'20 Mbps','notes':'gaming boost'}), 1, now()),
        ('geo', json.dumps({'scope':'Whole network','direction':'Outbound','region':'Africa','action':'Block','notes':'temporary restriction'}), 1, now()),
        ('ids_ips', json.dumps({'mode':'Detect + block','target':'192.168.50.0/24','sensitivity':'High','notes':'scan detection'}), 1, now()),
        ('nat', json.dumps({'rule_type':'Port forward','external':'203.0.113.20:443','internal':'192.168.50.48:8443','protocol':'TCP','notes':'dashboard publish'}), 1, now()),
        ('vpn', json.dumps({'account':'WireGuard','region':'India','scope':'Single IP','target':'192.168.50.111','notes':'office device tunnel'}), 1, now())
    ]
    exec_("INSERT INTO policies(kind,payload,active,created_at) VALUES(?,?,?,?)", sample_policies, many=True)
    exec_("DELETE FROM alerts")
    alerts = [
        ('Port scan detected', '192.168.50.117 scanned 58 hosts in 34s', 'warning', now()),
        ('QoS policy applied', 'Gaming VLAN capped at 70 Mbps', 'info', now()),
        ('Geo block triggered', 'Outbound request to blocked region dropped', 'critical', now()),
        ('Device connected', 'Finance-Desktop joined the network', 'info', now()),
        ('Device disconnected', 'TPLINK-UPLINK disconnected from internet link', 'warning', now())
    ]
    exec_("INSERT INTO alerts(title,message,severity,created_at) VALUES(?,?,?,?)", alerts, many=True)
    exec_("DELETE FROM destinations")
    dests = [
        (1, 'github.com', 182), (1, 'api.openai.com', 61), (1, 'slack.com', 39),
        (2, 'n-deventry-gw.tplinkcloud.com', 221), (2, 'dns.google', 117),
        (4, 'wireguard.com', 48), (4, 'reddit.com', 29), (5, 'microsoft.com', 94)
    ]
    exec_("INSERT INTO destinations(device_id,domain,hits) VALUES(?,?,?)", dests, many=True)
    exec_("DELETE FROM supervisor")
    superv = [
        ('G6 Pro Bullet','ECS 24 PoE 01','1 minute','30 minutes','stable'),
        ('G6 Pro Turret','ECS 48 PoE 01','1 minute','30 minutes','stable'),
        ('ECS 24 PoE 03','ECS 48 PoE 03','1 minute','5 minutes','none')
    ]
    exec_("INSERT INTO supervisor(device,power_source,heartbeat_window,recovery_window,state) VALUES(?,?,?,?,?)", superv, many=True)
    exec_("DELETE FROM vlans")
    exec_("INSERT INTO vlans(name,cidr) VALUES(?,?)", [('Work','192.168.50.0/24'),('Guest','192.168.60.0/24'),('IoT','192.168.70.0/24')], many=True)

def init_db():
    with conn() as c:
        c.executescript("""
        CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY, username TEXT UNIQUE, password_hash TEXT, created_at TEXT);
        CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY, user_id INTEGER, expires_at TEXT);
        CREATE TABLE IF NOT EXISTS settings(key TEXT PRIMARY KEY, value TEXT);
        CREATE TABLE IF NOT EXISTS devices(id INTEGER PRIMARY KEY, ip TEXT, alias TEXT, bound_ip TEXT, status TEXT, traffic TEXT, active INTEGER, blocked INTEGER, internet_linked INTEGER, vpn_provider TEXT, vpn_connected INTEGER);
        CREATE TABLE IF NOT EXISTS time_events(id INTEGER PRIMARY KEY, device_id INTEGER, summary TEXT, category TEXT, at TEXT, details TEXT);
        CREATE TABLE IF NOT EXISTS topology_nodes(id INTEGER PRIMARY KEY, name TEXT, ip TEXT, online INTEGER, parent_id INTEGER);
        CREATE TABLE IF NOT EXISTS policies(id INTEGER PRIMARY KEY, kind TEXT, payload TEXT, active INTEGER, created_at TEXT);
        CREATE TABLE IF NOT EXISTS alerts(id INTEGER PRIMARY KEY, title TEXT, message TEXT, severity TEXT, created_at TEXT);
        CREATE TABLE IF NOT EXISTS destinations(id INTEGER PRIMARY KEY, device_id INTEGER, domain TEXT, hits INTEGER);
        CREATE TABLE IF NOT EXISTS supervisor(id INTEGER PRIMARY KEY, device TEXT, power_source TEXT, heartbeat_window TEXT, recovery_window TEXT, state TEXT);
        CREATE TABLE IF NOT EXISTS vlans(id INTEGER PRIMARY KEY, name TEXT, cidr TEXT);
        """)
        c.commit()
    if not one("SELECT key, value FROM settings WHERE key='setup_complete'"):
        seed()

class SetupIn(BaseModel):
    device_name: str
    username: str
    password: str
    remote_login: bool = True
class LoginIn(BaseModel):
    username: str
    password: str

@app.on_event('startup')
def startup(): init_db()

def auth(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith('Bearer '):
        raise HTTPException(401, 'Missing token')
    token = authorization.split(' ',1)[1]
    row = one('SELECT user_id, expires_at FROM sessions WHERE token=?', (token,))
    if not row: raise HTTPException(401, 'Invalid token')
    if row['expires_at'] < now(): raise HTTPException(401, 'Expired token')
    user = one('SELECT * FROM users WHERE id=?', (row['user_id'],))
    if not user: raise HTTPException(401, 'No user')
    return user

@app.get('/api/auth/setup-status')
def setup_status():
    return {'ready': bool(get_setting('setup_complete', False)), 'device_name': get_setting('device_name', 'Netsentinel Ultra Core')}

@app.post('/api/auth/setup')
def setup(data: SetupIn):
    if get_setting('setup_complete', False):
        raise HTTPException(400, 'Setup already completed')
    exec_('INSERT INTO users(username,password_hash,created_at) VALUES(?,?,?)', (data.username, hash_pw(data.password), now()))
    set_setting('setup_complete', True)
    set_setting('device_name', data.device_name)
    set_setting('remote_login', data.remote_login)
    return {'ok': True}

@app.post('/api/auth/login')
def login(data: LoginIn):
    user = one('SELECT * FROM users WHERE username=?', (data.username,))
    if not user or user['password_hash'] != hash_pw(data.password):
        raise HTTPException(401, 'Invalid credentials')
    token = secrets.token_urlsafe(32)
    expires = (datetime.utcnow()+timedelta(days=7)).strftime('%Y-%m-%d %H:%M:%S')
    exec_('INSERT OR REPLACE INTO sessions(token,user_id,expires_at) VALUES(?,?,?)', (token, user['id'], expires))
    return {'token': token, 'username': user['username']}

@app.get('/api/auth/me')
def me(user=Depends(auth)):
    return {'username': user['username'], 'remote_login': get_setting('remote_login', True)}

@app.get('/api/overview')
def overview(user=Depends(auth)):
    devices = exec_('SELECT * FROM devices', fetch=True)
    top_dest = exec_('SELECT domain, SUM(hits) as hits FROM destinations GROUP BY domain ORDER BY hits DESC LIMIT 6', fetch=True)
    return {
        'summary': {'rx_mbps': 92.4, 'tx_mbps': 28.7, 'active_devices': sum(d['active'] for d in devices), 'blocked_devices': sum(d['blocked'] for d in devices)},
        'graph': [22, 29, 31, 37, 42, 49, 44, 58],
        'top_destinations': top_dest,
        'devices': devices,
        'settings': {'remote_login': get_setting('remote_login', True)},
        'vlan_count': len(exec_('SELECT * FROM vlans', fetch=True)),
        'vpn_active': sum(d['vpn_connected'] for d in devices),
        'ids_mode': get_setting('ids_mode', 'Detect + block')
    }

@app.get('/api/devices')
def get_devices(user=Depends(auth)):
    return exec_('SELECT * FROM devices ORDER BY id', fetch=True)

@app.post('/api/devices/{device_id}')
def update_device(device_id: int, payload: Dict[str, Any], user=Depends(auth)):
    device = one('SELECT * FROM devices WHERE id=?', (device_id,))
    if not device: raise HTTPException(404, 'Device not found')
    alias = payload.get('alias', device['alias'])
    bound_ip = payload.get('bound_ip', device['bound_ip'])
    active = int(payload.get('active', device['active']))
    exec_('UPDATE devices SET alias=?, bound_ip=?, active=? WHERE id=?', (alias, bound_ip, active, device_id))
    exec_('INSERT INTO alerts(title,message,severity,created_at) VALUES(?,?,?,?)', ('Device updated', f'{alias} metadata changed', 'info', now()))
    return {'ok': True}

@app.post('/api/devices/{device_id}/toggle-block')
def toggle_block(device_id: int, user=Depends(auth)):
    device = one('SELECT * FROM devices WHERE id=?', (device_id,))
    if not device: raise HTTPException(404, 'Device not found')
    blocked = 0 if device['blocked'] else 1
    status = 'restricted' if blocked else 'trusted'
    exec_('UPDATE devices SET blocked=?, status=? WHERE id=?', (blocked, status, device_id))
    exec_('INSERT INTO alerts(title,message,severity,created_at) VALUES(?,?,?,?)', ('Device blocked' if blocked else 'Device unblocked', f"{device['alias']} is now {'blocked' if blocked else 'allowed'}", 'warning' if blocked else 'info', now()))
    return {'ok': True, 'blocked': bool(blocked)}

@app.get('/api/time-machine/{device_id}')
def time_machine(device_id: int, user=Depends(auth)):
    d = one('SELECT * FROM devices WHERE id=?', (device_id,))
    if not d: raise HTTPException(404, 'Device not found')
    rows = exec_('SELECT * FROM time_events WHERE device_id=? ORDER BY at DESC', (device_id,), fetch=True)
    for r in rows:
        r['alias'] = d['alias']
        r['ip'] = d['ip']
        r['details'] = json.loads(r['details']) if isinstance(r['details'], str) else r['details']
    return rows

@app.get('/api/topology')
def topology(user=Depends(auth)):
    nodes = exec_('SELECT * FROM topology_nodes ORDER BY id', fetch=True)
    devices = exec_('SELECT * FROM devices ORDER BY id', fetch=True)
    root = next((n for n in nodes if n['parent_id'] is None), None)
    children = []
    if root:
        for n in nodes:
            if n['parent_id'] == root['id']:
                ds = [d for d in devices if d['id'] % 2 == n['id'] % 2 or d['id'] in (1,4)]
                children.append({'node': n, 'devices': ds[:3]})
    return {'root': root, 'children': children}

@app.post('/api/topology/node')
def add_node(payload: Dict[str, Any], user=Depends(auth)):
    return {'id': exec_('INSERT INTO topology_nodes(name,ip,online,parent_id) VALUES(?,?,?,?)', (payload.get('name','Node'), payload.get('ip','10.0.0.2'), 1, 1))}

@app.post('/api/topology/node/{node_id}')
def update_node(node_id: int, payload: Dict[str, Any], user=Depends(auth)):
    node = one('SELECT * FROM topology_nodes WHERE id=?', (node_id,))
    if not node: raise HTTPException(404, 'Node not found')
    exec_('UPDATE topology_nodes SET name=? WHERE id=?', (payload.get('name', node['name']), node_id))
    return {'ok': True}

@app.delete('/api/topology/node/{node_id}')
def delete_node(node_id: int, user=Depends(auth)):
    exec_('DELETE FROM topology_nodes WHERE id=?', (node_id,))
    return {'ok': True}

@app.post('/api/topology/link')
def link_node(payload: Dict[str, Any], user=Depends(auth)):
    exec_('UPDATE topology_nodes SET parent_id=? WHERE id=?', (payload['parent_id'], payload['child_id']))
    return {'ok': True}

@app.post('/api/topology/unlink')
def unlink_node(payload: Dict[str, Any], user=Depends(auth)):
    exec_('UPDATE topology_nodes SET parent_id=NULL WHERE id=?', (payload['child_id'],))
    return {'ok': True}

@app.post('/api/topology/device-link/{device_id}')
def device_link(device_id: int, payload: Dict[str, Any], user=Depends(auth)):
    exec_('UPDATE devices SET internet_linked=? WHERE id=?', (1 if payload.get('internet_linked') else 0, device_id))
    return {'ok': True}

@app.get('/api/supervisor')
def get_supervisor(user=Depends(auth)):
    return exec_('SELECT * FROM supervisor ORDER BY id', fetch=True)

@app.get('/api/policies/{kind}')
def get_policies(kind: str, user=Depends(auth)):
    rows = exec_('SELECT * FROM policies WHERE kind=? ORDER BY id DESC', (kind,), fetch=True)
    for r in rows: r['payload'] = json.loads(r['payload'])
    return rows

@app.post('/api/policies/{kind}')
def add_policy(kind: str, payload: Dict[str, Any], user=Depends(auth)):
    exec_('INSERT INTO policies(kind,payload,active,created_at) VALUES(?,?,?,?)', (kind, json.dumps(payload), 1, now()))
    exec_('INSERT INTO alerts(title,message,severity,created_at) VALUES(?,?,?,?)', (f'{kind} policy saved', f'Policy saved for {kind}', 'info', now()))
    return {'ok': True}

@app.get('/api/alerts')
def get_alerts(user=Depends(auth)):
    return exec_('SELECT * FROM alerts ORDER BY id DESC', fetch=True)

@app.get('/api/destinations')
def get_destinations(user=Depends(auth)):
    devices = exec_('SELECT * FROM devices', fetch=True)
    rows = []
    for d in devices:
        entries = exec_('SELECT domain, hits FROM destinations WHERE device_id=? ORDER BY hits DESC', (d['id'],), fetch=True)
        rows.append({'device_id': d['id'], 'alias': d['alias'], 'ip': d['ip'], 'entries': entries})
    return rows

@app.get('/api/vlans')
def get_vlans(user=Depends(auth)):
    return exec_('SELECT * FROM vlans ORDER BY id', fetch=True)

@app.post('/api/vlans')
def add_vlan(payload: Dict[str, Any], user=Depends(auth)):
    exec_('INSERT INTO vlans(name,cidr) VALUES(?,?)', (payload.get('name','New VLAN'), payload.get('cidr','192.168.80.0/24')))
    return {'ok': True}

@app.get('/api/settings')
def get_settings(user=Depends(auth)):
    keys = ['device_name','management_ip','remote_login','failover_mode','ids_mode','geo_default_direction','vpn_default_provider','topology_refresh']
    return {k: get_setting(k) for k in keys}

@app.post('/api/settings')
def save_settings(payload: Dict[str, Any], user=Depends(auth)):
    for k, v in payload.items(): set_setting(k, v)
    return {'ok': True}
