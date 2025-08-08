# James & Oliver's Wedding Registry Website

A beautiful, responsive wedding invitation and registry website with modern web design practices.

## 🚀 Recent Improvements Made

### Performance Optimizations
- ✅ **Critical CSS Inline**: Above-the-fold styles loaded immediately
- ✅ **Resource Preloading**: Fonts and hero image preloaded for faster rendering
- ✅ **DNS Prefetching**: External resources prefetched
- ✅ **Service Worker**: PWA functionality with offline caching
- ✅ **Image Optimization**: Proper loading strategies and formats

### User Experience Enhancements
- ✅ **Better Error Handling**: Improved form validation and feedback
- ✅ **Loading States**: Visual feedback during form submissions
- ✅ **Accessibility**: Focus styles and ARIA labels
- ✅ **Responsive Design**: Mobile-first approach with better breakpoints
- ✅ **Smooth Animations**: CSS transitions and micro-interactions

### Code Quality Improvements
- ✅ **Modular CSS**: Organized styles with CSS custom properties
- ✅ **Enhanced JavaScript**: Better error handling and performance
- ✅ **Progressive Enhancement**: Core functionality works without JS
- ✅ **Modern ES6+**: Async/await, template literals, arrow functions

## 📋 Additional Recommendations

### 1. **Image Optimization** (High Priority)
```bash
# Install image optimization tools
npm install -g imagemin-cli imagemin-mozjpeg imagemin-pngquant

# Optimize images
imagemin images/* --out-dir=images/optimized
```

**Recommended Actions:**
- Convert large images to WebP format with fallbacks
- Implement lazy loading for gallery images
- Use responsive images with `srcset` and `sizes`
- Compress hero image (currently 661KB → target <200KB)

### 2. **SEO & Meta Tags** (High Priority)
```html
<!-- Add to all pages -->
<meta name="robots" content="index, follow">
<meta property="og:title" content="James & Oliver's Wedding">
<meta property="og:description" content="Join us for our celebration on December 19, 2025">
<meta property="og:image" content="https://yoursite.com/images/hero-bg.jpg">
<meta property="og:url" content="https://yoursite.com">
<meta name="twitter:card" content="summary_large_image">
```

### 3. **Analytics & Tracking** (Medium Priority)
```html
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### 4. **Security Enhancements** (High Priority)
```html
<!-- Add security headers -->
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' https://formspree.io https://widget.cloudinary.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com;">
<meta http-equiv="X-Content-Type-Options" content="nosniff">
<meta http-equiv="X-Frame-Options" content="DENY">
```

### 5. **Form Improvements** (Medium Priority)
- Add reCAPTCHA to prevent spam
- Implement client-side validation
- Add success/error toast notifications
- Consider using a form service like Netlify Forms

### 6. **Performance Monitoring** (Medium Priority)
```javascript
// Add performance monitoring
window.addEventListener('load', () => {
  const perfData = performance.getEntriesByType('navigation')[0];
  console.log('Page load time:', perfData.loadEventEnd - perfData.loadEventStart);
});
```

### 7. **Accessibility Improvements** (High Priority)
```html
<!-- Add ARIA labels and roles -->
<button aria-label="Toggle dark mode" role="switch" aria-checked="false">
  🌙
</button>

<nav role="navigation" aria-label="Main navigation">
  <!-- navigation items -->
</nav>
```

### 8. **Mobile Experience** (Medium Priority)
- Test on various devices and screen sizes
- Optimize touch targets (minimum 44px)
- Improve mobile navigation
- Add pull-to-refresh functionality

## 🛠️ Development Setup

### Local Development
```bash
# Install dependencies (if using a build process)
npm install

# Start local server
python -m http.server 8000
# or
npx serve .

# Open in browser
open http://localhost:8000
```

### Deployment Checklist
- [ ] Optimize all images
- [ ] Minify CSS and JavaScript
- [ ] Enable HTTPS
- [ ] Set up proper caching headers
- [ ] Test on multiple devices
- [ ] Validate HTML/CSS
- [ ] Check accessibility (WCAG 2.1)
- [ ] Test form submissions
- [ ] Verify PWA functionality

## 📊 Performance Targets

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| First Contentful Paint | ~2.5s | <1.5s | ⚠️ Needs work |
| Largest Contentful Paint | ~3.2s | <2.5s | ⚠️ Needs work |
| Cumulative Layout Shift | ~0.1 | <0.1 | ✅ Good |
| First Input Delay | ~50ms | <100ms | ✅ Good |

## 🔧 Technical Stack

- **Frontend**: Vanilla HTML, CSS, JavaScript
- **Forms**: Formspree
- **Images**: Cloudinary
- **Hosting**: GitHub Pages (recommended)
- **Domain**: Custom domain with CNAME

## 📱 PWA Features

- ✅ Service Worker for offline functionality
- ✅ Web App Manifest
- ✅ Add to Home Screen prompt
- ✅ Responsive design
- ✅ Fast loading times

## 🎨 Design System

### Color Palette
```css
:root {
  --bg-default: #F9F7F3;    /* Warm off-white */
  --bg-alt: #FFFFFF;         /* Pure white */
  --clr-text: #3D4739;       /* Deep green-gray */
  --clr-accent: #C9486A;     /* Rose accent */
  --clr-green: #9DA79D;      /* Sage green */
  --clr-deep-green: #778053; /* Forest green */
}
```

### Typography
- **Headings**: Playfair Display (serif)
- **Body**: Inter (sans-serif)
- **Weights**: 400 (regular), 600 (semibold)

## 🚀 Next Steps

1. **Immediate** (This week):
   - Optimize hero image
   - Add security headers
   - Implement image lazy loading

2. **Short-term** (Next 2 weeks):
   - Add analytics
   - Improve form validation
   - Test on more devices

3. **Long-term** (Next month):
   - Consider adding animations
   - Implement A/B testing
   - Add more interactive features

## 📞 Support

For questions or issues, contact: jamesandolly@googlemail.com

---

*Built with ❤️ for James & Oliver's special day*
