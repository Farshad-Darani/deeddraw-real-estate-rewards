#!/bin/bash
# Start server in a persistent screen session that survives SSH disconnection

echo "🚀 Starting DeedDraw server in permanent screen session..."

sshpass -p '@Deeddraw1974' ssh -p 65002 -o StrictHostKeyChecking=no u451414668@157.173.209.140 << 'ENDSSH'
cd /home/u451414668/domains/deeddraw.com/public_html/backend

# Kill any existing screen session
screen -S deeddraw -X quit 2>/dev/null || true

# Delete PM2 processes
/opt/alt/alt-nodejs22/root/usr/bin/node node_modules/pm2/bin/pm2 delete all 2>/dev/null || true

# Start new screen session with PM2
screen -dmS deeddraw bash -c "
    cd /home/u451414668/domains/deeddraw.com/public_html/backend
    /opt/alt/alt-nodejs22/root/usr/bin/node node_modules/pm2/bin/pm2 start ecosystem.config.js
    /opt/alt/alt-nodejs22/root/usr/bin/node node_modules/pm2/bin/pm2 logs
"

sleep 3

# Check status
echo ""
echo "Screen sessions:"
screen -ls

echo ""
echo "PM2 status:"
/opt/alt/alt-nodejs22/root/usr/bin/node node_modules/pm2/bin/pm2 status

echo ""
echo "API test:"
curl -s http://localhost:65002/api/health
ENDSSH

echo ""
echo "✅ Server started in persistent 'deeddraw' screen session"
echo "   It will survive SSH disconnections and keep running"
echo "   To view logs: ssh to server and run 'screen -r deeddraw'"
