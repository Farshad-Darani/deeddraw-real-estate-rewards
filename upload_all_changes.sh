#!/bin/bash

# VPS connection details
VPS_USER="root"
VPS_HOST="194.238.17.204"
VPS_PATH="/var/www/deeddraw"

echo "Uploading all modified HTML and CSS files to VPS..."

# Upload all HTML files
echo "Uploading HTML files..."
scp index.html prizes.html winners.html contact.html register.html how-it-works.html \
    leaderboard.html dashboard.html faqs.html login.html reset-password.html verify-email.html \
    rules.html blog.html admin.html admin-panel.html \
    ${VPS_USER}@${VPS_HOST}:${VPS_PATH}/

# Upload all CSS files
echo "Uploading CSS files..."
scp styles.css prizes.css winners.css contact.css register.css leaderboard.css \
    faqs.css rules.css how-it-works.css admin.css \
    ${VPS_USER}@${VPS_HOST}:${VPS_PATH}/

echo "Upload complete!"
