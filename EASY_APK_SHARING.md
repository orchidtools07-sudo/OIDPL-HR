# 🚀 Easiest Way to Share Your APK

## Method 1: Google Drive (RECOMMENDED - Easiest!)

### Step 1: Upload to Google Drive
1. Go to https://drive.google.com
2. Click "New" → "File upload"
3. Select `oidpl-hr-v1.0.0.apk` from this folder
4. Wait for upload to complete

### Step 2: Get Shareable Link
1. Right-click the uploaded APK
2. Click "Get link"
3. Change to "Anyone with the link"
4. Click "Copy link"

### Step 3: Share with Your Team
Share the link via:
- WhatsApp
- Email
- SMS

**Example Link:**
```
https://drive.google.com/file/d/YOUR_FILE_ID/view?usp=sharing
```

---

## Method 2: Firebase Hosting (Professional URL)

### Setup Firebase Hosting
```bash
firebase init hosting
```

Select:
- Public directory: `public`
- Single-page app: No
- Set up automatic builds: No

### Create Public Folder and Upload
```bash
mkdir public
copy oidpl-hr-v1.0.0.apk public\
copy download.html public\index.html
```

### Deploy
```bash
firebase deploy --only hosting
```

You'll get a URL like:
```
https://oidpl-hr.web.app
```

**Professional download page with your custom URL!**

---

## Method 3: Dropbox

1. Upload APK to Dropbox
2. Right-click → Share → Create Link
3. Replace `?dl=0` with `?dl=1` at end of URL for direct download
4. Share the link

---

## 📱 How Users Install

### For Users:
1. Click the shared link
2. Download APK
3. Go to device Settings → Security → Enable "Unknown Sources"
4. Open downloaded file
5. Tap Install
6. Login with credentials

### Test Credentials:
- **Admin:** admin@oidpl.com / 123456
- **Employee:** Mobile number / 123456

---

## 🔄 How to Update the App

### When you make changes:

1. **Update version in app.json:**
```json
{
  "expo": {
    "version": "1.0.1"  // Change from 1.0.0
  }
}
```

2. **Build new APK:**
```bash
eas build --platform android --profile production
```

3. **Download new APK:**
```bash
# Get the new URL from: eas build:list
Invoke-WebRequest -Uri "NEW_EAS_URL" -OutFile "oidpl-hr-v1.0.1.apk"
```

4. **Replace old APK:**
   - Upload new APK to same location (Google Drive/Dropbox)
   - Update the link (or overwrite existing file)

5. **Notify Users:**
   - Send message: "New version available, please download and reinstall"

### Users Update Process:
1. Download new APK from the same link
2. Install over existing app (data preserved)
3. Done! ✅

---

## ✅ Current Status

Your APK is ready: `oidpl-hr-v1.0.0.apk` (in this folder)

**Next Step:** Choose your preferred method and share!

**Recommended:** Google Drive (fastest and easiest)

---

## 🆘 Enable Firebase App Distribution (Optional)

If you want automatic update notifications:

1. Go to Firebase Console: https://console.firebase.google.com
2. Select your project: oidpl-hr
3. Click "App Distribution" in left menu
4. Click "Get Started"
5. Enable the service
6. Run command again:
```bash
firebase appdistribution:distribute oidpl-hr-v1.0.0.apk --app 1:919716886673:android:36c13d27ef66a8e7a976e4
```

---

## 📊 Comparison

| Method | Setup Time | Professional | Auto Updates | Cost |
|--------|-----------|--------------|--------------|------|
| Google Drive | 2 min | ⭐⭐ | ❌ Manual | Free |
| Dropbox | 2 min | ⭐⭐ | ❌ Manual | Free |
| Firebase Hosting | 5 min | ⭐⭐⭐⭐ | ❌ Manual | Free |
| Firebase App Dist | 10 min | ⭐⭐⭐⭐⭐ | ✅ Yes | Free |

**For now:** Use Google Drive (fastest)
**Later:** Setup Firebase App Distribution for automatic updates

Need help? Let me know which method you'd like to use!
