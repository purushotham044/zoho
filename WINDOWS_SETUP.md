# Windows Setup Guide

## Quick Start for Windows (PowerShell)

### 1. Install Dependencies

```powershell
npm install
cd catalyst
npm install
cd ..
```

### 2. Package Functions

**Option A: Using Node.js (Recommended)**
```powershell
npm run package
```

**Option B: Using PowerShell**
```powershell
.\scripts\package.ps1
```

### 3. Deploy to Catalyst

**Option A: Using PowerShell Script**
```powershell
npm run deploy:dev
# or
.\scripts\deploy-env.ps1 dev
```

**Option B: Manual Upload**
1. Go to Catalyst Console → Functions → Deploy
2. Upload: `deploy\artifact.zip`
3. Set entry point: `index.handler`

### 4. Validate Deployment

```powershell
npm run validate:dev
```

---

## Windows-Specific Commands

### Package
```powershell
npm run package          # Cross-platform (Node.js)
npm run package:ps1      # PowerShell version
```

### Deploy
```powershell
npm run deploy:dev       # Deploy to Development (PowerShell)
npm run deploy:prod      # Deploy to Production (PowerShell)
```

### Validate
```powershell
npm run validate:dev    # Validate Development
npm run validate:prod    # Validate Production
```

### Test
```powershell
npm run test:webhook:dev # Test webhook (Dev)
npm test                 # Run all tests
```

---

## Troubleshooting

### "node: command not found"
- Ensure Node.js is installed and in PATH
- Restart PowerShell after installing Node.js
- Verify: `node --version`

### "make: command not recognized"
- Use `npm run package` instead (uses Node.js)
- Or use `npm run package:ps1` for PowerShell version

### "bash: command not found"
- Use PowerShell scripts instead:
  - `.\scripts\deploy-env.ps1 dev`
  - `.\scripts\package.ps1`

### PowerShell Execution Policy Error
If you get "execution of scripts is disabled", run:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## Alternative: Use Git Bash

If you prefer bash commands, install Git Bash and use:
```bash
npm run deploy:dev
npm run package
```

---

## Next Steps

1. Package functions: `npm run package`
2. Upload to Catalyst Console
3. Configure secrets (see QUICK_START_RUN.md)
4. Set up Brex & Cliq
5. Validate: `npm run validate:dev`

---

**All scripts are now Windows-compatible!** ✅

