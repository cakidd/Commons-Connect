#!/bin/bash
cd /home/aubre/Commons-Connect/mountainshares-backend
export NVM_DIR="/home/aubre/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
pm2 start ecosystem.config.js
