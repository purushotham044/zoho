# Windows Quick Start

## ✅ What Works on Windows

### 1. Package Functions (Works!)
```powershell
npm run package
```
This creates `deploy\artifact.zip` ready for upload.

### 2. Validate Deployment
```powershell
npm run validate:dev
```

### 3. Test Webhook
```powershell
npm run test:webhook:dev
```

---

## 📦 Deploy to Catalyst

### Step 1: Package
```powershell
npm run package
```

### Step 2: Upload Manually
1. Go to **Catalyst Console** → **Functions** → **Deploy**
2. Upload: `deploy\artifact.zip`
3. Set entry point: `index.handler`
4. Set environment variable: `ENVIRONMENT=development`

---

## 🚀 Quick Commands

```powershell
# Package functions
npm run package

# Validate deployment
npm run validate:dev

# Test webhook
npm run test:webhook:dev

# Run tests
npm test
```

---

## ⚠️ Note

The PowerShell deploy script has encoding issues. Use:
1. `npm run package` to create the ZIP
2. Manual upload via Catalyst Console

This works perfectly and is actually simpler! ✅

---

**Next Steps:** See [QUICK_START_RUN.md](QUICK_START_RUN.md) for full setup instructions.

