# Verification Checklist for Always-Fresh Site Updates

## Pre-Deployment Checklist

### ✅ Build Process
- [ ] Run `npm run build` successfully
- [ ] Verify `dist/` folder contains hashed assets
- [ ] Check `version.json` is generated with current timestamp
- [ ] Confirm HTML files reference hashed asset filenames
- [ ] Validate all asset paths are correct in built files

### ✅ Service Worker
- [ ] Service worker version number is incremented
- [ ] `sw.js` has proper cache strategies
- [ ] Update notification system is working
- [ ] Service worker registration script is included in HTML

### ✅ Cache Headers
- [ ] HTML files have `no-cache, no-store, must-revalidate`
- [ ] Hashed assets have `max-age=31536000, immutable`
- [ ] Non-hashed assets have appropriate cache times
- [ ] Version files have `no-cache`

## Post-Deployment Verification

### 🔍 Browser DevTools Testing

#### 1. Network Tab Analysis
```bash
# Test HTML freshness
curl -I https://your-domain.com/pages/index.html
# Should show: Cache-Control: no-cache, no-store, must-revalidate

# Test hashed asset caching
curl -I https://your-domain.com/assets/images/hero-bg.a1b2c3d4.jpg
# Should show: Cache-Control: public, max-age=31536000, immutable

# Test version file freshness
curl -I https://your-domain.com/version.json
# Should show: Cache-Control: no-cache, no-store, must-revalidate
```

#### 2. Chrome DevTools Steps
1. **Open DevTools** → Network tab
2. **Disable cache** checkbox (to simulate first visit)
3. **Reload page** and verify:
   - HTML loads with 200 status (not 304)
   - Hashed assets load with 200 status
   - Version.json loads with 200 status
4. **Enable cache** and reload:
   - HTML should still load with 200 (no-cache)
   - Hashed assets should load with 304 (cached)
   - Version.json should load with 200 (no-cache)

#### 3. Service Worker Testing
1. **Application tab** → Service Workers
2. **Verify registration** and active status
3. **Check cache storage** for proper cache names
4. **Test update flow**:
   - Change version in `sw.js`
   - Reload page
   - Verify update notification appears
   - Test "Update Now" button

#### 4. Cache Storage Inspection
1. **Application tab** → Storage → Cache Storage
2. **Verify cache names** match current version
3. **Check old caches** are cleaned up
4. **Inspect cached resources** are correct

### 📱 Mobile Testing

#### iOS Safari Specific
```javascript
// Test in Safari console
navigator.serviceWorker.ready.then(reg => {
  console.log('SW ready:', reg);
});

// Check cache behavior
fetch('/version.json', {cache: 'no-cache'})
  .then(r => r.json())
  .then(console.log);
```

#### Android WebView
- Test in Chrome mobile
- Verify service worker works in PWA mode
- Check update notifications display correctly

### 🌐 CDN Testing

#### Cloudflare
```bash
# Check cache status
curl -I https://your-domain.com/pages/index.html
# Look for: cf-cache-status: DYNAMIC

curl -I https://your-domain.com/assets/images/hero-bg.a1b2c3d4.jpg
# Look for: cf-cache-status: HIT
```

#### Netlify/Vercel
- Check deployment logs for cache headers
- Verify edge functions respect cache rules
- Test invalidation scripts work

## Troubleshooting Guide

### 🚨 Common Issues & Solutions

#### Issue: Users see old content after deployment
**Symptoms:**
- HTML shows old version
- Assets not updating
- Service worker not updating

**Diagnosis:**
```bash
# Check HTML cache headers
curl -I https://your-domain.com/pages/index.html

# Check service worker
curl -I https://your-domain.com/sw.js

# Check version file
curl -I https://your-domain.com/version.json
```

**Solutions:**
1. **HTML not updating**: Verify `no-cache` headers on HTML
2. **Assets not updating**: Check if assets are properly hashed
3. **SW not updating**: Increment version number in `sw.js`
4. **CDN issues**: Run invalidation script

#### Issue: Service Worker not registering
**Symptoms:**
- No SW in DevTools Application tab
- Console errors about SW registration

**Solutions:**
1. Check `sw.js` is accessible (no 404)
2. Verify HTTPS is enabled (SW requires secure context)
3. Check browser console for registration errors
4. Ensure SW file has proper MIME type

#### Issue: Update notifications not showing
**Symptoms:**
- No update prompts for users
- SW updates but users don't know

**Solutions:**
1. Check `sw-registration.js` is loaded
2. Verify message passing between SW and main thread
3. Test notification styles are visible
4. Check for JavaScript errors in console

#### Issue: Assets loading slowly
**Symptoms:**
- Slow page load times
- Assets not cached properly

**Solutions:**
1. Verify hashed assets have `immutable` cache headers
2. Check CDN is caching assets properly
3. Ensure compression is enabled
4. Verify preload hints are working

#### Issue: iOS Safari caching problems
**Symptoms:**
- Aggressive caching on iOS
- Back/forward cache issues

**Solutions:**
1. Add `Cache-Control: no-cache` to HTML
2. Use `pageshow` event to detect back navigation
3. Add `unload` event handler for page cleanup
4. Test in private browsing mode

### 🔧 Debug Commands

#### Check Cache Headers
```bash
# HTML files
curl -I https://your-domain.com/pages/index.html

# Hashed assets
curl -I https://your-domain.com/assets/images/hero-bg.a1b2c3d4.jpg

# Version file
curl -I https://your-domain.com/version.json

# Service worker
curl -I https://your-domain.com/sw.js
```

#### Test Service Worker
```javascript
// In browser console
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log('SW registrations:', regs);
});

// Check cache
caches.keys().then(names => {
  console.log('Cache names:', names);
});
```

#### Force Update
```javascript
// Force service worker update
navigator.serviceWorker.getRegistration().then(reg => {
  if (reg) {
    reg.update();
  }
});

// Clear all caches
caches.keys().then(names => {
  names.forEach(name => caches.delete(name));
});
```

## Performance Monitoring

### 📊 Key Metrics to Track

1. **Cache Hit Ratio**
   - HTML: Should be 0% (always fresh)
   - Hashed assets: Should be >90%
   - Non-hashed assets: Should be >70%

2. **Update Detection Time**
   - Service worker: <5 minutes
   - Version checker: <5 minutes
   - User notification: <10 seconds

3. **Page Load Performance**
   - First Contentful Paint: <1.5s
   - Largest Contentful Paint: <2.5s
   - Time to Interactive: <3.5s

### 🎯 Success Criteria

- [ ] HTML always loads fresh (no 304 responses)
- [ ] Hashed assets cache for 1 year
- [ ] Users see update notifications within 5 minutes
- [ ] No stale content after deployments
- [ ] Performance scores remain high (>90)
- [ ] Works across all target browsers
- [ ] Mobile experience is smooth

## Rollback Plan

If issues occur:

1. **Immediate**: Revert to previous deployment
2. **CDN**: Purge all caches manually
3. **Users**: Clear browser cache instructions
4. **Monitoring**: Check error rates and user reports

### Emergency Commands
```bash
# Force CDN invalidation
node invalidate-cdn.js

# Revert to previous version
git checkout previous-commit
npm run build
# Deploy previous version

# Clear all caches (last resort)
# Update .htaccess to add no-cache to all files temporarily
```
