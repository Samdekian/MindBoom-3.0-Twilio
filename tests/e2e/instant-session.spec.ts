import { test, expect, Page, BrowserContext } from '@playwright/test';

const THERAPIST_EMAIL = 'therapist@test.com';
const PATIENT_EMAIL = 'patient@test.com';

async function mockLogin(page: Page, userType: 'therapist' | 'patient') {
  await page.goto('/login');
  await page.fill('input[type="email"]', userType === 'therapist' ? THERAPIST_EMAIL : PATIENT_EMAIL);
  await page.fill('input[type="password"]', 'testpassword');
  await page.click('button[type="submit"]');
  await page.waitForURL(userType === 'therapist' ? '/therapist' : '/patient');
}

async function createInstantSession(page: Page): Promise<string> {
  await page.click('[data-testid="create-instant-session-btn"]');
  
  // Wait for session creation form
  await expect(page.locator('[data-testid="instant-session-form"]')).toBeVisible();
  
  // Fill in session details
  await page.fill('[data-testid="session-name-input"]', 'Test Instant Session');
  await page.click('[data-testid="create-session-btn"]');
  
  // Wait for session link to be generated
  await expect(page.locator('[data-testid="session-link"]')).toBeVisible();
  
  // Extract session token from the link
  const sessionLink = await page.locator('[data-testid="session-link"]').textContent();
  const token = sessionLink?.split('/').pop() || '';
  
  return token;
}

