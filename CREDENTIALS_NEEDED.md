# 📋 What You Need to Provide

This document lists all the credentials and information you need to provide to make the POS system fully functional.

## Required Credentials

### 1. Supabase Configuration ⚠️ REQUIRED

**What it's for**: Backend database for storing transactions and quotations

**Where to get it**:
1. Create free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Project Settings > API
4. Copy the following:

**Add to `.env` file**:
```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M....
```

**Database Setup**: Run the SQL schema provided in `src/lib/supabase.ts` (lines 11-71) in the Supabase SQL Editor

**Cost**: FREE (up to 500MB database, 2GB bandwidth/month)

---

### 2. Firebase Project ID ⚠️ REQUIRED (for deployment)

**What it's for**: Hosting the application online

**Where to get it**:
1. Create free account at [console.firebase.google.com](https://console.firebase.google.com)
2. Create a new project
3. Go to Project Settings (gear icon)
4. Copy the "Project ID"

**Add to `.env` file**:
```env
VITE_FIREBASE_PROJECT_ID=your-project-id-here
```

**Update `.firebaserc` file**:
```json
{
  "projects": {
    "default": "your-project-id-here"
  }
}
```

**Cost**: FREE (10GB storage, 360MB/day bandwidth)

---

## Optional But Recommended

### 3. PWA Icons

**What it's for**: Professional branding when app is installed

**Where to get them**:
1. Go to [realfavicongenerator.net](https://realfavicongenerator.net)
2. Upload your pharmacy logo (PNG or SVG)
3. Download the generated icons
4. Place PNG files in `public/icons/` directory

**Required sizes**:
- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

**Current status**: Placeholder SVG provided

---

## Information to Customize

### 4. Pharmacy Information

**Receipt Header** - Edit `src/lib/print.ts` line 33:
```typescript
<h3>StockPilot Pharmacy</h3>
<p>Lusaka, Zambia | Email: sales@stockpilot.zm | Tel: +260 977 XXX XXX</p>
```

**Tax ID** - Edit `src/lib/print.ts` line 32:
```typescript
<p>TIN: 100-000-000</p>
```

### 5. Tax Rate

**Default**: 16% (Zambian VAT)

**Change in**: `src/main.ts` line 14:
```typescript
private readonly TAX_RATE = 0.16 // Change to your tax rate
```

### 6. Product Catalog

**Current**: 10 sample products

**Customize in**: `src/main.ts` → `loadProducts()` method (line 50)

You can:
- Add more products
- Change prices
- Update SKUs
- Add product images
- Connect to external API/database

---

## Not Required

### ❌ User Authentication
No login system needed - app works immediately

### ❌ Email Configuration
No email service required

### ❌ Payment Gateway
No payment processing setup needed

### ❌ Third-party APIs
No external API keys required (except Supabase)

---

## Summary Checklist

Before deploying to production:

- [ ] Supabase URL configured in `.env`
- [ ] Supabase Anon Key configured in `.env`
- [ ] Supabase database tables created
- [ ] Firebase Project ID configured
- [ ] `.firebaserc` updated with project ID
- [ ] Pharmacy information updated in print templates
- [ ] Tax rate adjusted if needed
- [ ] Product catalog customized
- [ ] PWA icons generated (optional but recommended)
- [ ] Test transaction completed successfully
- [ ] Verified data appears in Supabase dashboard

---

## Testing Without Credentials

**You can test the app locally without any credentials!**

The app will work in "offline mode":
- ✅ Full UI functionality
- ✅ Cart operations
- ✅ Calculations
- ✅ Print dialogs
- ❌ Data won't save to database
- ❌ Can't deploy to Firebase

**To test without credentials**:
1. Skip the `.env` file
2. Run `pnpm dev`
3. Use the app normally
4. Data will be logged to console only

---

## Getting Credentials - Time Estimate

| Task | Time Required | Cost |
|------|--------------|------|
| Supabase account + project | 5 minutes | FREE |
| Supabase database setup | 2 minutes | FREE |
| Firebase account + project | 3 minutes | FREE |
| Firebase CLI setup | 2 minutes | FREE |
| PWA icon generation | 5 minutes | FREE |
| **Total** | **~15 minutes** | **FREE** |

---

## Need Help?

### Supabase Setup
📖 See `SETUP.md` → Step 3A
📹 [Supabase Quick Start Video](https://supabase.com/docs/guides/getting-started)

### Firebase Setup
📖 See `SETUP.md` → Step 3B
📹 [Firebase Hosting Guide](https://firebase.google.com/docs/hosting/quickstart)

### PWA Icons
📖 See `public/icons/README.md`
🔧 [Icon Generator Tool](https://realfavicongenerator.net)

---

**Everything else is already configured and ready to go!** 🚀


