# Envelope Entry Experience - Test Version

## Overview

This is a test implementation of the immersive envelope entry experience for James & Oliver's wedding invitation website. The experience creates a bespoke letterpress invitation feeling with an elegant envelope animation.

## Features

### 🎯 Core Experience
- **Full-screen envelope entry**: Visitors land on a neutral textured background with a centered envelope
- **Password protection**: Uses "celebratejando" as the access code
- **Elegant animations**: Smooth envelope opening with GSAP animations
- **Sparkle effects**: Subtle light dust/sparkle animation when invitation reveals
- **Responsive design**: Works beautifully on all devices including iOS

### 🎨 Design Elements
- **Envelope styling**: Cream/ivory paper texture with rose-colored design
- **Background texture**: Subtle paper/fabric texture overlay
- **Typography**: Playfair Display for headings, Inter for body text
- **Color palette**: Matches existing site colors (#A02D4A, #F9F7F3, etc.)

### ⚡ Technical Features
- **GSAP animations**: Smooth, professional envelope opening sequence
- **Accessibility**: Full keyboard navigation and screen reader support
- **Performance optimized**: Efficient animations with reduced motion support
- **Returning user bypass**: Skips animation for users who have already accessed the site

## How to Test

1. **Open the test file**: `test-envelope-index.html`
2. **Enter the password**: "celebratejando" (case-insensitive)
3. **Watch the animation**: Envelope opens → loading → invitation reveal → sparkles
4. **Continue to site**: Click "Continue" to see the main website

## Implementation Details

### Password Validation
```javascript
const correctPassword = 'celebratejando';
// Validates against user input (case-insensitive)
```

### Animation Sequence
1. **Password entry** → Hide password section
2. **Envelope reveal** → GSAP scale animation
3. **Envelope opening** → CSS transform animations (0.6s)
4. **Loading state** → Spinner animation (2s)
5. **Invitation reveal** → Sparkle effects + GSAP entrance
6. **Continue button** → Transition to main site

### Key CSS Classes
- `.envelope-entry-container` - Main overlay container
- `.password-section` - Password input area
- `#envelope` - The envelope element with states
- `.invitation-reveal` - The revealed invitation content
- `.sparkle` - Sparkle effect elements

## Production Implementation

To implement this in production:

1. **Replace the current password gate** in `pages/index.html`
2. **Copy the envelope styles** from the test file
3. **Update the JavaScript** to use the new envelope experience
4. **Test thoroughly** on all devices and browsers

### Files to Modify
- `pages/index.html` - Replace the current `#gate-overlay` section
- Add envelope CSS to the existing stylesheet
- Update the JavaScript to use the new `EnvelopeEntryExperience` class

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Safari (latest)
- ✅ Firefox (latest)
- ✅ iOS Safari (latest)
- ✅ Android Chrome (latest)

## Accessibility Features

- **Keyboard navigation**: Tab through all interactive elements
- **Screen reader support**: Proper ARIA labels and descriptions
- **Focus indicators**: Clear visual focus states
- **Reduced motion**: Respects user's motion preferences
- **High contrast**: Works with high contrast mode

## Performance Notes

- **GSAP CDN**: Uses GSAP 3.12.2 for smooth animations
- **Optimized animations**: 60fps performance on modern devices
- **Reduced motion**: Automatically disables animations for users who prefer reduced motion
- **Efficient rendering**: Uses CSS transforms and opacity for best performance

## Customization

### Colors
Update CSS custom properties in `:root`:
```css
--clr-accent: #A02D4A;     /* Main accent color */
--clr-green: #9DA79D;      /* Secondary color */
--bg-default: #F9F7F3;     /* Background color */
```

### Timing
Adjust animation durations in the JavaScript:
```javascript
// Envelope opening delay
setTimeout(() => {
  this.envelope.classList.remove('close');
  this.envelope.classList.add('open');
}, 500); // Adjust this value

// Loading duration
setTimeout(() => {
  this.loadingAnimation.classList.remove('visible');
  this.showInvitationReveal();
}, 3000); // Adjust this value
```

### Text Content
Update the invitation text in the HTML:
```html
<div id="invitation-reveal" class="invitation-reveal">
  <h1>James</h1>
  <h2>&</h2>
  <h1>Oliver</h1>
  <!-- Update invitation text here -->
</div>
```

## Troubleshooting

### Common Issues
1. **Envelope not showing**: Check if GSAP is loaded properly
2. **Animations not working**: Ensure CSS animations are enabled
3. **Password not working**: Verify the password is exactly "celebratejando"
4. **Mobile issues**: Test on actual devices, not just browser dev tools

### Debug Mode
Add this to the JavaScript for debugging:
```javascript
// Add to EnvelopeEntryExperience constructor
this.debug = true; // Enable debug logging

// Add debug logs throughout the code
if (this.debug) console.log('Envelope animation started');
```

## Credits

- **GSAP**: GreenSock Animation Platform for smooth animations
- **Fonts**: Google Fonts (Inter, Playfair Display)
- **Design inspiration**: Traditional letterpress wedding invitations

---

*This test version demonstrates the envelope entry experience. For production use, integrate the code into the main website files.*
