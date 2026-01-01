# APK Size Optimization Guide

## ✅ Applied Optimizations

### 1. **APK Splits by Architecture** (Reduces size by 30-40%)
- **Before**: Single APK contains binaries for all architectures (~72 MB)
- **After**: Separate APKs for each architecture (~25-35 MB each)
- Enabled in `app.json`: `"splits": { "abi": true }`

When you build now, you'll get 4 APKs:
- `app-armeabi-v7a-release.apk` (~25 MB) - For older 32-bit ARM devices
- `app-arm64-v8a-release.apk` (~30 MB) - For modern 64-bit ARM devices (most common)
- `app-x86-release.apk` (~28 MB) - For Intel-based devices
- `app-x86_64-release.apk` (~32 MB) - For 64-bit Intel devices

**Most users need only `arm64-v8a` version.**

### 2. **ProGuard & Resource Shrinking** (Already enabled)
- Minifies code and removes unused resources
- Enabled: `enableProguardInReleaseBuilds` and `enableShrinkResourcesInReleaseBuilds`

### 3. **Hermes Engine** (Already enabled)
- Faster startup and smaller bundle size
- Enabled: `"jsEngine": "hermes"`

### 4. **Metro Minifier with Terser** (Already configured)
- Removes console logs and minifies JavaScript
- Configured in `metro.config.js`

## 📦 Build Commands

### Build production APK (generates separate APKs per architecture):
```bash
eas build --platform android --profile production
```

### Build single APK for testing (not recommended for distribution):
```bash
eas build --platform android --profile preview
```

## 🚀 Additional Optimization Tips

### Remove Unused Dependencies
Check if you're using all packages:
```bash
npm install -g depcheck
depcheck
```

### Optimize Images (if you have large assets)
1. Use WebP format instead of PNG/JPG
2. Compress images:
   ```bash
   npm install -g imagemin-cli
   imagemin assets/*.png --out-dir=assets/optimized
   ```

### Analyze APK Size
After building, analyze what's taking space:
```bash
npx react-native-bundle-visualizer
```

## 📊 Expected Results

| Optimization | Before | After | Savings |
|--------------|--------|-------|---------|
| Single Universal APK | 72 MB | - | - |
| ARM64 APK (most users) | - | ~30 MB | **58% reduction** |
| ARM32 APK | - | ~25 MB | **65% reduction** |

## 🎯 Recommended Distribution

**For Google Play Store:**
- Upload all 4 APKs or use App Bundle (AAB) format
- Play Store automatically serves the correct APK to each device

**For Direct Distribution:**
- Share the `arm64-v8a` APK (covers 95% of modern devices)
- Keep `armeabi-v7a` for older devices if needed

## 🔍 Verify Your Build

After building, check the output:
```bash
# Download your APK from EAS
eas build:list

# Check APK size
ls -lh app-*.apk
```

## ⚠️ Important Notes

1. **Architecture-specific APKs are normal** - Users only install one based on their device
2. **Google Play automatically handles this** - No extra work needed
3. **Most modern devices use ARM64** - That's your primary target
4. **Older devices (pre-2017) may need ARM32** - Keep both versions available

## 🔧 Next Steps

1. Build your APK:
   ```bash
   eas build --platform android --profile production
   ```

2. You'll get 4 APKs - distribute the appropriate one based on target devices

3. For most users, use: **`app-arm64-v8a-release.apk`** (~30 MB)

## 📱 Testing

Test the APK on your device:
```bash
adb install app-arm64-v8a-release.apk
```

---

**Questions?** Check EAS Build docs: https://docs.expo.dev/build/introduction/
