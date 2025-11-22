#!/bin/bash
# Quick restart script for DeedDraw backend server

echo "🔄 Restarting DeedDraw backend server..."

sshpass -p '@Deeddraw1974' ssh -p 65002 -o StrictHostKeyChecking=no u451414668@157.173.209.140 << 'ENDSSH'
cd /home/u451414668/domains/deeddraw.com/public_html/backend

echo "Stopping any existing processes..."
/opt/alt/alt-nodejs22/root/usr/bin/node node_modules/pm2/bin/pm2 delete deeddraw-api 2>/dev/null || true

echo "Starting fresh..."
/opt/alt/alt-nodejs22/root/usr/bin/node node_modules/pm2/bin/pm2 start ecosystem.config.js

sleep 2

# Show status
echo ""
echo "Current status:"
/opt/alt/alt-nodejs22/root/usr/bin/node node_modules/pm2/bin/pm2 status

echo ""
echo "Testing API..."
curl -s http://localhost:65002/api/health | head -c 100
echo ""
ENDSSH

echo ""
echo "✅ Done! Check status above."
