# HeroGlob Deployment Guide - Ubuntu VPS

This guide will help you deploy the HeroGlob project (Frontend, Admin, Backend) to an Ubuntu VPS with the domain **heroglobal.io.vn**.

## Prerequisites

- Ubuntu 20.04 or 22.04 VPS
- Root or sudo access
- Domain name: **heroglobal.io.vn** pointed to your VPS IP
- At least 2GB RAM recommended

---

## 1. Initial Server Setup

### Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### Install Essential Tools
```bash
sudo apt install -y curl git build-essential
```

---

## 2. Install Node.js (v18 or v20)

```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node -v
npm -v
```

---

## 3. Install MySQL

```bash
# Install MySQL Server
sudo apt install -y mysql-server

# Secure MySQL installation
sudo mysql_secure_installation

# Login to MySQL
sudo mysql

# Create database and user
CREATE DATABASE heroglob;
CREATE USER 'heroglob_user'@'localhost' IDENTIFIED BY 'your_strong_password';
GRANT ALL PRIVILEGES ON heroglob.* TO 'heroglob_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## 4. Install PM2 (Process Manager)

```bash
sudo npm install -g pm2
```

---

## 5. Install Nginx

```bash
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

## 6. Clone and Setup Project

### Clone Repository
```bash
cd /var/www
sudo git clone https://github.com/yourusername/heroglob.git
sudo chown -R $USER:$USER heroglob
cd heroglob
```

### Install Dependencies
```bash
# Backend
cd backend
npm install
cd ..

# Frontend
npm install

# Admin
cd admin
npm install
cd ..
```

---

## 7. Configure Environment Variables

### Backend Environment (.env)
```bash
cd /var/www/heroglob/backend
nano .env
```

Add the following:
```env
NODE_ENV=production
PORT=4000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=heroglob_user
DB_PASSWORD=your_strong_password
DB_DATABASE=heroglob
DB_SYNCHRONIZE=true
DB_LOGGING=false

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# CORS
CORS_ORIGIN=https://heroglobal.io.vn,https://admin.heroglobal.io.vn
```

### Frontend Environment (.env.local)
```bash
cd /var/www/heroglob
nano .env.local
```

Add:
```env
NEXT_PUBLIC_API_URL=https://api.heroglobal.io.vn/api
```

### Admin Environment (.env)
```bash
cd /var/www/heroglob/admin
nano .env
```

Add:
```env
VITE_API_BASE_URL=https://api.heroglobal.io.vn/api
```

---

## 8. Build Applications

### Build Backend
```bash
cd /var/www/heroglob/backend
npm run build
```

### Build Frontend
```bash
cd /var/www/heroglob
npm run build
```

### Build Admin
```bash
cd /var/www/heroglob/admin
npm run build
```

---

## 9. Setup PM2 Services

### Create PM2 Ecosystem File
```bash
cd /var/www/heroglob
nano ecosystem.config.js
```

Add:
```javascript
module.exports = {
  apps: [
    {
      name: 'heroglob-backend',
      cwd: '/var/www/heroglob/backend',
      script: 'dist/main.js',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
    },
    {
      name: 'heroglob-frontend',
      cwd: '/var/www/heroglob',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
    {
      name: 'heroglob-admin',
      cwd: '/var/www/heroglob/admin',
      script: 'node_modules/vite/bin/vite.js',
      args: 'preview --port 5173 --host',
      instances: 1,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
```

### Start PM2 Services
```bash
cd /var/www/heroglob
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## 10. Configure Nginx

### Create Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/heroglobal.io.vn
```

Add:
```nginx
# Backend API
server {
    listen 80;
    server_name api.heroglobal.io.vn;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Frontend
server {
    listen 80;
    server_name heroglobal.io.vn www.heroglobal.io.vn;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Admin Panel
server {
    listen 80;
    server_name admin.heroglobal.io.vn;

    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Enable Site and Restart Nginx
```bash
sudo ln -s /etc/nginx/sites-available/heroglobal.io.vn /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 11. Install SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificates for all domains
sudo certbot --nginx -d heroglobal.io.vn -d www.heroglobal.io.vn -d api.heroglobal.io.vn -d admin.heroglobal.io.vn

