# Favicon Generator Script

## Purpose
Automatically generates all required favicon sizes from your SVG logo.

## Prerequisites
Install the Sharp library:
```bash
npm install --save-dev sharp
```

## Usage
Run the script from the project root:
```bash
node scripts/generate-favicons.js
```

## What It Generates
- `favicon.ico` (32×32) - Classic favicon for all browsers
- `favicon-16x16.png` - Small browser tab icon
- `favicon-32x32.png` - Standard browser tab icon (retina)
- `apple-touch-icon.png` (180×180) - iOS home screen icon
- `android-chrome-192x192.png` - Android home screen icon
- `android-chrome-512x512.png` - Android splash screen

## After Running
Update your `app/layout.tsx` with the new favicon links (see below).

## Recommended HTML (for layout.tsx)
```html
{/* Favicons - Multi-format for maximum compatibility */}
<link rel="icon" type="image/x-icon" href="/favicon.ico" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
```
