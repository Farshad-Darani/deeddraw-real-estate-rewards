#!/bin/bash
# Check if server is responding, restart if not

HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3002/api/health)

if [ "$HEALTH_CHECK" != "200" ]; then
    echo "$(date): Server is down (HTTP $HEALTH_CHECK), restarting..."
    
    # Kill any existing node processes
    pkill -f 'node server.js' 2>/dev/null
    
    # Start with PM2
    cd /home/u451414668/domains/deeddraw.com/public_html/backend
    /opt/alt/alt-nodejs22/root/usr/bin/node node_modules/.bin/pm2 start ecosystem.config.js 2>/dev/null || \
    /opt/alt/alt-nodejs22/root/usr/bin/node node_modules/.bin/pm2 restart deeddraw-api
    
    echo "$(date): Server restarted"
else
    echo "$(date): Server is healthy"
fi
