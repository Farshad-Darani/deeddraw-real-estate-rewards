#!/usr/bin/expect -f
set timeout 120

puts "\n=== Uploading HTML files ===\n"

# Upload index.html
spawn scp -P 65002 index.html u451414668@157.173.209.140:domains/deeddraw.com/public_html/
expect "password:"
send "D1farshad1234?\r"
expect eof

# Upload prizes.html
spawn scp -P 65002 prizes.html u451414668@157.173.209.140:domains/deeddraw.com/public_html/
expect "password:"
send "D1farshad1234?\r"
expect eof

# Upload winners.html
spawn scp -P 65002 winners.html u451414668@157.173.209.140:domains/deeddraw.com/public_html/
expect "password:"
send "D1farshad1234?\r"
expect eof

# Upload contact.html
spawn scp -P 65002 contact.html u451414668@157.173.209.140:domains/deeddraw.com/public_html/
expect "password:"
send "D1farshad1234?\r"
expect eof

# Upload register.html
spawn scp -P 65002 register.html u451414668@157.173.209.140:domains/deeddraw.com/public_html/
expect "password:"
send "D1farshad1234?\r"
expect eof

# Upload how-it-works.html
spawn scp -P 65002 how-it-works.html u451414668@157.173.209.140:domains/deeddraw.com/public_html/
expect "password:"
send "D1farshad1234?\r"
expect eof

# Upload leaderboard.html
spawn scp -P 65002 leaderboard.html u451414668@157.173.209.140:domains/deeddraw.com/public_html/
expect "password:"
send "D1farshad1234?\r"
expect eof

# Upload dashboard.html
spawn scp -P 65002 dashboard.html u451414668@157.173.209.140:domains/deeddraw.com/public_html/
expect "password:"
send "D1farshad1234?\r"
expect eof

# Upload faqs.html
spawn scp -P 65002 faqs.html u451414668@157.173.209.140:domains/deeddraw.com/public_html/
expect "password:"
send "D1farshad1234?\r"
expect eof

puts "\n=== Uploading CSS files ===\n"

# Upload styles.css
spawn scp -P 65002 styles.css u451414668@157.173.209.140:domains/deeddraw.com/public_html/
expect "password:"
send "D1farshad1234?\r"
expect eof

# Upload prizes.css
spawn scp -P 65002 prizes.css u451414668@157.173.209.140:domains/deeddraw.com/public_html/
expect "password:"
send "D1farshad1234?\r"
expect eof

# Upload winners.css
spawn scp -P 65002 winners.css u451414668@157.173.209.140:domains/deeddraw.com/public_html/
expect "password:"
send "D1farshad1234?\r"
expect eof

# Upload contact.css
spawn scp -P 65002 contact.css u451414668@157.173.209.140:domains/deeddraw.com/public_html/
expect "password:"
send "D1farshad1234?\r"
expect eof

# Upload register.css
spawn scp -P 65002 register.css u451414668@157.173.209.140:domains/deeddraw.com/public_html/
expect "password:"
send "D1farshad1234?\r"
expect eof

# Upload leaderboard.css
spawn scp -P 65002 leaderboard.css u451414668@157.173.209.140:domains/deeddraw.com/public_html/
expect "password:"
send "D1farshad1234?\r"
expect eof

# Upload faqs.css
spawn scp -P 65002 faqs.css u451414668@157.173.209.140:domains/deeddraw.com/public_html/
expect "password:"
send "D1farshad1234?\r"
expect eof

# Upload how-it-works.css
spawn scp -P 65002 how-it-works.css u451414668@157.173.209.140:domains/deeddraw.com/public_html/
expect "password:"
send "D1farshad1234?\r"
expect eof

puts "\n=== Upload Complete! ===\n"