# Auto-renewal is set up automatically
# Test renewal
sudo certbot renew --dry-run
```

---

## 12. Configure Firewall

```bash
# Allow SSH, HTTP, HTTPS
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

---

## 13. DNS Configuration

Make sure your domain DNS has these A records pointing to your VPS IP:

```
heroglobal.io.vn        A    YOUR_VPS_IP
www.heroglobal.io.vn    A    YOUR_VPS_IP
api.heroglobal.io.vn    A    YOUR_VPS_IP
admin.heroglobal.io.vn  A    YOUR_VPS_IP
```

---

## 14. Useful PM2 Commands

```bash
# View all processes
pm2 list

# View logs
pm2 logs

# View specific app logs
pm2 logs heroglob-backend
pm2 logs heroglob-frontend
pm2 logs heroglob-admin

# Restart apps
pm2 restart all
pm2 restart heroglob-backend

# Stop apps
pm2 stop all

# Monitor
pm2 monit
```

---

## 15. Deployment Updates

When you need to update the code:

```bash
cd /var/www/heroglob

# Pull latest code
git pull

# Backend
cd backend
npm install
npm run build
pm2 restart heroglob-backend

# Frontend
cd ..
npm install
npm run build
pm2 restart heroglob-frontend

# Admin
cd admin
npm install
npm run build
pm2 restart heroglob-admin
```

---

## 16. Backup Database

### Create Backup Script
```bash
nano /var/www/heroglob/backup-db.sh
```

Add:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/mysql"
mkdir -p $BACKUP_DIR

mysqldump -u heroglob_user -p'your_strong_password' heroglob > $BACKUP_DIR/heroglob_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "heroglob_*.sql" -mtime +7 -delete
```

Make executable:
```bash
chmod +x /var/www/heroglob/backup-db.sh
```

### Setup Cron Job (Daily Backup at 2 AM)
```bash
crontab -e
```

Add:
```
0 2 * * * /var/www/heroglob/backup-db.sh
```

---

## 17. Monitoring & Logs

### View Nginx Logs
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### View PM2 Logs
```bash
pm2 logs --lines 100
```

### Check System Resources
```bash
htop
pm2 monit
```

---

## Troubleshooting

### If backend won't start:
```bash
cd /var/www/heroglob/backend
npm run build
pm2 restart heroglob-backend
pm2 logs heroglob-backend
```

### If frontend won't start:
```bash
cd /var/www/heroglob
npm run build
pm2 restart heroglob-frontend
pm2 logs heroglob-frontend
```

### Check if ports are in use:
```bash
sudo netstat -tulpn | grep :3000
sudo netstat -tulpn | grep :4000
sudo netstat -tulpn | grep :5173
```

### Restart all services:
```bash
pm2 restart all
sudo systemctl restart nginx
```

---

## Security Recommendations

1. **Change default MySQL password**
2. **Use strong JWT secret**
3. **Keep system updated**: `sudo apt update && sudo apt upgrade`
4. **Monitor logs regularly**
5. **Setup fail2ban** for SSH protection:
   ```bash
   sudo apt install fail2ban
   sudo systemctl enable fail2ban
   ```

---

## Your URLs After Deployment

- **Frontend**: https://heroglobal.io.vn
- **Admin Panel**: https://admin.heroglobal.io.vn
- **API**: https://api.heroglobal.io.vn/api

---

## Support

If you encounter issues:
1. Check PM2 logs: `pm2 logs`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Verify DNS settings
4. Ensure all environment variables are set correctly
5. Check firewall settings: `sudo ufw status`

---

**Deployment Complete! 🎉**
