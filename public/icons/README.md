# 📦 Icon Generation Required

This directory should contain PWA icons in the following sizes:

- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

## How to Generate Icons

### Option 1: Using Online Tool (Recommended)

1. Go to [RealFaviconGenerator](https://realfavicongenerator.net/)
2. Upload your logo/icon (SVG or high-res PNG)
3. Configure settings for PWA
4. Download the package
5. Extract PNG files to this directory

### Option 2: Using CLI Tool

```bash
# Install tool
npm install -g pwa-asset-generator

# Generate icons from SVG
pwa-asset-generator icon-512x512.svg ./public/icons \
  --icon-only \
  --type png \
  --quality 100
```

### Option 3: Manual Creation

Use any image editor (Photoshop, GIMP, Figma) to create PNG files at the required sizes.

## Design Guidelines

- **Background**: Solid color or transparent
- **Padding**: 10-20% around the main icon
- **Format**: PNG with transparency
- **Content**: Should be recognizable at small sizes (72x72)
- **Branding**: Include pharmacy/medical symbolism

## Current Status

⚠️ This directory contains a placeholder SVG. Replace with actual PNG icons before deploying to production.

The app will work without icons, but won't show proper branding when:
- Added to home screen
- Installed as PWA
- Shown in app switcher
- Displayed in search results


