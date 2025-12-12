#!/usr/bin/expect -f
set timeout 120

puts "\n=== Uploading HTML files ===\n"

# Upload index.html
spawn scp index.html root@213.210.13.133:/var/www/deeddraw/
expect "password:"
send "@Deeddraw1974\r"
expect eof

# Upload prizes.html
spawn scp prizes.html root@213.210.13.133:/var/www/deeddraw/
expect "password:"
send "@Deeddraw1974\r"
expect eof

# Upload winners.html
spawn scp winners.html root@213.210.13.133:/var/www/deeddraw/
expect "password:"
send "@Deeddraw1974\r"
expect eof

# Upload contact.html
spawn scp contact.html root@213.210.13.133:/var/www/deeddraw/
expect "password:"
send "@Deeddraw1974\r"
expect eof

# Upload register.html
spawn scp register.html root@213.210.13.133:/var/www/deeddraw/
expect "password:"
send "@Deeddraw1974\r"
expect eof

# Upload how-it-works.html
spawn scp how-it-works.html root@213.210.13.133:/var/www/deeddraw/
expect "password:"
send "@Deeddraw1974\r"
expect eof

# Upload leaderboard.html
spawn scp leaderboard.html root@213.210.13.133:/var/www/deeddraw/
expect "password:"
send "@Deeddraw1974\r"
expect eof

# Upload dashboard.html
spawn scp dashboard.html root@213.210.13.133:/var/www/deeddraw/
expect "password:"
send "@Deeddraw1974\r"
expect eof

# Upload faqs.html
spawn scp faqs.html root@213.210.13.133:/var/www/deeddraw/
expect "password:"
send "@Deeddraw1974\r"
expect eof

puts "\n=== Uploading CSS files ===\n"

# Upload styles.css
spawn scp styles.css root@213.210.13.133:/var/www/deeddraw/
expect "password:"
send "@Deeddraw1974\r"
expect eof

# Upload prizes.css
spawn scp prizes.css root@213.210.13.133:/var/www/deeddraw/
expect "password:"
send "@Deeddraw1974\r"
expect eof

# Upload winners.css
spawn scp winners.css root@213.210.13.133:/var/www/deeddraw/
expect "password:"
send "@Deeddraw1974\r"
expect eof

# Upload contact.css
spawn scp contact.css root@213.210.13.133:/var/www/deeddraw/
expect "password:"
send "@Deeddraw1974\r"
expect eof

# Upload register.css
spawn scp register.css root@213.210.13.133:/var/www/deeddraw/
expect "password:"
send "@Deeddraw1974\r"
expect eof

# Upload leaderboard.css
spawn scp leaderboard.css root@213.210.13.133:/var/www/deeddraw/
expect "password:"
send "@Deeddraw1974\r"
expect eof

# Upload faqs.css
spawn scp faqs.css root@213.210.13.133:/var/www/deeddraw/
expect "password:"
send "@Deeddraw1974\r"
expect eof

# Upload how-it-works.css
spawn scp how-it-works.css root@213.210.13.133:/var/www/deeddraw/
expect "password:"
send "@Deeddraw1974\r"
expect eof

puts "\n=== Upload Complete! ===\n"
puts "All HTML and CSS files have been uploaded successfully.\n"
