# DeedDraw - Real Estate Rewards Platform

A full-stack web application that rewards real estate professionals with prize draws based on their transaction volume.

## 🚀 Features

- **User Authentication**: Secure registration, login, email verification, and password reset
- **Points System**: Automatic point calculation based on transaction values
- **Prize Draws**: Periodic draws with tiered prizes ($250K, $150K, $100K)
- **Leaderboard**: Real-time ranking of participants
- **Admin Dashboard**: Comprehensive management tools for transactions, users, and draws
- **Referral System**: Discount codes for user acquisition
- **Email Notifications**: Automated emails for verifications, approvals, and confirmations
- **Certificate Generation**: PDF certificates for winners with unique tracking numbers
- **Responsive Design**: Optimized for desktop, laptop, tablet, and mobile devices

## 🛠️ Tech Stack

### Frontend
- HTML5, CSS3, JavaScript (ES6+)
- Responsive design with custom CSS
- Font Awesome icons
- Dynamic animations and transitions

### Backend
- Node.js with Express.js
- MySQL database with connection pooling
- Sequelize ORM
- RESTful API architecture

### Infrastructure
- VPS hosting with PM2 process management
- NGINX reverse proxy
- SSL/TLS encryption
- Hostinger email service (SMTP)

### Key Libraries
- **jsPDF**: PDF generation for certificates
- **Nodemailer**: Email delivery system
- **bcryptjs**: Password hashing
- **crypto**: Secure token generation

## 📂 Project Structure

```
├── backend/
│   ├── server.js              # Express server
│   ├── config/
│   │   └── database.js        # Database configuration
│   ├── controllers/           # Business logic
│   ├── models/                # Database models (Sequelize)
│   ├── routes/                # API endpoints
│   ├── middleware/            # Authentication & validation
│   └── utils/                 # Helper functions (email, etc.)
├── assets/
│   └── images/                # Logo, graphics, backgrounds
├── index.html                 # Landing page
├── dashboard.html             # User dashboard
├── admin-panel.html           # Admin interface
├── styles.css                 # Global styles (7700+ lines)
└── *.js                       # Page-specific JavaScript
```

## 🔐 Security Features

- Password hashing with bcrypt
- JWT-like token authentication
- SQL injection prevention via Sequelize ORM
- CORS configuration
- Rate limiting on API endpoints
- Secure session management
- Email verification for new accounts
- Two-step password reset process

## 📊 Database Schema

- **Users**: Authentication, profile, points balance
- **Transactions**: Payment records, point allocations
- **Referrals**: Referral code tracking and rewards
- **Withdrawals**: Prize withdrawal requests
- **Admin logs**: Audit trail for admin actions

## 🎨 Responsive Design

Optimized breakpoints:
- Desktop: 1920px+
- Laptop: 1366px - 1920px
- Small Laptop: 1280px - 1366px
- Tablet: 769px - 1024px
- Mobile: < 768px

## 📧 Email System

Professional email infrastructure with:
- Verification emails (noreply@deeddraw.com)
- Payment confirmations (payment@deeddraw.com)
- Contact form submissions (info@deeddraw.com)
- HTML templates with branding
- Automatic retry logic

## 🚀 Deployment

- VPS: Ubuntu with Node.js v22.21.1
- Process Manager: PM2 with systemd
- Port: 3002 (proxied through NGINX)
- Database: MySQL with automated backups
- Uptime: 99.9%+ with auto-restart on crash

## 🎯 Key Challenges Solved

1. **Responsive Design**: Comprehensive media queries for 6+ screen sizes
2. **Email Deliverability**: Migrated from Gmail to professional SMTP
3. **Certificate Generation**: Dynamic PDF creation with unique identifiers
4. **Payment Processing**: E-Transfer instructions with admin approval workflow
5. **Real-time Updates**: Dynamic leaderboard and stats
6. **Admin Tools**: CSV export, bulk operations, transaction management

## 📈 Performance

- Fast page loads with optimized assets
- Efficient database queries with indexing
- Connection pooling for scalability
- Cached static content
- Lazy loading for images

## 🔧 Development Highlights

- **7,700+ lines** of custom CSS
- **3,300+ lines** in main dashboard JavaScript
- **RESTful API** with 15+ endpoints
- **Modular architecture** with separation of concerns
- **Error handling** with graceful fallbacks
- **Comprehensive logging** for debugging

## 📝 Note

This is a production application currently serving real users. Sensitive configuration files (database credentials, API keys, deployment scripts) are excluded from this repository for security reasons.

---

**Developer**: Darani (Farshad)  
**Role**: Full-Stack Developer  
**Year**: 2025
