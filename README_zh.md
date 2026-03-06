本專案是一個輕量級的 Node.js/Express 控制面板，搭配可設定的 VLESS/VMess/Trojan/Shadowsocks 後端服務，以及可選的 Cloudflare Argo Tunnel、ttyd 網頁終端機與 filebrowser。為了能在 Replit 等受限環境運行，已移除不支援的系統指令並簡化背景程序管理。

專案概述
本專案包含：

Express 伺服器（server.js），提供：

基本驗證

系統資訊 API

反向代理至本地後端服務（web.js）

自動下載後端執行檔（web.js）

Shell 啟動腳本（entrypoint.sh），負責：

產生設定檔

下載並啟動 Cloudflare Argo Tunnel

下載並啟動 ttyd（網頁終端機）

下載並啟動 filebrowser

啟動後端服務（web.js）

所有哪吒（Nezha）相關程式碼已完全移除。

在 Replit 上運行
Replit 支援 Node.js，並可在以下調整後順利運行本專案：

主程序使用 node server.js

啟動時讓 entrypoint.sh 執行一次以產生設定與啟動附加服務

避免使用 Replit 不支援的系統指令（如 pgrep、ss、mount）

確保下載的二進位檔為 Linux x86_64

必要環境變數（Replit Secrets）
WEB_USERNAME — 基本驗證帳號

WEB_PASSWORD — 基本驗證密碼

UUID — VLESS/VMess/Trojan/SS 客戶端 ID

WSPATH — WebSocket 路徑前綴

ARGO_AUTH — Cloudflare Argo Token 或 JSON

ARGO_DOMAIN — Argo 自訂網域

SSH_DOMAIN — ttyd 使用的網域（可選）

FTP_DOMAIN — filebrowser 使用的網域（可選）

檔案結構
Code
.
├── server.js
├── entrypoint.sh
├── package.json
├── config.json（自動產生）
├── web.js（下載）
├── argo.sh（自動產生）
├── ttyd.sh（自動產生）
├── filebrowser.sh（自動產生）
└── list（自動產生）
執行方式
將 repo 匯入 Replit

設定必要環境變數

確保 entrypoint.sh 與相關腳本具有執行權限

執行：

Code
node server.js
Express 啟動後會自動觸發初始化流程。

API 路由
/ — Hello world（需基本驗證）

/status — 系統程序列表

/listen — 系統監聽端口

/info — 系統資訊

/list — 節點資訊匯出

/download — 下載後端執行檔

其他路由皆反向代理至後端服務

注意事項
Replit 免費方案會在閒置後休眠

長時間背景程序可能被重啟，本專案已盡量容錯

自動刪除 .git 等高風險腳本已移除