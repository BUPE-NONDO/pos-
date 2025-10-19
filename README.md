# 🏥 StockPilot POS - Pharmacy Point of Sale System

[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.0-646CFF)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A modern, production-ready pharmacy point-of-sale terminal built with cutting-edge web technologies. Features real-time inventory, transaction processing, quotation generation, and thermal receipt printing.

## ✨ Features

- 🛒 **Intuitive Product Catalog** - Quick product search and selection
- 💰 **Transaction Processing** - Real-time cart management with automatic tax calculation
- 📄 **Digital Quotations** - Generate and print professional quotation documents
- 🧾 **Thermal Receipt Printing** - Print receipts optimized for 80mm thermal printers
- 🌙 **Dark Mode** - Automatic dark mode with manual toggle
- 📱 **PWA Support** - Install as a native app on any device
- ⚡ **Offline Capable** - Service worker for offline functionality
- 🔒 **Type-Safe** - Full TypeScript with Zod validation
- 🧪 **Fully Tested** - Jest unit tests and Playwright e2e tests
- ♿ **Accessible** - WCAG 2.1 compliant

## 🏗️ Tech Stack

### Frontend
- **Vite** - Lightning-fast build tool
- **TypeScript** - Type-safe development
- **Tailwind CSS v4** - Utility-first styling
- **Zod** - Runtime type validation

### Backend
- **Supabase** - PostgreSQL database with real-time capabilities
- **Firebase Hosting** - Fast, secure hosting with global CDN

### Testing
- **Jest** - Unit and integration testing
- **Playwright** - End-to-end testing
- **Testing Library** - DOM testing utilities

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** >= 22.0.0 (LTS)
- **pnpm** >= 10.13.1 (recommended) or npm
- **Firebase CLI** >= 14.10.1
- **Supabase Account** (free tier available)
- **Firebase Project** (free tier available)

## 🚀 Quick Start

### 1. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd pos-

# Install dependencies
pnpm install
# or
npm install
```

### 2. Configure Supabase

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Navigate to **Project Settings > API**
4. Copy your Project URL and anon/public key

**Set up database tables:**

Run this SQL in the Supabase SQL Editor:

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

-- Indexes for Performance
CREATE INDEX idx_sales_trans_id ON sales_transactions(trans_id);
CREATE INDEX idx_sales_timestamp ON sales_transactions(timestamp DESC);
CREATE INDEX idx_quotes_quote_id ON quotations(quote_id);
CREATE INDEX idx_quotes_timestamp ON quotations(timestamp DESC);
```

### 3. Configure Firebase

1. Create a project at [firebase.google.com](https://firebase.google.com)
2. Install Firebase CLI:

```bash
npm install -g firebase-tools
firebase login
```

3. Initialize your project:

```bash
firebase init hosting
```

4. Update `.firebaserc` with your project ID:

```json
{
  "projects": {
    "default": "your-firebase-project-id"
  }
}
```

### 4. Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
```

### 5. Run Development Server

```bash
pnpm dev
# or
npm run dev
```

The app will be available at `http://localhost:3000`

## 🧪 Testing

### Unit Tests (Jest)

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage report
pnpm test -- --coverage
```

### E2E Tests (Playwright)

```bash
# Run e2e tests
pnpm test:e2e

# Run with UI
pnpm test:e2e:ui

# Run specific browser
pnpm test:e2e -- --project=chromium
```

## 🏗️ Build & Deploy

### Build for Production

```bash
pnpm build
```

This creates an optimized build in the `dist/` directory.

### Deploy to Firebase

```bash
pnpm deploy
# or
firebase deploy --only hosting
```

### Preview Production Build Locally

```bash
pnpm preview
```

## 📁 Project Structure

```
pos-/
├── src/
│   ├── lib/                  # Business logic
│   │   ├── pos.ts           # Core POS operations
│   │   ├── database.ts      # Supabase integration
│   │   ├── print.ts         # Print service
│   │   └── supabase.ts      # Supabase client
│   ├── types/
│   │   └── schemas.ts       # Zod validation schemas
│   ├── tests/
│   │   └── setup.ts         # Jest configuration
│   ├── main.ts              # Application entry point
│   └── styles.css           # Global styles
├── tests/
│   └── e2e/                 # Playwright tests
├── public/
│   ├── manifest.json        # PWA manifest
│   └── service-worker.js    # Service worker
├── index.html               # HTML entry point
├── vite.config.ts           # Vite configuration
├── tailwind.config.js       # Tailwind configuration
├── tsconfig.json            # TypeScript configuration
├── jest.config.js           # Jest configuration
├── playwright.config.ts     # Playwright configuration
├── firebase.json            # Firebase hosting config
└── package.json             # Dependencies
```

## 🎨 Key Features Explained

### Transaction Processing

1. Add products to cart from the catalog
2. Adjust quantities using +/- buttons
3. View real-time tax and total calculations
4. Complete transaction with one click
5. Automatic thermal receipt generation

### Quotation System

1. Build cart with desired products
2. Click "Save as Quotation"
3. System generates unique quote ID
4. Professional A4 document created
5. 30-day validity automatically calculated

### Print System

- **Thermal Receipts**: Optimized for 80mm thermal printers
- **A4 Quotations**: Professional business documents
- **Browser-based**: Uses native print dialog
- **Customizable**: Easy to modify templates

### Data Validation

All data is validated using Zod schemas:

```typescript
import { ProductSchema } from '@/types/schemas'

const product = {
  id: 1,
  name: 'Paracetamol',
  price: 45.00,
  sku: 'MED001'
}

// Validates at runtime
const validated = ProductSchema.parse(product)
```

## 🔧 Configuration

### Tax Rate

Modify the tax rate in `src/main.ts`:

```typescript
private readonly TAX_RATE = 0.16 // 16% VAT
```

### Product Catalog

Update products in `src/main.ts` → `loadProducts()` method or connect to your backend API.

### Currency

Change currency formatting in `src/lib/pos.ts`:

```typescript
static readonly ZMW_FORMAT = new Intl.NumberFormat('en-ZM', {
  style: 'currency',
  currency: 'ZMW',
})
```

## 📱 PWA Installation

Users can install the app:

1. **Desktop**: Click install button in address bar
2. **Mobile**: Add to Home Screen from browser menu
3. **Offline**: App works without internet connection

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Use different port
pnpm dev -- --port 3001
```

### Supabase Connection Issues

1. Check `.env` file has correct credentials
2. Verify Supabase project is active
3. Check browser console for errors
4. Ensure tables are created correctly

### Print Not Working

1. Allow popups in browser settings
2. Check printer is connected
3. Verify print CSS in browser dev tools
4. Test with browser print preview

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Vite](https://vitejs.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons from [Phosphor Icons](https://phosphoricons.com/)
- Hosted on [Firebase](https://firebase.google.com/)
- Database by [Supabase](https://supabase.com/)

## 📞 Support

For support, please:

- 📧 Email: support@example.com
- 💬 GitHub Issues: [Create an issue](https://github.com/your-repo/issues)
- 📖 Documentation: [View docs](https://docs.example.com)

---

**Made with ❤️ for pharmacies everywhere**


