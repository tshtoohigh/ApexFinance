# App Icon Setup

This folder holds the source icon that gets turned into all the Android app icon sizes.

## The source file
- `icon.svg` — the Apex Finance logo (1024×1024, the layered-stack mark on a dark card)

Capacitor's asset generator needs a **PNG**, so first convert the SVG to PNG (one time), then run the generator.

## Steps

### 1. Convert the SVG to a 1024×1024 PNG
Easiest option — use a free online converter:
- Go to https://svgtopng.com or https://cloudconvert.com/svg-to-png
- Upload `assets/icon.svg`
- Download the result and save it as `assets/icon.png` (must be named exactly `icon.png`)

> It must be 1024×1024. The SVG is already that size, so the converter will output the right dimensions.

### 2. Generate all icon sizes
From the project root, run:

```bash
npx @capacitor/assets generate --android
```

This reads `assets/icon.png` and automatically creates every icon size Android needs, placing them into the `android` project.

### 3. Re-sync and rebuild
```bash
npx cap sync
```

Then rebuild the APK in Android Studio (**Build → Generate App Bundles or APKs → Generate APKs**).

Your app will now show the custom Apex Finance icon on the home screen.

## Want a different icon?
Replace `assets/icon.png` with any 1024×1024 PNG of your own design, then re-run steps 2–3.
