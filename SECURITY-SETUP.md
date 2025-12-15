# 🔒 SECURITY SETUP GUIDE

## ⚠️ IMPORTANT: Before Running This Application

This repository does NOT include sensitive credentials. You must set up your own configuration.

## Required Configuration Files

### 1. Backend Environment Variables

Create `backend/.env` file (use `backend/.env.example` as template):

```bash
cp backend/.env.example backend/.env
```

Then edit `backend/.env` with your actual values:
- Database credentials
- JWT secret (generate random string)
- Email/SMTP credentials
- API keys

### 2. Database Configuration

Create `backend/config/database.js` (use `backend/config/database.example.js` as template):

```bash
cp backend/config/database.example.js backend/config/database.js
```

Update with your database connection details.

### 3. Deployment Scripts (Optional)

If deploying to VPS, create your own deployment scripts based on `deployment-template.sh`.

**Never commit scripts with passwords or server IPs!**

## Files You Must Create (Not in Git)

These files are in `.gitignore` for security:

- `backend/.env` - Environment variables
- `backend/config/database.js` - Database credentials  
- `ssh_*.sh` - Any deployment scripts with credentials
- `*.sql` - Database backups

## Security Best Practices

### ✅ DO:
- Use environment variables for all secrets
- Keep `.env` files local only
- Use strong, unique passwords
- Rotate credentials regularly
- Use HTTPS in production
- Keep dependencies updated

### ❌ DON'T:
- Commit passwords or API keys
- Hardcode credentials in source code
- Share `.env` files publicly
- Use default/weak passwords
- Expose database directly to internet

## Database Setup

1. Create a MySQL database
2. Run migrations from `backend/migrations/` folder:

```bash
mysql -u your_user -p your_database < backend/migrations/migration_file.sql
```

## Quick Start After Setup

```bash
# Install dependencies
cd backend
npm install

# Start development server
npm run dev

# Or use PM2 for production
pm2 start ecosystem.config.js
```

## Support

If you need help setting up, please open an issue (without including any sensitive information).

---

**Remember**: Never commit real credentials to version control!
