# Building an Android APK

This guide turns Apex Finance (a web app) into an installable Android `.apk` file using Capacitor.

## Requirements
- Android Studio installed ([download](https://developer.android.com/studio))
- Node.js + npm (already have it)

## One-Time Setup

Run these commands in the project root:

```bash
# 1. Pull the latest code (includes capacitor.config.ts)
git pull origin main

# 2. Install all dependencies (includes Capacitor)
npm install

# 3. Build the production web app (creates the /dist folder)
npm run build

# 4. Add the Android platform (creates the /android folder)
npx cap add android

# 5. Copy the web build into the Android project
npx cap sync

# 6. (Optional) Generate the custom app icon — see assets/README.md
#    First convert assets/icon.svg to assets/icon.png (1024x1024), then:
npx @capacitor/assets generate --android

# 7. Open the project in Android Studio
npx cap open android
```

> For the custom Apex Finance app icon, follow `assets/README.md`. If you skip it, the app uses Capacitor's default icon.

## In Android Studio

1. Wait for **"Gradle sync"** to finish (first time takes a few minutes — watch the bottom status bar)
2. Top menu: **Build → Build Bundle(s) / APK(s) → Build APK(s)**
3. When the build finishes, a notification appears in the bottom-right → click **"locate"**
4. This opens the folder containing `app-debug.apk`

Path is usually:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

## Distributing to Friends

1. Send them the `app-debug.apk` file (Google Drive, WhatsApp, email, a download link)
2. On their Android phone: tap the file
3. Android shows "install from unknown sources" — they tap **Allow / Install anyway**
4. The app installs like any other app

## After Making Code Changes

Whenever you update the app code, rebuild the web app and re-sync:

```bash
npm run build
npx cap sync
```

Then rebuild the APK in Android Studio.

## Notes

- **Android only.** iPhone (iOS) does not allow sideloading APKs — that requires the Apple App Store ($99/year).
- **Debug APK** is fine for sharing with friends. For the Play Store you'd build a signed "release" APK/AAB later.
- The `/android` folder is git-ignored — it's regenerated with `npx cap add android`, so it's not committed to the repo.
