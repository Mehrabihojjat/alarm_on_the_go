#!/bin/bash

# Simple APK Builder Script
# این script یک APK ساده می‌سازه که PWA رو داخل WebView نمایش میده

echo "🚀 Starting APK build process..."

# Create temporary directory
BUILD_DIR="apk-build"
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"

cd "$BUILD_DIR"

echo "📦 Creating APK structure..."

# Create basic Android project structure
mkdir -p app/src/main/java/com/alarm/onthego
mkdir -p app/src/main/res/drawable
mkdir -p app/src/main/res/values
mkdir -p app/src/main/res/xml

# Create AndroidManifest.xml
cat > app/src/main/AndroidManifest.xml << 'EOF'
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.alarm.onthego"
    android:versionCode="1"
    android:versionName="1.0.0">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.VIBRATE" />

    <uses-sdk
        android:minSdkVersion="24"
        android:targetSdkVersion="33" />

    <application
        android:label="Alarm On The Go"
        android:icon="@drawable/icon"
        android:theme="@android:style/Theme.NoTitleBar.Fullscreen"
        android:allowBackup="true">

        <activity
            android:name=".MainActivity"
            android:configChanges="orientation|keyboardHidden|screenSize"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
EOF

# Create MainActivity.java
cat > app/src/main/java/com/alarm/onthego/MainActivity.java << 'EOF'
package com.alarm.onthego;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebSettings;
import android.webkit.WebViewClient;
import android.webkit.GeolocationPermissions;
import android.webkit.WebChromeClient;

public class MainActivity extends Activity {
    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        webView = new WebView(this);
        setContentView(webView);

        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setGeolocationEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setDatabaseEnabled(true);

        webView.setWebViewClient(new WebViewClient());
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onGeolocationPermissionsShowPrompt(String origin,
                    GeolocationPermissions.Callback callback) {
                callback.invoke(origin, true, false);
            }
        });

        webView.loadUrl("https://mehrabihojjat.github.io/alarm_on_the_go/");
    }

    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
EOF

# Create strings.xml
cat > app/src/main/res/values/strings.xml << 'EOF'
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">Alarm On The Go</string>
</resources>
EOF

# Copy icon
cp ../../icon-512.png app/src/main/res/drawable/icon.png

# Create build.gradle
cat > app/build.gradle << 'EOF'
apply plugin: 'com.android.application'

android {
    compileSdkVersion 33
    defaultConfig {
        applicationId "com.alarm.onthego"
        minSdkVersion 24
        targetSdkVersion 33
        versionCode 1
        versionName "1.0.0"
    }
    buildTypes {
        release {
            minifyEnabled false
        }
    }
}

dependencies {
}
EOF

echo "✅ APK structure created!"
echo ""
echo "⚠️  برای build کردن نیاز به Android Studio دارید:"
echo ""
echo "1. Android Studio رو نصب کنید: https://developer.android.com/studio"
echo "2. این پوشه رو باز کنید: $(pwd)"
echo "3. Build → Build Bundle(s) / APK(s) → Build APK(s)"
echo "4. فایل APK در: app/build/outputs/apk/release/"
echo ""
echo "یا اینکه این دستور رو اجرا کنید (اگه Android SDK نصب دارید):"
echo "  ./gradlew assembleRelease"

cd ..
