# Deployment Script Template
# Copy this and create your own deployment script with actual credentials

#!/bin/bash

# EXAMPLE - DO NOT USE AS IS
# Replace with your actual server credentials

VPS_USER="your_username"
VPS_HOST="your_server_ip"
VPS_PASSWORD="your_secure_password"
VPS_PATH="/path/to/your/app"

# Upload files
scp your_file.html $VPS_USER@$VPS_HOST:$VPS_PATH/

# Restart server
ssh $VPS_USER@$VPS_HOST "cd $VPS_PATH && pm2 restart your-app"

echo "Deployment complete!"
