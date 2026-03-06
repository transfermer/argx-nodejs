#!/usr/bin/env bash
# 確保可執行
chmod +x ./entrypoint.sh || true
# 在 Replit 上直接執行 entrypoint（entrypoint 會產生腳本並啟動需要的二進位）
bash ./entrypoint.sh
# 若 entrypoint.sh 只是產生腳本而不阻塞，啟動 node server 以保持 Repl 運行
node server.js
