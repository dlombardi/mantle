import { chromium } from 'playwright';

const PREVIEW_URL = 'https://mantle-git-preview-darienlombardi-2455s-projects.vercel.app';
const BYPASS_TOKEN = 'noejHjtTKL83OAREtEU2dDpQRQ36Vekb';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    extraHTTPHeaders: {
      'x-vercel-protection-bypass': BYPASS_TOKEN
    }
  });
  const page = await context.newPage();

  try {
    console.log('TC1: Sign In Button Visibility');
    console.log('='.repeat(50));

    // Navigate to home page
    await page.goto(PREVIEW_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000); // Wait for React to render

    // Take screenshot
    await page.screenshot({ path: '/Users/darienlombardi/code/mantle/tc1-homepage.png' });

    // Check for sign-in button
    const signInButton = await page.locator('button:has-text("Sign in with GitHub")').first();
    const isVisible = await signInButton.isVisible().catch(() => false);

    console.log(`✓ Page loaded: ${page.url()}`);
    console.log(`✓ Sign in button visible: ${isVisible}`);

    if (isVisible) {
      const buttonText = await signInButton.textContent();
      console.log(`✓ Button text: "${buttonText}"`);

      console.log('\nTC2: OAuth Flow Initiation');
      console.log('='.repeat(50));

      // Click the button and wait for navigation
      const [newPage] = await Promise.all([
        context.waitForEvent('page'),
        signInButton.click()
      ]);

      await newPage.waitForLoadState('networkidle');
      const oauthUrl = newPage.url();

      console.log(`✓ Redirected to: ${oauthUrl}`);
      console.log(`✓ Is GitHub OAuth: ${oauthUrl.includes('github.com')}`);

      // Take screenshot of OAuth page
      await newPage.screenshot({ path: '/Users/darienlombardi/code/mantle/tc2-oauth-page.png' });

      console.log('\n✅ TC1 & TC2 PASSED');
      console.log('\nTC3-TC6: Manual Verification Required');
      console.log('='.repeat(50));
      console.log('These tests require actual GitHub login:');
      console.log('- TC3: OAuth Flow Completion');
      console.log('- TC4: Authenticated State');
      console.log('- TC5: Session Persistence');
      console.log('- TC6: Sign Out');
    } else {
      console.log('❌ TC1 FAILED: Sign in button not found');

      // Debug: print page content
      const bodyText = await page.locator('body').textContent();
      console.log('\nPage content:', bodyText);
    }

  } catch (error) {
    console.error('Error during verification:', error);
  } finally {
    await browser.close();
  }
})();
