import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const source = (path) => readFile(new URL(path, root), 'utf8');

test('PII forms explicitly use POST', async () => {
  const files = [
    'components/forms/ContactForm.tsx',
    'components/forms/PrivateEventForm.tsx',
    'components/forms/ExperienceEnquiryForm.tsx',
    'components/ui/BookingForm.tsx',
    'app/checkout/page.tsx',
    'app/account/login/page.tsx',
    'app/account/signup/page.tsx',
    'app/account/forgot-password/page.tsx',
    'app/account/profile/page.tsx',
    'app/admin/login/page.tsx',
  ];
  for (const file of files) {
    const content = await source(file);
    assert.match(content, /<form[^>]*method=["']post["']/i, `${file} must declare method=post`);
  }
});

test('admin login has non-indexable metadata and password-safe field semantics', async () => {
  const page = await source('app/admin/login/page.tsx');
  const layout = await source('app/admin/login/layout.tsx');
  assert.match(page, /autoComplete=["']username["']/);
  assert.match(page, /autoComplete=["']current-password["']/);
  assert.match(layout, /index:\s*false/);
  assert.match(layout, /follow:\s*false/);
  assert.match(layout, /noarchive:\s*true/);
  assert.doesNotMatch(layout, /canonical:\s*["']\/["']/);
});

test('public artwork filtering protects test records and place slug aliases', async () => {
  const content = await source('lib/public-data.ts');
  assert.match(content, /HIDDEN_ARTWORK_TITLES/);
  assert.match(content, /rio-de-jainero-2025/);
  assert.match(content, /dubai-2025/);
  assert.match(content, /normalizeRouteArtwork/);
  assert.match(content, /isPublishedArtwork/);
});

test('customer roles and public enquiries are protected by Firestore rules', async () => {
  const rules = await source('firestore.rules');
  assert.match(rules, /request\.resource\.data\.role == resource\.data\.role/);
  assert.match(rules, /affectedKeys\(\)\.hasOnly/);
  assert.match(rules, /match \/enquiries\/\{enquiryId\}[\s\S]*allow create: if false/);
  assert.doesNotMatch(rules, /allow write: if request\.auth != null && \(request\.auth\.uid == userId/);
});

test('payment status requires an unguessable confirmation proof', async () => {
  const statusRoute = await source('app/api/paystack/status/route.ts');
  const confirmationPage = await source('app/checkout/confirmation/page.tsx');
  assert.match(statusRoute, /Confirmation proof is required/);
  assert.match(statusRoute, /checkoutRequests/);
  assert.match(confirmationPage, /confirmationToken/);
});

test('customer Google authentication uses a redirect flow', async () => {
  const authContext = await source('lib/context/CustomerAuthContext.tsx');
  assert.match(authContext, /signInWithRedirect\(auth, provider\)/);
  assert.doesNotMatch(authContext, /signInWithPopup/);
});
