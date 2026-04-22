# Netsentinel Ultra Core

Netsentinel Ultra Core is a GitHub-ready starter platform for a self-hosted network gateway dashboard.

## Included
- Premium animated Next.js dashboard UI
- FastAPI backend with local SQLite storage
- Local user login and first-time setup flow
- Device inventory with block/unblock, alias editing, bound IP editing, active status
- Time Machine timeline for the last 24 hours per device
- Editable topology tree with link/unlink controls
- Supervisor, Firewall, QoS, Geo, IDS/IPS, NAT, VPN, Alerts, Destinations, VLAN, Settings pages
- Policy persistence to local hardware storage via SQLite

## Honest note
This package gives you the UI, data model, persistence, API, login flow, and policy editing experience. It does **not** turn a Linux box into a fully fledged deep packet inspection gateway by itself. Real packet enforcement, tc shaping, nftables orchestration, WireGuard/OpenVPN provisioning, and topology auto-discovery still need dataplane implementation.

## Quick start
### Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --host 0.0.0.0 --port 5000
```

### Frontend
```bash
cd frontend
cp .env.example .env.local
npm install
npm run build
npm run start
```

Open:
- Frontend: `http://SERVER_IP:3001`
- Backend docs: `http://SERVER_IP:5000/docs`
