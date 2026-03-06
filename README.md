This project provides a lightweight Node.js/Express control panel combined with a configurable VLESS/VMess/Trojan/Shadowsocks backend and optional Cloudflare Argo Tunnel, ttyd web terminal, and filebrowser. It is adapted to run in restricted environments such as Replit by removing unsupported system‑level dependencies and simplifying background process management.

Project Overview
The application consists of:

An Express server (server.js) providing:

Basic authentication

System information endpoints

A reverse proxy to the local VLESS/VMess/Trojan/Shadowsocks service (web.js)

A downloader for the backend binary (web.js)

A shell bootstrapper (entrypoint.sh) that:

Generates configuration files

Downloads and launches Cloudflare Argo Tunnel

Downloads and launches ttyd (web terminal)

Downloads and launches filebrowser

Starts the backend service (web.js)

All Nezha‑related code has been removed.

Running on Replit
Replit supports Node.js applications and can run this project with a few adjustments:

Use node server.js as the main process.

Allow entrypoint.sh to run once at startup to generate configuration and launch optional components.

Avoid system commands that are unavailable in Replit (e.g., pgrep, ss, mount checks).

Ensure all downloaded binaries are Linux x86_64 compatible.

Environment Variables
Set these in Replit Secrets:

WEB_USERNAME — Basic auth username

WEB_PASSWORD — Basic auth password

UUID — Client ID for VLESS/VMess/Trojan/SS

WSPATH — WebSocket path prefix

ARGO_AUTH — Cloudflare Argo token or JSON

ARGO_DOMAIN — Custom domain for Argo

SSH_DOMAIN — Domain for ttyd (optional)

FTP_DOMAIN — Domain for filebrowser (optional)

File Structure
Code
.
├── server.js
├── entrypoint.sh
├── package.json
├── config.json (generated)
├── web.js (downloaded)
├── argo.sh (generated)
├── ttyd.sh (generated)
├── filebrowser.sh (generated)
└── list (generated)
How to Run
Import the repository into Replit.

Add required environment variables.

Ensure entrypoint.sh and generated scripts have execute permission.

Run the project using:

Code
node server.js
The Express server will start and automatically trigger the bootstrap process.

Endpoints
/ — Hello world (protected by basic auth)

/status — Process list

/listen — Listening ports

/info — System info

/list — Exported node list

/download — Download backend binary

Reverse proxy to backend on all other paths

Notes
Replit free tier may sleep after inactivity.

Long‑running background processes may restart; the system is designed to tolerate this.

Auto‑delete scripts have been removed for safety.