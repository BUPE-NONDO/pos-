# 🚀 Setup Instructions for StockPilot POS

This guide will help you get StockPilot POS up and running quickly.

## Step-by-Step Setup

### 1. Install Node.js & pnpm

```bash
# Install Node.js 22+ from https://nodejs.org
# or using nvm:
nvm install 22
nvm use 22

# Install pnpm globally
npm install -g pnpm@latest
```

### 2. Install Project Dependencies

```bash
cd pos-
pnpm install
```

### 3. Set Up Supabase (Backend Database)

#### Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up
2. Click "New Project"
3. Fill in:
   - Name: `stockpilot-pos`
   - Database Password: (save this securely)
   - Region: Choose closest to you

#### Create Database Tables

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Paste and run this SQL:

```sql
-- Sales Transactions Table
CREATE TABLE sales_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trans_id TEXT UNIQUE NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  total_amount DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  tax DECIMAL(10,2) NOT NULL,
  tax_rate DECIMAL(4,3) NOT NULL,
  items JSONB NOT NULL,
  cashier_id TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sales_trans_id ON sales_transactions(trans_id);
CREATE INDEX idx_sales_timestamp ON sales_transactions(timestamp DESC);

-- Quotations Table
CREATE TABLE quotations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id TEXT UNIQUE NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  total_amount DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  tax DECIMAL(10,2) NOT NULL,
  tax_rate DECIMAL(4,3) NOT NULL,
  items JSONB NOT NULL,
  prepared_by TEXT NOT NULL,
  status TEXT NOT NULL,
  valid_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_quotes_quote_id ON quotations(quote_id);
CREATE INDEX idx_quotes_timestamp ON quotations(timestamp DESC);
```

#### Get API Credentials

1. Go to **Project Settings** (gear icon)
2. Click **API** in the sidebar
3. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGc...` (long string)

### 4. Set Up Firebase (For Hosting)

#### Create Firebase Project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click "Add project"
3. Name it: `stockpilot-pos`
4. Disable Google Analytics (optional)

#### Install Firebase CLI

```bash
npm install -g firebase-tools
firebase login
```

#### Initialize Firebase in Your Project

```bash
firebase init hosting
```

Choose:
- Use an existing project → Select your project
- Public directory: `dist`
- Single-page app: **Yes**
- GitHub deploys: **No** (for now)

#### Get Project ID

In Firebase Console, click the gear icon → Project Settings → Copy **Project ID**

### 5. Configure Environment Variables

Create `.env` file:

```bash
cp env.example .env
```

Edit `.env` with your actual values:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...your-key-here...
VITE_FIREBASE_PROJECT_ID=stockpilot-pos-xxxxx
```

### 6. Update Firebase Project ID

Edit `.firebaserc`:

```json
{
  "projects": {
    "default": "stockpilot-pos-xxxxx"
  }
}
```

Replace `stockpilot-pos-xxxxx` with your actual Firebase Project ID.

### 7. Run Development Server

```bash
pnpm dev
```

Open http://localhost:3000 in your browser!

### 8. Verify Everything Works

1. **Check Console**: Should see no errors
2. **Add Product**: Click a product, should appear in cart
3. **Check Backend**: Should see "✅ Backend connected" in console
4. **Complete Transaction**: Add products and click CHARGE
5. **Verify in Supabase**: Go to Table Editor → sales_transactions → Should see your transaction

### 9. Deploy to Production

```bash
# Build the app
pnpm build

# Deploy to Firebase
pnpm deploy
```

Your app will be live at: `https://your-project-id.web.app`

## 🎉 You're Done!

Your POS system is now:
- ✅ Running locally
- ✅ Connected to Supabase
- ✅ Ready to deploy
- ✅ Fully tested

## Next Steps

### Add PWA Icons

Generate icons at [realfavicongenerator.net](https://realfavicongenerator.net) and place in `public/icons/`

Required sizes:
- 72x72
- 96x96
- 128x128
- 144x144
- 152x152
- 192x192
- 384x384
- 512x512

### Customize Products

Edit `src/main.ts` → `loadProducts()` method to add your pharmacy's products.

### Set Tax Rate

Modify `src/main.ts`:

```typescript
private readonly TAX_RATE = 0.16 // Change to your country's VAT rate
```

### Add Custom Branding

1. Update logo in `index.html`
2. Change colors in `tailwind.config.js`
3. Update manifest name in `public/manifest.json`

## Troubleshooting

### "Cannot connect to Supabase"

- Check `.env` file exists and has correct values
- Verify Supabase project is active
- Check browser console for specific error

### "Firebase deploy failed"

```bash
# Login again
firebase logout
firebase login

# Reinitialize
firebase init hosting
```

### "Port 3000 already in use"

```bash
pnpm dev -- --port 3001
```

### Tests Failing

```bash
# Clear cache
rm -rf node_modules
pnpm install

# Run tests
pnpm test
```

## Need Help?

- 📖 Check the main README.md
- 💬 Open a GitHub issue
- 📧 Email: support@example.com

---

**Happy selling! 🏥💊**


