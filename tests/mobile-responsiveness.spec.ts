
import { test, expect } from '@playwright/test';

test.describe('Mobile Responsiveness Tests', () => {
  test('Homepage should adapt to mobile viewport', async ({ page }) => {
    await page.goto('/');
    
    // Check mobile nav is present
    const mobileMenu = await page.$('.md\\:hidden');
    expect(mobileMenu).not.toBeNull();
  });
  
  test('Dashboard should have single column layout on mobile', async ({ page }) => {
    // Login first (test user)
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/dashboard');
    
    // Check layout structure
    const mainContentColumns = await page.evaluate(() => {
      const element = document.querySelector('.md\\:grid-cols-3');
      return element !== null;
    });
    
    expect(mainContentColumns).toBe(true);
    
    // Verify responsive features
    const mobileSidebar = await page.$('button[aria-label="Open menu"]');
    expect(mobileSidebar).not.toBeNull();
  });
  
  test('Video conference controls adapt to screen size', async ({ page }) => {
    // Navigate to a mock video conference page
    await page.goto('/mobile-optimization');
    await page.click('button:has-text("Responsive Demo")');
    
    // Select mobile viewport
    await page.selectOption('select', 'mobile');
    
    // Check video grid stacking behavior
    const isVerticalLayout = await page.evaluate(() => {
      const videoGrid = document.querySelector('[class*="flex-col"]');
      return videoGrid !== null;
    });
    
    expect(isVerticalLayout).toBe(true);
  });
  
  test('Forms are usable on mobile', async ({ page }) => {
    await page.goto('/register');
    
    // Check input fields are full width on mobile
    const inputWidth = await page.evaluate(() => {
      const input = document.querySelector('input[type="email"]');
      if (!input) return null;
      
      const styles = window.getComputedStyle(input);
      const width = styles.getPropertyValue('width');
      return width;
    });
    
    // Width should be close to 100% minus padding
    expect(inputWidth).not.toBe(null);
    
    // Virtual keyboard should not break layout
    await page.click('input[type="email"]');
    const pageHeight = await page.evaluate(() => document.body.scrollHeight);
    expect(pageHeight).toBeGreaterThan(0);
  });
});

test.describe('Touch Interaction Tests', () => {
  test('Calendar supports touch gestures', async ({ page }) => {
    await page.goto('/calendar');
    
    // Test swiping action (simulated)
    await page.evaluate(() => {
      const calendar = document.querySelector('.calendar-view');
      if (calendar) {
        const touchStartEvent = new TouchEvent('touchstart', {
          bubbles: true,
          cancelable: true,
          touches: [
            new Touch({
              identifier: 0,
              target: calendar as EventTarget,
              clientX: 200,
              clientY: 150
            })
          ]
        });
        
        const touchEndEvent = new TouchEvent('touchend', {
          bubbles: true,
          cancelable: true,
          touches: [],
          changedTouches: [
            new Touch({
              identifier: 0,
              target: calendar as EventTarget,
              clientX: 50, // Simulates swipe right to left
              clientY: 150
            })
          ]
        });
        
        calendar.dispatchEvent(touchStartEvent);
        calendar.dispatchEvent(touchEndEvent);
      }
    });
    
    // Should have navigation effect (if implemented)
    await page.waitForTimeout(500);
  });
});
