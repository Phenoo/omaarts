import test, { after, beforeEach } from 'node:test';
import { readFile } from 'node:fs/promises';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const projectId = 'demo-omaarts';
const rules = await readFile(new URL('../firestore.rules', import.meta.url), 'utf8');
const testEnv = await initializeTestEnvironment({ projectId, firestore: { rules } });

beforeEach(async () => {
  await testEnv.clearFirestore();
});

after(async () => {
  await testEnv.cleanup();
});

async function seedUser(uid, role) {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), 'users', uid), {
      uid,
      email: `${uid}@example.com`,
      displayName: uid,
      role,
      createdAt: '2026-01-01T00:00:00.000Z',
    });
  });
}

test('a customer can create a valid profile but cannot assign a staff role', async () => {
  const db = testEnv.authenticatedContext('customer-1').firestore();
  const profile = doc(db, 'users', 'customer-1');

  await assertSucceeds(setDoc(profile, {
    uid: 'customer-1',
    email: 'customer@example.com',
    displayName: 'Customer',
    role: 'customer',
    createdAt: '2026-01-01T00:00:00.000Z',
  }));

  await assertFails(setDoc(doc(db, 'users', 'customer-2'), {
    uid: 'customer-2',
    email: 'attacker@example.com',
    displayName: 'Attacker',
    role: 'admin',
    createdAt: '2026-01-01T00:00:00.000Z',
  }));
});

test('a customer can edit profile fields but cannot change an existing role', async () => {
  await seedUser('customer-1', 'customer');
  const db = testEnv.authenticatedContext('customer-1').firestore();
  const profile = doc(db, 'users', 'customer-1');

  await assertSucceeds(updateDoc(profile, {
    displayName: 'Updated Customer',
    updatedAt: '2026-01-02T00:00:00.000Z',
  }));
  await assertFails(updateDoc(profile, { role: 'admin' }));
});

test('public clients cannot bypass the enquiries API', async () => {
  const db = testEnv.unauthenticatedContext().firestore();
  await assertFails(setDoc(doc(db, 'enquiries', 'spam'), {
    name: 'Spam',
    email: 'spam@example.com',
  }));
});

test('admins retain managed access to user roles', async () => {
  await seedUser('admin-1', 'admin');
  await seedUser('staff-1', 'customer');
  const db = testEnv.authenticatedContext('admin-1').firestore();

  await assertSucceeds(updateDoc(doc(db, 'users', 'staff-1'), { role: 'staff' }));
  const updated = await assertSucceeds(getDoc(doc(db, 'users', 'staff-1')));
  if (updated.data()?.role !== 'staff') throw new Error('Admin role update was not persisted.');
});
