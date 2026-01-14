import { test, expect } from '@playwright/test';

test.describe('Year Navigation Tests', () => {
  test('should navigate to app and test year controls', async ({ page }) => {
    // 1. Navigate to localhost:5173
    console.log('1. Navigating to http://localhost:5173...');
    await page.goto('http://localhost:5173');
    
    // 2. Wait for data to load - look for common indicators
    console.log('2. Waiting for data to load...');
    await page.waitForTimeout(3000); // Give initial load time
    
    // Try to wait for any content that indicates data loaded
    try {
      await page.waitForSelector('svg', { timeout: 10000 });
      console.log('   - SVG element found (visualization likely rendered)');
    } catch (e) {
      console.log('   - No SVG found yet');
    }
    
    // Take initial screenshot
    await page.screenshot({ 
      path: '/Users/adrianstier/coral-ontogeny-viz/outputs/test-01-initial-load.png',
      fullPage: true 
    });
    console.log('   - Screenshot saved: test-01-initial-load.png');
    
    // 3. Check what year controls are available
    console.log('3. Looking for year controls...');
    
    // Check header for year badge
    const headerYear = await page.locator('header').locator('text=/\\d{4}/').first();
    const hasHeaderYear = await headerYear.count() > 0;
    
    if (hasHeaderYear) {
      const yearText = await headerYear.textContent();
      console.log(`   - Found year in header: ${yearText}`);
    } else {
      console.log('   - No year badge found in header');
    }
    
    // Look for year slider or range input
    const yearSlider = page.locator('input[type="range"]').first();
    const hasSlider = await yearSlider.count() > 0;
    
    if (hasSlider) {
      const sliderValue = await yearSlider.getAttribute('value');
      const sliderMin = await yearSlider.getAttribute('min');
      const sliderMax = await yearSlider.getAttribute('max');
      console.log(`   - Found year slider: value=${sliderValue}, range=${sliderMin}-${sliderMax}`);
    } else {
      console.log('   - No year slider found');
    }
    
    // Look for year buttons (prev/next)
    const prevButton = page.locator('button:has-text("Previous")').or(page.locator('button:has-text("Prev")'));
    const nextButton = page.locator('button:has-text("Next")');
    const hasPrevButton = await prevButton.count() > 0;
    const hasNextButton = await nextButton.count() > 0;
    
    if (hasPrevButton || hasNextButton) {
      console.log(`   - Found navigation buttons: prev=${hasPrevButton}, next=${hasNextButton}`);
    }
    
    // Look for year select/dropdown
    const yearSelect = page.locator('select').first();
    const hasSelect = await yearSelect.count() > 0;
    
    if (hasSelect) {
      console.log('   - Found select dropdown');
    }
    
    // Get all available controls
    console.log('\n4. Testing year navigation...');
    
    // Test scenario 1: If slider exists, use it
    if (hasSlider) {
      console.log('   Testing slider navigation:');
      
      // Get current state
      const initialValue = await yearSlider.getAttribute('value');
      const max = await yearSlider.getAttribute('max');
      
      // Move slider to middle
      const middleValue = Math.floor((parseInt(initialValue!) + parseInt(max!)) / 2);
      await yearSlider.fill(middleValue.toString());
      await page.waitForTimeout(500);
      
      await page.screenshot({ 
        path: '/Users/adrianstier/coral-ontogeny-viz/outputs/test-02-year-middle.png',
        fullPage: true 
      });
      console.log(`   - Set year to ${middleValue}, screenshot: test-02-year-middle.png`);
      
      // Move slider to max
      await yearSlider.fill(max!);
      await page.waitForTimeout(500);
      
      await page.screenshot({ 
        path: '/Users/adrianstier/coral-ontogeny-viz/outputs/test-03-year-max.png',
        fullPage: true 
      });
      console.log(`   - Set year to ${max}, screenshot: test-03-year-max.png`);
      
      // Move back to min
      const min = await yearSlider.getAttribute('min');
      await yearSlider.fill(min!);
      await page.waitForTimeout(500);
      
      await page.screenshot({ 
        path: '/Users/adrianstier/coral-ontogeny-viz/outputs/test-04-year-min.png',
        fullPage: true 
      });
      console.log(`   - Set year to ${min}, screenshot: test-04-year-min.png`);
    }
    
    // Test scenario 2: If buttons exist, use them
    if (hasNextButton) {
      console.log('   Testing button navigation:');
      
      // Click next a few times
      for (let i = 0; i < 3; i++) {
        await nextButton.first().click();
        await page.waitForTimeout(500);
        
        if (i === 1) {
          await page.screenshot({ 
            path: '/Users/adrianstier/coral-ontogeny-viz/outputs/test-05-next-button.png',
            fullPage: true 
          });
          console.log('   - Clicked Next button, screenshot: test-05-next-button.png');
        }
      }
      
      // Click previous if available
      if (hasPrevButton) {
        await prevButton.first().click();
        await page.waitForTimeout(500);
        
        await page.screenshot({ 
          path: '/Users/adrianstier/coral-ontogeny-viz/outputs/test-06-prev-button.png',
          fullPage: true 
        });
        console.log('   - Clicked Previous button, screenshot: test-06-prev-button.png');
      }
    }
    
    // 5. Verify colony display changes
    console.log('\n5. Verifying colony display updates:');
    
    // Count SVG circles/elements that might represent colonies
    const circles = await page.locator('svg circle').count();
    const rects = await page.locator('svg rect').count();
    const paths = await page.locator('svg path').count();
    
    console.log(`   - SVG elements found: circles=${circles}, rects=${rects}, paths=${paths}`);
    
    if (circles > 0 || rects > 0 || paths > 0) {
      console.log('   - Colony visualization appears to be present');
    } else {
      console.log('   - No obvious colony visualization elements found');
    }
    
    // Check if any text shows colony count
    const bodyText = await page.locator('body').textContent();
    const colonyCountMatch = bodyText?.match(/(\d+)\s*(colonies|colony)/i);
    
    if (colonyCountMatch) {
      console.log(`   - Found colony count text: ${colonyCountMatch[0]}`);
    }
    
    // Final screenshot
    await page.screenshot({ 
      path: '/Users/adrianstier/coral-ontogeny-viz/outputs/test-07-final-state.png',
      fullPage: true 
    });
    console.log('\n   Final screenshot saved: test-07-final-state.png');
    
    console.log('\n=== Test Summary ===');
    console.log(`Year controls found:`);
    console.log(`  - Header year badge: ${hasHeaderYear}`);
    console.log(`  - Year slider: ${hasSlider}`);
    console.log(`  - Prev/Next buttons: ${hasPrevButton}/${hasNextButton}`);
    console.log(`  - Select dropdown: ${hasSelect}`);
    console.log(`\nScreenshots saved to outputs/ directory`);
  });
});
