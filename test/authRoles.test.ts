import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeRole, type AppRole } from '../src/utils/authRoles.ts';

test('normalizes supported HCM roles from database values', () => {
  assert.equal(normalizeRole('HCM Staff'), 'HCM Staff');
  assert.equal(normalizeRole('HCM_STAFF'), 'HCM Staff');
  assert.equal(normalizeRole('hcm leader'), 'HCM Leader');
  assert.equal(normalizeRole('HCM_LEADER'), 'HCM Leader');
});

test('falls back to HCM Staff for empty or unknown role values', () => {
  assert.equal(normalizeRole(null), 'HCM Staff');
  assert.equal(normalizeRole(undefined), 'HCM Staff');
  assert.equal(normalizeRole('Admin'), 'HCM Staff');
});

test('keeps role type limited to current access scope', () => {
  const role: AppRole = normalizeRole('HCM Leader');
  assert.equal(role, 'HCM Leader');
});
