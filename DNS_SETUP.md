# DNS Configuration Guide for heroglobal.io.vn

This guide will help you configure DNS records for your HeroGlob project.

## Prerequisites

- Domain: `heroglobal.io.vn`
- VPS IP Address: (You need to know your VPS IP)
- Access to your domain registrar's DNS management panel

---

## Step 1: Find Your VPS IP Address

On your VPS, run:
```bash
curl ifconfig.me
```

Or:
```bash
hostname -I | awk '{print $1}'
```

**Note down this IP address** - you'll need it for DNS configuration.

---

## Step 2: DNS Records to Add

You need to add the following DNS records in your domain registrar's control panel:

### A Records (IPv4)

| Type | Name/Host | Value/Points To | TTL |
|------|-----------|-----------------|-----|
| A | @ | YOUR_VPS_IP | 3600 |
| A | www | YOUR_VPS_IP | 3600 |
| A | api | YOUR_VPS_IP | 3600 |
| A | admin | YOUR_VPS_IP | 3600 |

**Replace `YOUR_VPS_IP` with your actual VPS IP address**

### Explanation:
- `@` → `heroglobal.io.vn` (root domain)
- `www` → `www.heroglobal.io.vn` (www subdomain)
- `api` → `api.heroglobal.io.vn` (API subdomain)
- `admin` → `admin.heroglobal.io.vn` (Admin panel subdomain)

---

## Step 3: Common Domain Registrars Configuration

### For Cloudflare:

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select your domain `heroglobal.io.vn`
3. Go to **DNS** → **Records**
4. Click **Add record** for each:

```
Type: A
Name: @
IPv4 address: YOUR_VPS_IP
Proxy status: DNS only (gray cloud) ← IMPORTANT for SSL
TTL: Auto
```

```
Type: A
Name: www
IPv4 address: YOUR_VPS_IP
Proxy status: DNS only (gray cloud)
TTL: Auto
```

```
Type: A
Name: api
IPv4 address: YOUR_VPS_IP
Proxy status: DNS only (gray cloud)
TTL: Auto
```

```
Type: A
Name: admin
IPv4 address: YOUR_VPS_IP
Proxy status: DNS only (gray cloud)
TTL: Auto
```

**Important:** Set Proxy status to "DNS only" (gray cloud) initially. After SSL is configured, you can enable the proxy (orange cloud).

### For Other Registrars (GoDaddy, Namecheap, etc.):

1. Log in to your domain registrar
2. Find **DNS Management** or **DNS Settings**
3. Add the following A records:

| Type | Host | Points to | TTL |
|------|------|-----------|-----|
| A | @ | YOUR_VPS_IP | 1 Hour |
| A | www | YOUR_VPS_IP | 1 Hour |
| A | api | YOUR_VPS_IP | 1 Hour |
| A | admin | YOUR_VPS_IP | 1 Hour |

---

## Step 4: Verify DNS Propagation

DNS changes can take 5 minutes to 48 hours to propagate. Check the status:

### Online Tools:
- [DNS Checker](https://dnschecker.org)
- [What's My DNS](https://www.whatsmydns.net)

Enter your domain and check if it resolves to your VPS IP.

### Command Line Check:

```bash
# Check root domain
nslookup heroglobal.io.vn

# Check www
nslookup www.heroglobal.io.vn

# Check api
nslookup api.heroglobal.io.vn

# Check admin
nslookup admin.heroglobal.io.vn
```

All should return your VPS IP address.

---

## Step 5: Test on VPS

Once DNS is propagated, test from your VPS:

```bash
# Ping your domains
ping -c 4 heroglobal.io.vn
ping -c 4 api.heroglobal.io.vn
ping -c 4 admin.heroglobal.io.vn
```

---

## Step 6: After DNS is Working

Once DNS is properly configured and propagated:

1. **Install SSL certificates** (from DEPLOYMENT.md):
   ```bash
   sudo certbot --nginx -d heroglobal.io.vn -d www.heroglobal.io.vn -d api.heroglobal.io.vn -d admin.heroglobal.io.vn
   ```

2. **Test your sites**:
   - Frontend: https://heroglobal.io.vn
   - Admin: https://admin.heroglobal.io.vn
   - API: https://api.heroglobal.io.vn/api/health

---

## Troubleshooting

### DNS not resolving after 24 hours?

1. **Check nameservers**:
   ```bash
   dig heroglobal.io.vn NS
   ```
   Make sure nameservers are correct.

2. **Clear local DNS cache**:
   ```bash
   # On your local machine (Windows)
   ipconfig /flushdns
   
   # On Linux/Mac
   sudo systemd-resolve --flush-caches
   ```

3. **Check if domain is active**:
   - Verify domain hasn't expired
   - Check if nameservers are properly set

### SSL certificate fails?

If Certbot fails with "DNS resolution failed":
- Wait longer for DNS propagation (up to 48 hours)
- Verify all domains resolve correctly with `nslookup`

---

## Quick Reference

### Your Domain Structure:
```
heroglobal.io.vn          → Frontend (Next.js)
www.heroglobal.io.vn      → Frontend (Next.js)
api.heroglobal.io.vn      → Backend API (NestJS)
admin.heroglobal.io.vn    → Admin Panel (Vite)
```

### All point to:
```
YOUR_VPS_IP (find with: curl ifconfig.me)
```

### Nginx handles routing:
- Port 3001 → Frontend
- Port 4001 → Backend API
- Port 5174 → Admin Panel

---

## Example Configuration

If your VPS IP is `123.45.67.89`, your DNS records should look like:

```
A    @        123.45.67.89
A    www      123.45.67.89
A    api      123.45.67.89
A    admin    123.45.67.89
```

---

## Next Steps

After DNS is configured and propagated:

1. ✅ Verify all domains resolve to your VPS IP
2. ✅ Install SSL certificates with Certbot
3. ✅ Test all URLs (frontend, admin, API)
4. ✅ Enable Cloudflare proxy if using Cloudflare (optional)

---

**Need Help?**

If you're stuck, provide:
1. Your domain registrar name
2. Screenshot of current DNS records
3. Output of `nslookup heroglobal.io.vn`
