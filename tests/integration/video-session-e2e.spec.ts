
import { test, expect, Page } from '@playwright/test';

// Test data
const TEST_APPOINTMENT_ID = 'test-appointment-123';
const THERAPIST_EMAIL = 'therapist@test.com';
const PATIENT_EMAIL = 'patient@test.com';

async function mockLogin(page: Page, userType: 'therapist' | 'patient') {
  // Mock authentication for testing
  await page.goto('/login');
  await page.fill('input[type="email"]', userType === 'therapist' ? THERAPIST_EMAIL : PATIENT_EMAIL);
  await page.fill('input[type="password"]', 'testpassword');
  await page.click('button[type="submit"]');
  
  // Wait for redirect to dashboard
  await page.waitForURL(userType === 'therapist' ? '/therapist' : '/patient');
}

test.describe('Video Session E2E Flow', () => {
  test('Complete therapist to patient session flow', async ({ browser }) => {
    // Create separate contexts for therapist and patient
    const therapistContext = await browser.newContext();
    const patientContext = await browser.newContext();
    
    const therapistPage = await therapistContext.newPage();
    const patientPage = await patientContext.newPage();

    try {
      // Step 1: Therapist logs in and sees appointment
      await test.step('Therapist login and dashboard check', async () => {
        await mockLogin(therapistPage, 'therapist');
        
        // Check if today's sessions card is visible
        await expect(therapistPage.locator('[data-testid="todays-sessions"]')).toBeVisible();
        
        // Verify session appears in dashboard
        await expect(therapistPage.locator('text=Test Therapy Session')).toBeVisible();
      });

      // Step 2: Patient logs in
      await test.step('Patient login', async () => {
        await mockLogin(patientPage, 'patient');
        
        // Patient should see their appointments
        await expect(patientPage.locator('text=Upcoming Appointments')).toBeVisible();
      });

      // Step 3: Therapist joins session first
      await test.step('Therapist joins session', async () => {
        await therapistPage.click('[data-testid="join-session-btn"]');
        
        // Should navigate to video session page
        await therapistPage.waitForURL(`/video-session/${TEST_APPOINTMENT_ID}`);
        
        // Check for video session interface
        await expect(therapistPage.locator('[data-testid="video-session-container"]')).toBeVisible();
        
        // Should show waiting for patient
        await expect(therapistPage.locator('text=Waiting for patient')).toBeVisible();
      });

      // Step 4: Patient joins session
      await test.step('Patient joins session', async () => {
        await patientPage.goto(`/video-session/${TEST_APPOINTMENT_ID}`);
        
        // Patient should see session preparation
        await expect(patientPage.locator('[data-testid="session-preparation"]')).toBeVisible();
        
        // Click join session button
        await patientPage.click('[data-testid="join-session-btn"]');
        
        // Should enter waiting room
        await expect(patientPage.locator('text=Waiting Room')).toBeVisible();
      });

      // Step 5: Therapist admits patient
      await test.step('Therapist admits patient from waiting room', async () => {
        // Therapist should see patient in waiting room
        await expect(therapistPage.locator('text=Patient is waiting')).toBeVisible();
        
        // Admit patient
        await therapistPage.click('[data-testid="admit-patient-btn"]');
        
        // Both should now be in active session
        await expect(therapistPage.locator('[data-testid="active-session"]')).toBeVisible();
      });

      // Step 6: Verify session functionality
      await test.step('Test session controls', async () => {
        // Test video controls on both sides
        await expect(therapistPage.locator('[data-testid="toggle-video-btn"]')).toBeVisible();
        await expect(therapistPage.locator('[data-testid="toggle-audio-btn"]')).toBeVisible();
        
        await expect(patientPage.locator('[data-testid="toggle-video-btn"]')).toBeVisible();
        await expect(patientPage.locator('[data-testid="toggle-audio-btn"]')).toBeVisible();
        
        // Test toggling video
        await therapistPage.click('[data-testid="toggle-video-btn"]');
        await patientPage.click('[data-testid="toggle-audio-btn"]');
      });

      // Step 7: End session
      await test.step('End session properly', async () => {
        // Therapist ends session
        await therapistPage.click('[data-testid="end-session-btn"]');
        
        // Should show session summary
        await expect(therapistPage.locator('[data-testid="session-summary"]')).toBeVisible();
        
        // Patient should also see session ended
        await expect(patientPage.locator('text=Session ended')).toBeVisible();
      });

    } finally {
      // Cleanup
      await therapistContext.close();
      await patientContext.close();
    }
  });

  test('Unauthorized access prevention', async ({ page }) => {
    await test.step('Block unauthorized user', async () => {
      // Try to access session without proper authentication
      await page.goto(`/video-session/${TEST_APPOINTMENT_ID}`);
      
      // Should redirect to login or show access denied
      await expect(page.locator('text=Access Denied')).toBeVisible();
    });
  });

  test('Session not found handling', async ({ page }) => {
    await test.step('Handle non-existent session', async () => {
      await mockLogin(page, 'therapist');
      
      // Try to access non-existent session
      await page.goto('/video-session/non-existent-session');
      
      // Should show session not found
      await expect(page.locator('text=Session Not Found')).toBeVisible();
    });
  });

  test('Device testing functionality', async ({ page }) => {
    await test.step('Test device testing flow', async () => {
      await mockLogin(page, 'patient');
      await page.goto(`/video-session/${TEST_APPOINTMENT_ID}`);
      
      // Should show device testing interface
      await expect(page.locator('[data-testid="device-test-section"]')).toBeVisible();
      
      // Test camera button
      await page.click('[data-testid="test-camera-btn"]');
      await expect(page.locator('text=Camera test')).toBeVisible();
      
      // Test microphone button
      await page.click('[data-testid="test-microphone-btn"]');
      await expect(page.locator('text=Microphone test')).toBeVisible();
    });
  });
});
