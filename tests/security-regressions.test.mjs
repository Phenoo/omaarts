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
