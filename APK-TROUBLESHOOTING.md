# 🔧 حل مشکل نصب APK

## مشکل: APK نصب نمیشه

### راه‌حل 1: استفاده از PWA به جای APK (توصیه می‌شه!) ⭐

**چرا بهتره؟**
- نیازی به نصب APK نیست
- همین الان کار می‌کنه
- به‌روزرسانی خودکار
- کوچک‌تر و سریع‌تر

**چطور استفاده کنیم:**

1. روی گوشی، Chrome رو باز کنید
2. به این آدرس برید:
   ```
   https://mehrabihojjat.github.io/alarm_on_the_go/
   ```
3. روی منوی ⋮ (سه نقطه) بالا کلیک کنید
4. **"Add to Home screen"** یا **"افزودن به صفحه اصلی"** رو انتخاب کنید
5. یک آیکون روی صفحه اصلی اضافه میشه
6. روش کلیک کنید - مثل یک اپ واقعی کار می‌کنه!

**تمام!** این روش بهترین و ساده‌ترین راهه! 🎉

---

### راه‌حل 2: APK با تنظیمات صحیح

اگه حتماً APK می‌خواید، این مراحل رو دنبال کنید:

#### مرحله 1: چک کردن تنظیمات گوشی

1. **Settings** → **Security** → **Install unknown apps** بروید
2. **Chrome** یا **File Manager** رو پیدا کنید
3. گزینه **"Allow from this source"** رو فعال کنید

#### مرحله 2: دانلود APK صحیح

1. به https://www.pwabuilder.com/ برید
2. URL رو وارد کنید: `https://mehrabihojjat.github.io/alarm_on_the_go/`
3. **Package For Stores** → **Android** → **Generate Package**
4. در تنظیمات:
   - **Package ID**: `com.alarm.onthego`
   - **App name**: `Alarm On The Go`
   - **Min SDK**: `24` (Android 7.0)
   - **Signing**: گزینه **"Sign my app"** رو انتخاب کنید
5. دانلود کنید

#### مرحله 3: نصب

1. فایل ZIP رو extract کنید
2. فایل **app-release-signed.apk** رو پیدا کنید (نه app-release.apk)
3. نصب کنید

---

### راه‌حل 3: استفاده از APKPure یا سایت‌های مشابه

می‌تونید APK رو از طریق این سایت‌ها دانلود کنید:
- **APKMirror**
- **APKPure**

---

## مشکلات رایج

### Error: "App not installed"
**علت**: APK sign نشده یا خراب شده
**حل**: از راه‌حل 1 (PWA) استفاده کنید

### Error: "Package parsing error"
**علت**: نسخه اندروید قدیمیه
**حل**: گوشی Sony XZ1 شما Android 8 یا بالاتر داره؟

### Error: "Insufficient storage"
**علت**: فضای کافی نیست
**حل**: حداقل 20MB فضای خالی نیاز داره

---

## بهترین راه: PWA

**یادتون باشه**: PWA همون قابلیت‌های APK رو داره ولی بدون دردسر نصب!

✅ کار آفلاین
✅ نوتیفیکیشن
✅ دسترسی به موقعیت
✅ آیکون روی صفحه اصلی
✅ تمام صفحه (Full Screen)

**پس بهترین کار:**
👉 https://mehrabihojjat.github.io/alarm_on_the_go/
👉 Add to Home screen
👉 استفاده کنید!

---

## هنوز مشکل دارید؟

بهم بگید چه error دقیقی میده تا کمکتون کنم! 😊