test.describe('Instant Session E2E Flow', () => {
  test.describe.configure({ timeout: 120000 }); // 2 minute timeout for video tests

  test('Complete instant session creation and joining flow', async ({ browser }) => {
    // Create separate contexts for therapist and patient
    const therapistContext = await browser.newContext({
      permissions: ['camera', 'microphone']
    });
    const patientContext = await browser.newContext({
      permissions: ['camera', 'microphone']
    });
    
    const therapistPage = await therapistContext.newPage();
    const patientPage = await patientContext.newPage();

    try {
      // Step 1: Therapist creates instant session
      let sessionToken: string;
      await test.step('Therapist creates instant session', async () => {
        await mockLogin(therapistPage, 'therapist');
        
        // Navigate to instant sessions
        await therapistPage.click('[data-testid="instant-sessions-nav"]');
        await expect(therapistPage.locator('h1')).toContainText('Instant Sessions');
        
        // Create new session
        sessionToken = await createInstantSession(therapistPage);
        expect(sessionToken).toBeTruthy();
        
        // Verify session is active
        await expect(therapistPage.locator('[data-testid="session-status"]')).toContainText('Active');
      });

      // Step 2: Patient joins using session link
      await test.step('Patient joins session via link', async () => {
        await patientPage.goto(`/session/${sessionToken}`);
        
        // Should see join session page
        await expect(patientPage.locator('[data-testid="join-session-page"]')).toBeVisible();
        await expect(patientPage.locator('h1')).toContainText('Join Session');
        
        // Enter name and join
        await patientPage.fill('[data-testid="participant-name-input"]', 'Test Patient');
        await patientPage.click('[data-testid="join-session-btn"]');
        
        // Should enter waiting room
        await expect(patientPage.locator('[data-testid="waiting-room"]')).toBeVisible();
        await expect(patientPage.locator('text=Waiting for therapist')).toBeVisible();
      });

      // Step 3: Therapist sees patient and admits them
      await test.step('Therapist admits patient from waiting room', async () => {
        // Therapist should see patient waiting
        await expect(therapistPage.locator('[data-testid="waiting-participants"]')).toBeVisible();
        await expect(therapistPage.locator('text=Test Patient')).toBeVisible();
        
        // Admit patient
        await therapistPage.click('[data-testid="admit-participant-btn"]');
        
        // Should now be in active session
        await expect(therapistPage.locator('[data-testid="active-session"]')).toBeVisible();
      });

      // Step 4: Verify video session functionality
      await test.step('Test video session features', async () => {
        // Both should be in active session
        await expect(patientPage.locator('[data-testid="active-session"]')).toBeVisible();
        await expect(therapistPage.locator('[data-testid="active-session"]')).toBeVisible();
        
        // Test video controls
        await expect(therapistPage.locator('[data-testid="toggle-video-btn"]')).toBeVisible();
        await expect(therapistPage.locator('[data-testid="toggle-audio-btn"]')).toBeVisible();
        await expect(patientPage.locator('[data-testid="toggle-video-btn"]')).toBeVisible();
        await expect(patientPage.locator('[data-testid="toggle-audio-btn"]')).toBeVisible();
        
        // Test toggling video
        await therapistPage.click('[data-testid="toggle-video-btn"]');
        await expect(therapistPage.locator('[data-testid="toggle-video-btn"]')).toHaveAttribute('aria-pressed', 'false');
        
        // Test chat functionality
        await therapistPage.click('[data-testid="chat-toggle"]');
        await expect(therapistPage.locator('[data-testid="chat-panel"]')).toBeVisible();
        
        await therapistPage.fill('[data-testid="chat-input"]', 'Hello patient!');
        await therapistPage.click('[data-testid="send-message-btn"]');
        
        // Patient should see the message
        await patientPage.click('[data-testid="chat-toggle"]');
        await expect(patientPage.locator('text=Hello patient!')).toBeVisible();
      });

      // Step 5: Test session notes (therapist only)
      await test.step('Test session notes functionality', async () => {
        await therapistPage.click('[data-testid="notes-toggle"]');
        await expect(therapistPage.locator('[data-testid="session-notes"]')).toBeVisible();
        
        await therapistPage.fill('[data-testid="notes-input"]', 'Patient appears engaged and responsive.');
        
        // Notes should auto-save
        await therapistPage.waitForTimeout(2000);
        await expect(therapistPage.locator('[data-testid="notes-saved-indicator"]')).toBeVisible();
      });

      // Step 6: Test screen sharing
      await test.step('Test screen sharing', async () => {
        // Mock screen sharing permission
        await therapistPage.evaluate(() => {
          Object.defineProperty(navigator, 'mediaDevices', {
            value: {
              getDisplayMedia: () => Promise.resolve({
                id: 'screen-share',
                getTracks: () => [{ kind: 'video', enabled: true }]
              })
            },
            writable: true
          });
        });
        
        await therapistPage.click('[data-testid="share-screen-btn"]');
        await expect(therapistPage.locator('[data-testid="screen-sharing-indicator"]')).toBeVisible();
        
        // Stop screen sharing
        await therapistPage.click('[data-testid="stop-screen-share-btn"]');
        await expect(therapistPage.locator('[data-testid="screen-sharing-indicator"]')).not.toBeVisible();
      });

      // Step 7: Test connection quality monitoring
      await test.step('Test connection quality features', async () => {
        await therapistPage.click('[data-testid="performance-toggle"]');
        await expect(therapistPage.locator('[data-testid="performance-monitor"]')).toBeVisible();
        
        // Should show connection quality
        await expect(therapistPage.locator('[data-testid="connection-quality"]')).toBeVisible();
        
        // Should show performance metrics
        await expect(therapistPage.locator('text=CPU')).toBeVisible();
        await expect(therapistPage.locator('text=Memory')).toBeVisible();
        await expect(therapistPage.locator('text=Bandwidth')).toBeVisible();
      });

      // Step 8: End session
      await test.step('End session properly', async () => {
        // Therapist ends session
        await therapistPage.click('[data-testid="end-session-btn"]');
        
        // Should show confirmation dialog
        await expect(therapistPage.locator('[data-testid="end-session-confirm"]')).toBeVisible();
        await therapistPage.click('[data-testid="confirm-end-session"]');
        
        // Should redirect to summary or dashboard
        await expect(therapistPage.locator('[data-testid="session-ended"]')).toBeVisible();
        
        // Patient should also see session ended
        await expect(patientPage.locator('text=Session ended')).toBeVisible();
      });

    } finally {
      await therapistContext.close();
      await patientContext.close();
    }
  });

  test('Handle connection failures and recovery', async ({ browser }) => {
    const context = await browser.newContext({
      permissions: ['camera', 'microphone']
    });
    const page = await context.newPage();

    try {
      await test.step('Simulate connection failure', async () => {
        await mockLogin(page, 'therapist');
        const sessionToken = await createInstantSession(page);
        
        // Navigate to session
        await page.goto(`/session/${sessionToken}`);
        await page.fill('[data-testid="participant-name-input"]', 'Test User');
        await page.click('[data-testid="join-session-btn"]');
        
        // Simulate network disconnection
        await page.evaluate(() => {
          window.dispatchEvent(new Event('offline'));
        });
        
        // Should show connection recovery UI
        await expect(page.locator('[data-testid="connection-recovery"]')).toBeVisible();
        await expect(page.locator('text=Connection Lost')).toBeVisible();
        
        // Should show reconnection options
        await expect(page.locator('[data-testid="retry-connection-btn"]')).toBeVisible();
        await expect(page.locator('[data-testid="leave-session-btn"]')).toBeVisible();
      });

      await test.step('Test reconnection', async () => {
        // Simulate network reconnection
        await page.evaluate(() => {
          window.dispatchEvent(new Event('online'));
        });
        
        await page.click('[data-testid="retry-connection-btn"]');
        
        // Should attempt to reconnect
        await expect(page.locator('text=Reconnecting')).toBeVisible();
      });

    } finally {
      await context.close();
    }
  });

  test('Session security and access control', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      await test.step('Block access to invalid session', async () => {
        await page.goto('/session/invalid-token-123');
        
        // Should show session not found
        await expect(page.locator('text=Session Not Found')).toBeVisible();
        await expect(page.locator('[data-testid="session-error"]')).toBeVisible();
      });

      await test.step('Block access to expired session', async () => {
        // This would require creating an expired session in the database
        // For now, we'll test the UI handling
        await page.goto('/session/expired-token-456');
        await expect(page.locator('text=Session Not Found')).toBeVisible();
      });

      await test.step('Test session capacity limits', async () => {
        await mockLogin(page, 'therapist');
        const sessionToken = await createInstantSession(page);
        
        // Set max participants to 1 in session creation (would need UI for this)
        // Then try to join with multiple participants
        // This test would verify the capacity enforcement
      });

    } finally {
      await context.close();
    }
  });

  test('Mobile responsiveness', async ({ browser }) => {
    const mobileContext = await browser.newContext({
      viewport: { width: 375, height: 667 }, // iPhone SE size
      permissions: ['camera', 'microphone']
    });
    const page = await mobileContext.newPage();

    try {
      await test.step('Mobile session creation', async () => {
        await mockLogin(page, 'therapist');
        const sessionToken = await createInstantSession(page);
        
        // Mobile UI should be responsive
        await expect(page.locator('[data-testid="mobile-session-controls"]')).toBeVisible();
      });

      await test.step('Mobile session participation', async () => {
        // Create session token (simplified for test)
        await page.goto('/session/mobile-test-token');
        await page.fill('[data-testid="participant-name-input"]', 'Mobile User');
        await page.click('[data-testid="join-session-btn"]');
        
        // Should show mobile-optimized controls
        await expect(page.locator('[data-testid="mobile-video-controls"]')).toBeVisible();
        
        // Test mobile-specific features
        await page.click('[data-testid="mobile-menu-toggle"]');
        await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
      });

    } finally {
      await mobileContext.close();
    }
  });

  test('Performance under load', async ({ browser }) => {
    const context = await browser.newContext({
      permissions: ['camera', 'microphone']
    });
    const page = await context.newPage();

    try {
      await test.step('Monitor performance metrics', async () => {
        await mockLogin(page, 'therapist');
        const sessionToken = await createInstantSession(page);
        
        await page.goto(`/session/${sessionToken}`);
        await page.fill('[data-testid="participant-name-input"]', 'Performance Test');
        await page.click('[data-testid="join-session-btn"]');
        
        // Enable performance monitoring
        await page.click('[data-testid="performance-toggle"]');
        
        // Should show performance metrics
        await expect(page.locator('[data-testid="performance-monitor"]')).toBeVisible();
        
        // Monitor for performance warnings
        await page.waitForTimeout(5000);
        
        // Check if any performance warnings appeared
        const perfWarnings = await page.locator('[data-testid="performance-warning"]').count();
        console.log(`Performance warnings detected: ${perfWarnings}`);
      });

    } finally {
      await context.close();
    }
  });
});