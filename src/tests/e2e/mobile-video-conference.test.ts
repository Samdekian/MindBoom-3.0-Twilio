import { test, expect } from '@playwright/test';

test.describe('Mobile Video Conference UX', () => {
  test.beforeEach(async ({ page }) => {
    // Mock permissions for testing
    await page.context().grantPermissions(['camera', 'microphone']);
  });

  test('should show clear connection states on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Go to video conference page
    await page.goto('/video-conference/test-session');
    
    // Should show joining state initially
    await expect(page.locator('[data-testid="connection-status"]')).toContainText('Connecting');
    
    // Should show progress indicator
    await expect(page.locator('.animate-pulse')).toBeVisible();
  });

  test('should handle permission denials gracefully', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Deny permissions
    await page.context().clearPermissions();
    
    await page.goto('/video-conference/test-session');
    
    // Should show permission error
    await expect(page.locator('[data-testid="permission-error"]')).toBeVisible();
    
    // Should show connection guide
    await expect(page.locator('[data-testid="connection-guide"]')).toBeVisible();
  });

  test('should support gesture controls', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/video-conference/test-session');
    
    // Wait for session to connect
    await page.waitForSelector('[data-testid="video-container"]');
    
    // Test swipe gestures
    const videoContainer = page.locator('[data-testid="video-container"]');
    
    // Swipe left should toggle video
    await videoContainer.hover();
    await page.mouse.down();
    await page.mouse.move(100, 0);
    await page.mouse.up();
    
    // Should trigger video toggle
    await expect(page.locator('[data-testid="video-toggle"]')).toHaveAttribute('aria-pressed', 'false');
  });

  test('should show mobile-optimized connection guide', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Mock connection failure
    await page.route('**/api/video-session/**', route => {
      route.fulfill({ status: 500, body: 'Connection failed' });
    });
    
    await page.goto('/video-conference/test-session');
    
    // Should show connection guide after timeout
    await page.waitForSelector('[data-testid="mobile-connection-guide"]', { timeout: 10000 });
    
    // Should show troubleshooting steps
    await expect(page.locator('[data-testid="troubleshooting-steps"]')).toBeVisible();
    
    // Should show retry button
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
  });

  test('should handle network disconnections with pull-to-refresh', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/video-conference/test-session');
    
    // Simulate network disconnection
    await page.route('**/api/**', route => route.abort());
    
    // Should show disconnection state
    await expect(page.locator('[data-testid="connection-status"]')).toContainText('Disconnected');
    
    // Test pull-to-refresh
    const videoArea = page.locator('[data-testid="video-area"]');
    await videoArea.hover();
    
    // Simulate pull gesture
    await page.touchscreen.tap(200, 300);
    await page.mouse.move(200, 400);
    
    // Should show pull-to-refresh indicator
    await expect(page.locator('[data-testid="pull-refresh-indicator"]')).toBeVisible();
  });

  test('should provide clear feedback during connection attempts', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/video-conference/test-session');
    
    // Should show connecting state with spinner
    await expect(page.locator('[data-testid="connecting-spinner"]')).toBeVisible();
    
    // Should show helpful message
    await expect(page.locator('[data-testid="connection-message"]')).toContainText('This may take a few seconds');
    
    // Should show progress bar
    await expect(page.locator('[data-testid="connection-progress"]')).toBeVisible();
  });

  test('should handle WebRTC compatibility issues', async ({ page }) => {
    // Mock older browser without WebRTC support
    await page.addInitScript(() => {
      // @ts-ignore
      delete window.RTCPeerConnection;
    });
    
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/video-conference/test-session');
    
    // Should show compatibility error
    await expect(page.locator('[data-testid="browser-compatibility-error"]')).toBeVisible();
    
    // Should suggest browser upgrade
    await expect(page.locator('[data-testid="browser-upgrade-suggestion"]')).toBeVisible();
  });

  test('should optimize for mobile network conditions', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Simulate slow network
    await page.route('**/api/**', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.continue();
    });
    
    await page.goto('/video-conference/test-session');
    
    // Should show network quality indicator
    await expect(page.locator('[data-testid="network-quality"]')).toBeVisible();
    
    // Should adapt video quality for mobile
    await expect(page.locator('[data-testid="video-quality-indicator"]')).toContainText('Optimized for mobile');
  });
});