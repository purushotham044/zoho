# 🚀 START HERE - Quick Run Guide

## What You Need

1. ✅ Node.js (v18+)
2. ✅ Zoho Catalyst account
3. ✅ Brex Developer account
4. ✅ Zoho Cliq workspace

---

## Quick Start (5 Steps)

### 1️⃣ Install
```bash
npm install
cd catalyst && npm install && cd ..
```

### 2️⃣ Deploy to Catalyst

**Windows (PowerShell):**
```powershell
npm run deploy:dev
```

**Linux/Mac:**
```bash
npm run deploy:dev
```

Then upload the ZIP via Catalyst Console if CLI not available.

**Windows Users:** See [WINDOWS_SETUP.md](WINDOWS_SETUP.md) for detailed Windows instructions.

### 3️⃣ Configure Secrets
In Catalyst Console → Secrets, add:
- `BREX_CLIENT_ID_DEV`
- `BREX_CLIENT_SECRET_DEV`
- `BREX_WEBHOOK_SECRET_DEV`
- `CLIQ_WEBHOOK_URL_DEV`
- `CLIQ_BOT_TOKEN_DEV`

### 4️⃣ Set Up Brex & Cliq
- Register Brex webhook → Your Catalyst URL
- Register Brex OAuth → Your Catalyst callback URL
- Upload Cliq manifest → Point actions to your Catalyst URL

### 5️⃣ Test
```bash
npm run validate:dev
```

---

## Full Guide

For detailed steps, see: **[QUICK_START_RUN.md](QUICK_START_RUN.md)**

---

## Common Commands

```bash
npm run deploy:dev      # Deploy to Development
npm run validate:dev    # Validate deployment
npm run test:webhook:dev # Test webhook
npm test                # Run tests
```

---

## Need Help?

- **Quick Start:** [QUICK_START_RUN.md](QUICK_START_RUN.md)
- **Production:** [PRODUCTION_DEPLOYMENT_GUIDE.md](PRODUCTION_DEPLOYMENT_GUIDE.md)
- **Troubleshooting:** [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

---

**Ready?** Start with Step 1 above! 🎯
