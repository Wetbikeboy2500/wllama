import { defineConfig } from 'vitest/config';

// Safari needs specific handling with webdriverio
const SAFARI = process.env.BROWSER === 'safari';
const provider = SAFARI ? 'webdriverio' : 'playwright';

// Determine browser name based *only* on the provider
let browserName: string;
if (SAFARI) {
  // If provider is webdriverio (for Safari), set name to 'safari'
  browserName = 'safari';
} else {
  // If provider is playwright, force 'chromium', ignoring process.env.BROWSER
  browserName = 'chromium';
  if (process.env.BROWSER && process.env.BROWSER !== 'chromium' && process.env.BROWSER !== 'safari') {
     console.warn(
       `Ignoring BROWSER environment variable "${process.env.BROWSER}" because Playwright provider is selected. Using "chromium".`,
     );
  }
}

export default defineConfig({
  test: {
    silent: true,
    exclude: [
      '**/node_modules/**',
      '**/esm/**',
      '**/docs/**',
      '**/examples/**',
    ],
    include: ['**/src/*.test.*'],
    browser: {
      enabled: true,
      name: browserName, // Use the determined browser name
      provider: provider,
      headless: true, // Add this line to run headless
      providerOptions: process.env.GITHUB_ACTIONS
        ? { // Options for Chromium in GitHub Actions
            capabilities: {
              'goog:chromeOptions': {
                args: ['disable-gpu', 'no-sandbox', 'disable-setuid-sandbox'],
              },
            },
          }
        : SAFARI
          ? { // Options for Safari with WebdriverIO
              capabilities: {
                alwaysMatch: { browserName: 'safari' },
                firstMatch: [{}],
              },
            }
          : {}, // Default empty options for Playwright/Chromium outside GHA
    },
  },
  server: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
  },
});
