#!/bin/bash

# Quick Start Script for StockPilot POS
# This script automates the initial setup process

set -e  # Exit on error

echo "🏥 StockPilot POS - Quick Start Setup"
echo "======================================"
echo ""

# Check Node.js version
echo "✓ Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 22 ]; then
    echo "❌ Node.js 22+ is required. Current version: $(node -v)"
    echo "Please install Node.js 22 or higher from https://nodejs.org"
    exit 1
fi
echo "  Node.js version: $(node -v) ✓"
echo ""

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "📦 Installing pnpm..."
    npm install -g pnpm@latest
fi
echo "  pnpm version: $(pnpm -v) ✓"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install
echo "  Dependencies installed ✓"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚙️  Creating .env file from template..."
    cp env.example .env
    echo "  .env file created ✓"
    echo ""
    echo "⚠️  IMPORTANT: Please edit .env file with your credentials:"
    echo "   - Supabase URL and API Key"
    echo "   - Firebase Project ID"
    echo ""
else
    echo "  .env file already exists ✓"
    echo ""
fi

# Check Firebase CLI
if ! command -v firebase &> /dev/null; then
    echo "🔥 Firebase CLI not found. Installing..."
    npm install -g firebase-tools
    echo "  Firebase CLI installed ✓"
    echo ""
    echo "  Run 'firebase login' to authenticate"
    echo ""
else
    echo "  Firebase CLI installed ✓"
fi

# Create placeholder icons if they don't exist
if [ ! -f public/icons/icon-192x192.png ]; then
    echo "🎨 Icon generation required"
    echo "  See public/icons/README.md for instructions"
    echo ""
fi

echo "✅ Setup Complete!"
echo ""
echo "Next steps:"
echo ""
echo "1. Edit .env file with your Supabase and Firebase credentials"
echo "2. Set up Supabase database tables (see SETUP.md)"
echo "3. Run development server:"
echo "   pnpm dev"
echo ""
echo "4. Build for production:"
echo "   pnpm build"
echo ""
echo "5. Deploy to Firebase:"
echo "   pnpm deploy"
echo ""
echo "📖 For detailed instructions, see SETUP.md"
echo ""
echo "Happy coding! 🚀"


