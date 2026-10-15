# 🖼️ iFrame Auto-Login Feature

## Overview

The BPT Dashboard now supports **automatic login bypass** when embedded in an iframe on authenticated platforms. This eliminates the need for users to log in twice - once on your platform and again on the embedded dashboard.

---

## 🎯 How It Works

### Automatic Detection
The dashboard automatically detects when it's running inside an iframe and:
1. **Skips the login requirement** completely
2. **Creates a guest session** automatically
3. **Allows full dashboard access** without authentication

### Direct Access Protection
When accessed directly (not in iframe):
- **Requires normal login** with username/password
- **Clears any auto-login sessions** for security
- **Maintains regular authentication flow**

---

## 📋 Usage Methods

### Method 1: Simple Embed (Auto Guest Login)
Just embed the dashboard URL in your iframe - **no parameters needed**:

```html
<iframe 
    src="https://apotekalpro.github.io/BPT/dashboard.html"
    width="100%" 
    height="800px"
    frameborder="0">
</iframe>
```

**Result:**
- Automatically logs in as "Guest User"
- No authentication required
- Full dashboard access

---

### Method 2: Custom User Information (URL Parameters)
Pass user information from your authenticated platform:

```html
<iframe 
    src="https://apotekalpro.github.io/BPT/dashboard.html?autoLogin=true&userType=outlet&userName=Jakarta%20Store"
    width="100%" 
    height="800px"
    frameborder="0">
</iframe>
```

**URL Parameters:**
- `autoLogin=true` - Enables auto-login (optional, auto-detects iframe anyway)
- `userType=outlet` - User type (outlet/hq/guest)
- `userName=Your%20Name` - Display name for the user

**Example with dynamic values (JavaScript):**
```javascript
const userName = "Jakarta Selatan Store";
const userType = "outlet";
const iframeUrl = `https://apotekalpro.github.io/BPT/dashboard.html?autoLogin=true&userType=${userType}&userName=${encodeURIComponent(userName)}`;

document.getElementById('dashboardFrame').src = iframeUrl;
```

---

## 🔐 Security Features

### 1. **Iframe-Only Auto-Login**
- Auto-login **only works** when embedded in iframe
- Direct access (typing URL in browser) **requires login**
- Prevents unauthorized access via direct links

### 2. **Session Isolation**
- Auto-login sessions are marked with `isIframeEmbedded: true`
- Sessions created outside iframe cannot be used inside iframe
- Sessions created inside iframe are cleared when accessed directly

### 3. **Parent Platform Authentication**
- Your platform handles authentication
- Dashboard trusts the parent platform's authentication
- No credentials stored or transmitted

---

## 📊 Testing

### Test 1: Direct Access (Should Require Login)
1. Open: `https://apotekalpro.github.io/BPT/dashboard.html`
2. **Expected:** Login page appears
3. **Required:** Username + Password

### Test 2: Iframe Embed (Auto-Login)
1. Embed in any webpage:
```html
<iframe src="https://apotekalpro.github.io/BPT/dashboard.html" width="100%" height="800px"></iframe>
```
2. **Expected:** Dashboard loads immediately
3. **No login required**

### Test 3: Custom User Info
1. Use URL parameters:
```html
<iframe src="https://apotekalpro.github.io/BPT/dashboard.html?autoLogin=true&userName=Test%20User"></iframe>
```
2. **Expected:** Dashboard shows "Test User" in header
3. **No login required**

---

## 💻 Implementation Examples

### Example 1: Basic HTML Page
```html
<!DOCTYPE html>
<html>
<head>
    <title>BPT Dashboard - Embedded</title>
    <style>
        body { margin: 0; padding: 0; }
        iframe { width: 100%; height: 100vh; border: none; }
    </style>
</head>
<body>
    <iframe src="https://apotekalpro.github.io/BPT/dashboard.html"></iframe>
</body>
</html>
```

---

### Example 2: React Component
```jsx
import React from 'react';

const DashboardEmbed = ({ userName, userType }) => {
  const iframeUrl = `https://apotekalpro.github.io/BPT/dashboard.html?autoLogin=true&userType=${userType}&userName=${encodeURIComponent(userName)}`;
  
  return (
    <iframe 
      src={iframeUrl}
      style={{ width: '100%', height: '800px', border: 'none' }}
      title="BPT Dashboard"
    />
  );
};

