# Mobile Testing Guide - Patient UX Improvements

## Quick Start Testing

To test the mobile improvements immediately:

### 1. Start the Development Server
```bash
npm run dev
# or
bun dev
```

### 2. Open in Browser
Navigate to: `http://localhost:5173` (or your configured port)

### 3. Simulate Mobile Device

#### Chrome DevTools:
1. Press `F12` or `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)
2. Click the device toolbar icon (or press `Cmd+Shift+M` / `Ctrl+Shift+M`)
3. Select a mobile device from the dropdown (e.g., "iPhone 12 Pro", "Pixel 5")
4. Refresh the page

#### Firefox DevTools:
1. Press `F12` or `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)
2. Click the Responsive Design Mode icon (or press `Cmd+Option+M` / `Ctrl+Shift+M`)
3. Select a device preset or enter custom dimensions

#### Safari DevTools:
1. Enable Develop menu: Preferences > Advanced > Show Develop menu
2. Go to Develop > Enter Responsive Design Mode
3. Select device presets

## Testing Checklist by Feature

### 1. Mobile Bottom Navigation

**Access:** Open any patient page on mobile viewport (<1024px)

#### Test Cases:
- [ ] **Visibility**
  - Bottom nav bar visible at bottom of screen
  - Fixed position (doesn't scroll with content)
  - 5 navigation items visible: Home, Book, Sessions, Messages, More
  
- [ ] **Interaction**
  - Tap each navigation item
  - Active state shows correct color
  - Icon color changes on active state
  - Label color changes on active state
  - Navigation happens immediately
  
- [ ] **Specific Routes**
  - Home → `/patient`
  - Book → `/patient/book`
  - Sessions → `/patient/history`
  - Messages → `/patient/inquiries`
  - More → Opens drawer (no navigation)
  
- [ ] **Visual Feedback**
  - Press state visible (active:scale-95)
  - Smooth transitions (200ms)
  - No layout shift when switching pages
  
- [ ] **Safe Area**
  - On iOS simulator/device: Check bottom nav respects home indicator
  - Bottom padding adequate on notched devices

**Expected Result:** All navigation items work correctly, visual feedback is clear, and navigation feels responsive.

### 2. Mobile Header

**Access:** Open any patient page on mobile viewport (<1024px)

#### Test Cases:
- [ ] **Visibility**
  - Header visible at top of screen
  - Fixed/sticky position
  - Contains: Hamburger menu, Logo, Notification bell, Avatar
  
- [ ] **Hamburger Menu**
  - Tap hamburger icon (☰)
  - Drawer slides in from left
  - Smooth animation (300ms)
  - Backdrop appears with overlay
  
- [ ] **Notifications**
  - If unread inquiries exist: Badge shows count
  - Badge positioned top-right of bell icon
  - Red background, white text
  - Number visible and readable
  
- [ ] **Avatar**
  - Shows user initials
  - Gradient background (blue to purple)
  - Proper size and spacing

**Expected Result:** Header components are visible and functional, drawer opens smoothly.

### 3. Mobile Drawer

**Access:** Tap hamburger menu or "More" in bottom nav

#### Test Cases:
- [ ] **Opening Animation**
  - Slides in from left
  - Smooth 300ms transition
  - Backdrop fades in
  - No content jump
  
- [ ] **Closing Methods**
  - Tap X button in header → Closes
  - Tap backdrop → Closes
  - Press device back button (Android) → Closes
  
- [ ] **Content**
  - User profile section visible at top
  - User name and email displayed
  - Avatar with initials
  
- [ ] **Navigation Items**
  - Treatment Plans
  - Session History
  - My Inquiries (with badge if unread)
  - Resources
  - All items tappable with visual feedback
  
- [ ] **Settings Section**
  - Profile Settings
  - App Settings
  - Help & Support
  - All accessible
  
- [ ] **Sign Out**
  - Button visible at bottom
  - Red color (text-red-600)
  - Hover state changes to red-50 background
  - Clicking signs user out

**Expected Result:** Drawer opens/closes smoothly, all links work, sign out functions correctly.

### 4. QuickStatsBar

**Access:** Patient Dashboard (`/patient`)

#### Test Cases:
- [ ] **Mobile Layout (<768px)**
  - 2x2 grid layout
  - 4 stat cards visible
  - Each card shows: Icon, Value, Label
  - No truncation of labels
  - Full text visible: "Sessions", "Goals", "Progress", "Streak"
  
- [ ] **Tablet Layout (768-1023px)**
  - 4-column grid layout
  - All stats in single row
  - Icons and text properly sized
  
- [ ] **Content**
  - Sessions: Shows count, blue icon
  - Goals: Shows "X/Y" format, green icon
  - Progress: Shows percentage, purple icon
  - Streak: Shows "Xd" format, orange icon
  
- [ ] **Visual Design**
  - Subtle gradient backgrounds
  - Border around each card
  - Icons in circular badges
  - Proper spacing between cards

**Expected Result:** All stats visible without truncation, proper grid layout on mobile.

### 5. Quick Actions

**Access:** Patient Dashboard (`/patient`)

#### Test Cases:
- [ ] **Layout**
  - 2-column grid on all mobile sizes
  - 4 action buttons total
  - Each button minimum 100px height
  - Icons and text centered
  
- [ ] **Buttons**
  - Book Consultation (Blue)
  - Calendar (Green)
  - Video Session (Purple)
  - Messages (Orange)
  
- [ ] **Interaction**
  - Tap feedback (active:scale-95)
  - Opens correct destination
  - Smooth transitions
  - No double-tap needed
  
- [ ] **Visual**
  - Icons large and clear (28px on mobile)
  - Text readable (text-sm)
  - Color contrast adequate
  - Hover/press states visible

**Expected Result:** All buttons easily tappable, clear visual feedback, correct navigation.

### 6. Therapist Selection Modal

**Access:** Patient onboarding flow or `/patient/book`

#### Test Cases:
- [ ] **Layout**
  - Modal adapts to mobile screen
  - No horizontal scrolling
  - Therapist cards stack properly
  
- [ ] **Therapist Cards**
  - Avatar visible (64px on mobile)
  - Name fully visible
  - Location shown if available
  - Bio text with line-clamp-3 (truncates after 3 lines)
  
- [ ] **Buttons**
  - "Learn More" button full width on mobile
  - "Choose This Therapist" button full width on mobile
  - Both buttons stack vertically on mobile
  - Text never truncated
  - Proper spacing between buttons
  
- [ ] **Info Section**
  - "Why this might be a good match:" fully visible
  - Description text wraps properly
  - Blue background section readable
  - Font size appropriate (text-xs on mobile)

**Expected Result:** Modal content fully visible, no text overflow, buttons work correctly.

### 7. Responsive Behavior

#### Test Cases:
- [ ] **Mobile (<768px)**
  - Bottom nav visible
  - Mobile header visible
  - Desktop sidebar hidden
  - Desktop header hidden
  - Content padding: p-4, pb-20
  
- [ ] **Tablet (768-1023px)**
  - Similar to mobile or transitional
  - Stats in 4 columns
  - Increased spacing
  
- [ ] **Desktop (≥1024px)**
  - Desktop sidebar visible
  - Desktop header visible
  - Mobile nav hidden
  - Mobile header hidden
  - Full desktop experience

**Expected Result:** Clean transitions between breakpoints, no layout breaks.

## Device-Specific Testing

### iOS Testing

#### Simulator (Xcode):
1. Open Xcode
2. Open Simulator: Xcode > Open Developer Tool > Simulator
3. Select device (iPhone 12, 13, 14, etc.)
4. Open Safari and navigate to dev server URL
5. Test all features

#### Physical Device:
1. Ensure iPhone and Mac on same network
2. Find Mac IP address: `ifconfig | grep inet`
3. On iPhone Safari: Navigate to `http://[YOUR_IP]:5173`
4. Test all features

#### iOS-Specific Checks:
- [ ] Safe area: Bottom nav above home indicator
- [ ] Safe area: Header below notch
- [ ] Drawer swipe feel natural
- [ ] Touch targets adequate (44x44pt minimum)
- [ ] Safari address bar doesn't interfere
- [ ] No bounce scroll issues

### Android Testing

#### Android Studio Emulator:
1. Open Android Studio
2. AVD Manager > Create/Start Virtual Device
3. Open Chrome
4. Navigate to dev server URL
5. Test all features

#### Physical Device:
1. Enable USB debugging on device
2. Connect via USB or use same WiFi
3. Access dev server URL
4. Test all features

#### Android-Specific Checks:
- [ ] Navigation bar doesn't overlap content
- [ ] Back button closes drawer
- [ ] Material ripple effects visible
- [ ] Chrome address bar behavior acceptable
- [ ] Performance smooth on mid-range devices

## Accessibility Testing

### Screen Reader Testing

#### iOS VoiceOver:
1. Settings > Accessibility > VoiceOver > On
2. Triple-click home/side button to toggle
3. Test:
   - [ ] All navigation items announced correctly
   - [ ] Buttons have meaningful labels
   - [ ] Current page announced
   - [ ] Icons have aria-labels

#### Android TalkBack:
1. Settings > Accessibility > TalkBack > On
2. Test same as VoiceOver

### Keyboard Navigation:
- [ ] Tab through all interactive elements
- [ ] Focus indicators visible
- [ ] Enter/Space activates buttons
- [ ] Escape closes drawer

### Visual:
- [ ] Contrast ratios meet WCAG AA (4.5:1 for text)
- [ ] Focus indicators 3:1 contrast
- [ ] Text resizable without breaking layout
- [ ] No information conveyed by color alone

## Performance Testing

### Metrics to Check:

1. **Navigation Timing**
   - [ ] Bottom nav tap to navigation: <100ms
   - [ ] Drawer open animation: 300ms
   - [ ] Drawer close animation: 300ms
   - [ ] Page transitions: <500ms

2. **Rendering**
   - [ ] No layout shift on load (CLS < 0.1)
   - [ ] First Contentful Paint < 1.8s
   - [ ] Time to Interactive < 3.5s

3. **Animations**
   - [ ] 60fps during drawer animation
   - [ ] No jank during navigation
   - [ ] Smooth scrolling

### Testing Tools:
- Chrome DevTools > Performance tab
- Lighthouse (Mobile)
- WebPageTest.org

## Common Issues & Solutions

### Issue: Bottom nav hidden
**Solution:** Check viewport width < 1024px, verify Tailwind `lg:hidden` class works

### Issue: Drawer doesn't close on backdrop tap
**Solution:** Verify onClick handler on backdrop div, check z-index layering

### Issue: Text still truncated in stats
**Solution:** Check grid layout applied, verify no conflicting CSS, inspect element classes

### Issue: Navigation doesn't work
**Solution:** Verify React Router setup, check console for errors, confirm paths correct

### Issue: Safe area not working on iOS
**Solution:** Add viewport meta tag with `viewport-fit=cover`, verify CSS env() variables

### Issue: Double-tap required on mobile
**Solution:** Check for conflicting hover states, add `touch-action: manipulation`

## Testing Tools & Resources

### Browser DevTools:
- **Chrome DevTools**: Best for mobile simulation
- **Firefox DevTools**: Good responsive design mode
- **Safari DevTools**: Required for iOS-specific testing

### Mobile Testing Platforms:
- **BrowserStack**: Real device testing (paid)
- **LambdaTest**: Real device cloud (paid)
- **Sauce Labs**: Automated testing (paid)

### Free Alternatives:
- Browser DevTools device simulation
- iOS Simulator (Mac only, free with Xcode)
- Android Emulator (free with Android Studio)

### Accessibility:
- **Lighthouse**: Built into Chrome DevTools
- **axe DevTools**: Browser extension
- **WAVE**: Browser extension
- **Screen readers**: VoiceOver (iOS/Mac), TalkBack (Android), NVDA (Windows)

### Performance:
- **Chrome DevTools Performance**
- **Lighthouse**
- **WebPageTest**
- **Google PageSpeed Insights**

## Sign-Off Checklist

Before marking as complete, verify:
- [ ] All navigation items work on mobile
- [ ] No text truncation anywhere
- [ ] Drawer opens and closes smoothly
- [ ] Safe areas handled on iOS
- [ ] Touch targets meet 44x44px minimum
- [ ] Tested on at least 2 mobile browsers
- [ ] Tested on at least 1 physical device
- [ ] No console errors
- [ ] Performance acceptable (<3s load time)
- [ ] Accessibility basics met (WCAG AA)
- [ ] Documentation updated
- [ ] Screenshots taken for reference

## Support

For issues or questions:
1. Check console for errors
2. Verify all dependencies installed: `npm install` or `bun install`
3. Clear browser cache and reload
4. Try in incognito/private mode
5. Check this guide's "Common Issues" section

---

**Last Updated:** November 3, 2025  
**Testing Status:** Ready for QA  
**Priority:** High - Core UX improvement

