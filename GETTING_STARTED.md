# 🚀 Getting Started with StockPilot POS

Welcome! This guide will get you from zero to running in under 10 minutes.

## Prerequisites Checklist

Before starting, make sure you have:

- [ ] **Node.js 22+** installed ([Download](https://nodejs.org))
- [ ] **A code editor** (VS Code recommended)
- [ ] **Terminal/Command Line** access
- [ ] **Git** installed (optional, for version control)

## 🎯 Option 1: Automated Setup (Recommended)

### Run the Quick Start Script

```bash
# Navigate to project directory
cd pos-

# Run automated setup
./quickstart.sh

# If permission denied:
chmod +x quickstart.sh && ./quickstart.sh
```

This script will:
1. ✅ Check Node.js version
2. ✅ Install pnpm (if needed)
3. ✅ Install all dependencies
4. ✅ Create .env file from template
5. ✅ Install Firebase CLI
6. ✅ Verify setup

**Then proceed to Step 3: Configure Credentials**

---

## 🔧 Option 2: Manual Setup

### Step 1: Install Dependencies

```bash
# Install pnpm (if not already installed)
npm install -g pnpm@latest

# Install project dependencies
pnpm install
```

### Step 2: Create Environment File

```bash
# Copy the example environment file
cp env.example .env
```

### Step 3: Configure Credentials

#### A. Set Up Supabase (5 minutes)

1. **Create Account**
   - Go to [supabase.com](https://supabase.com)
   - Click "Start your project"
   - Sign up with GitHub or email

2. **Create Project**
   - Click "New Project"
   - Name: `stockpilot-pos`
   - Database Password: Create a strong password
   - Region: Choose closest to you
   - Click "Create new project" (takes ~2 minutes)

3. **Get API Credentials**
   - Once project is ready, go to **Settings** (gear icon)
   - Click **API** in the left sidebar
   - Copy these values:

   ```
   Project URL: https://xxxxx.supabase.co
   anon public key: eyJhbGc...
   ```

4. **Create Database Tables**
   - Click **SQL Editor** in the left sidebar
   - Click **New query**
   - Paste this SQL and click **RUN**:

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

5. **Update .env File**
   
   Edit `.env` and add your Supabase credentials:

   ```env
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGc...your-key-here...
   ```

#### B. Set Up Firebase (3 minutes)

1. **Create Account**
   - Go to [console.firebase.google.com](https://console.firebase.google.com)
   - Sign in with Google account

2. **Create Project**
   - Click "Add project"
   - Name: `stockpilot-pos`
   - Disable Google Analytics (optional)
   - Click "Create project"

3. **Get Project ID**
   - Click the gear icon → **Project settings**
   - Copy your **Project ID** (looks like: `stockpilot-pos-a1b2c`)

4. **Install Firebase CLI**

   ```bash
   npm install -g firebase-tools
   firebase login
   ```

5. **Update Configuration**
   
   Edit `.env`:
   ```env
   VITE_FIREBASE_PROJECT_ID=stockpilot-pos-a1b2c
   ```

   Edit `.firebaserc`:
   ```json
   {
     "projects": {
       "default": "stockpilot-pos-a1b2c"
     }
   }
   ```

---

## 🎮 Step 4: Run the Application

### Start Development Server

```bash
pnpm dev
```

You should see:

```
  VITE v7.0.0  ready in 234 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

### Open in Browser

Navigate to: **http://localhost:3000**

You should see the StockPilot POS interface! 🎉

---

## ✅ Step 5: Verify Everything Works

### Test Checklist

1. **Check Console**
   - Open browser DevTools (F12)
   - Go to Console tab
   - Should see: `✅ StockPilot POS initialized successfully`
   - Should see: `✅ Backend connected: Connected to Supabase`

2. **Test Product Selection**
   - Click on any product
   - Should appear in cart on the right
   - Totals should update

3. **Test Search**
   - Type "para" in the search box
   - Should filter to show only Paracetamol

4. **Test Transaction**
   - Add 2-3 products to cart
   - Click **CHARGE** button
   - Should see success message
   - Should trigger print dialog

5. **Test Quotation**
   - Add products to cart
   - Click **Save as Quotation**
   - Should generate and print quotation

6. **Check Database**
   - Go to Supabase dashboard
   - Click **Table Editor**
   - Open `sales_transactions` table
   - Should see your test transaction

### If Everything Works ✅

Congratulations! Your POS system is fully operational!

### If Something's Wrong ❌

Check the **Troubleshooting** section below.

---

## 🐛 Troubleshooting

### "Cannot connect to Supabase"

**Symptoms**: Error in console, transactions not saving

**Solutions**:
1. Check `.env` file exists in project root
2. Verify Supabase URL and key are correct (no extra spaces)
3. Make sure Supabase project is active (not paused)
4. Check database tables were created successfully

### "Port 3000 already in use"

**Solution**:
```bash
pnpm dev -- --port 3001
```

### "Module not found" errors

**Solution**:
```bash
# Clear cache and reinstall
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

### Print dialog not appearing

**Solutions**:
1. Check popup blocker is disabled
2. Allow popups for localhost in browser settings
3. Try different browser (Chrome recommended)

### Tests failing

**Solution**:
```bash
# Install Playwright browsers
pnpm exec playwright install

# Run tests again
pnpm test
pnpm test:e2e
```

---

## 🎨 Next Steps

### 1. Customize Products

Edit `src/main.ts` → Find `loadProducts()` method:

```typescript
private loadProducts(): void {
  this.products = [
    {
      id: 1,
      name: 'Your Product Name',
      price: 100.00,
      sku: 'YOUR-SKU',
      image: 'https://...',
    },
    // Add more products...
  ]
}
```

### 2. Change Tax Rate

Edit `src/main.ts` line ~14:

```typescript
private readonly TAX_RATE = 0.18 // Change to your tax rate
```

### 3. Update Branding

**Colors**: Edit `tailwind.config.js`

```javascript
colors: {
  primary: "#1173d4", // Your brand color
}
```

**Logo**: Edit `index.html` → Search for SVG logo

**Name**: Edit `index.html` → Change "StockPilot POS"

### 4. Generate PWA Icons

1. Go to [realfavicongenerator.net](https://realfavicongenerator.net)
2. Upload your logo
3. Download package
4. Extract PNGs to `public/icons/`

### 5. Deploy to Production

```bash
# Build optimized version
pnpm build

# Deploy to Firebase
pnpm deploy
```

Your app will be live at: `https://your-project-id.web.app`

---

## 📚 Learning Resources

### Documentation

- **README.md** - Complete feature documentation
- **SETUP.md** - Detailed setup guide
- **PROJECT_STATUS.md** - Current project status

### Code Structure

- `src/lib/pos.ts` - Core business logic
- `src/lib/database.ts` - Database operations
- `src/lib/print.ts` - Printing functionality
- `src/types/schemas.ts` - Data validation

### Testing

- `src/lib/__tests__/` - Unit tests
- `tests/e2e/` - End-to-end tests

---

## 🆘 Getting Help

### Before Asking for Help

1. ✅ Check console for errors (F12)
2. ✅ Read error messages carefully
3. ✅ Check Troubleshooting section above
4. ✅ Verify environment variables are set
5. ✅ Try restarting dev server

### Where to Get Help

- 📖 Check documentation files
- 💬 GitHub Issues (if repository is public)
- 📧 Email: support@example.com
- 🔍 Search error messages online

---

## 🎊 You're All Set!

You now have a fully functional POS system running locally!

**What you can do:**
- ✅ Process transactions
- ✅ Generate quotations
- ✅ Print receipts
- ✅ Search products
- ✅ Track sales in database

**What's next:**
- 🎨 Customize branding
- 📦 Add your products
- 🚀 Deploy to production
- 📊 Add reporting features

---

**Happy selling!** 🏥💊🎉

Need help? Check **SETUP.md** for more detailed instructions.