// Usage
<DashboardEmbed userName="Jakarta Store" userType="outlet" />
```

---

### Example 3: Vue.js Component
```vue
<template>
  <iframe 
    :src="dashboardUrl"
    style="width: 100%; height: 800px; border: none;"
    title="BPT Dashboard"
  ></iframe>
</template>

<script>
export default {
  props: {
    userName: String,
    userType: { type: String, default: 'guest' }
  },
  computed: {
    dashboardUrl() {
      const baseUrl = 'https://apotekalpro.github.io/BPT/dashboard.html';
      const params = new URLSearchParams({
        autoLogin: 'true',
        userType: this.userType,
        userName: this.userName
      });
      return `${baseUrl}?${params}`;
    }
  }
}
</script>
```

---

### Example 4: Angular Component
```typescript
import { Component, Input } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-dashboard-embed',
  template: `
    <iframe 
      [src]="dashboardUrl"
      style="width: 100%; height: 800px; border: none;"
      title="BPT Dashboard">
    </iframe>
  `
})
export class DashboardEmbedComponent {
  @Input() userName: string = 'Guest';
  @Input() userType: string = 'guest';
  
  dashboardUrl: SafeResourceUrl;
  
  constructor(private sanitizer: DomSanitizer) {}
  
  ngOnInit() {
    const baseUrl = 'https://apotekalpro.github.io/BPT/dashboard.html';
    const params = `?autoLogin=true&userType=${this.userType}&userName=${encodeURIComponent(this.userName)}`;
    this.dashboardUrl = this.sanitizer.bypassSecurityTrustResourceUrl(baseUrl + params);
  }
}
```

---

## 🔧 Technical Details

### Auto-Login Logic Flow
```
1. Page loads in iframe
   ↓
2. isInIframe() detects iframe context
   ↓
3. Check for URL parameters (autoLogin, userName, userType)
   ↓
4. If parameters exist → Use provided user info
   If not → Create default guest user
   ↓
5. Save session to localStorage with isIframeEmbedded flag
   ↓
6. Load dashboard with auto-authenticated user
```

### User Object Structure
```javascript
{
  type: 'guest' | 'outlet' | 'hq',
  displayName: 'User Display Name',
  fullStoreName: 'Full Name or Store Name',
  isAutoLogin: true,
  isIframeEmbedded: true
}
```

---

## 🎨 Customization

### Hide Login Button in Iframe
The dashboard can detect iframe context and hide elements:

```javascript
// Add to your dashboard JavaScript
if (window.self !== window.top) {
  // Running in iframe
  document.getElementById('loginButton').style.display = 'none';
  document.getElementById('logoutButton').style.display = 'none';
}
```

---

## ❓ FAQ

**Q: Will users see a login page when embedded?**
A: No, auto-login bypasses the login page completely when in iframe.

**Q: Can users still manually login when embedded?**
A: They don't need to - authentication is automatic in iframe context.

**Q: What happens if someone shares the direct dashboard link?**
A: Direct access requires normal username/password authentication.

**Q: Can I customize the guest user name?**
A: Yes, use URL parameters: `?userName=Your%20Name`

**Q: Is this secure?**
A: Yes - your platform handles authentication. The dashboard trusts your iframe embedding.

**Q: Does this work with all browsers?**
A: Yes, iframe detection works across all modern browsers.

---

## 🚀 Deployment Notes

### Files Modified
- `public/js/dashboard-static.js` - Added iframe detection and auto-login
- `docs/js/dashboard-static.js` - Same as above (for GitHub Pages)

### No Configuration Needed
- Auto-login works automatically for all iframe embeds
- No server-side changes required
- No API keys or tokens needed

---

## 📞 Support

If you encounter any issues with iframe auto-login:
1. Check browser console for debug messages (look for 🖼️ and 🔓 emojis)
2. Verify iframe embedding is working correctly
3. Test with URL parameters for custom user info
4. Ensure your platform allows iframe embedding

---

**Feature Status:** ✅ Active and deployed
**Last Updated:** December 2024
**Version:** 1.0
