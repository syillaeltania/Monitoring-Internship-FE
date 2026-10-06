import test from 'node:test';
import assert from 'node:assert/strict';
import {
  IDLE_SESSION_TIMEOUT_MS,
  MAX_SESSION_TIMEOUT_MS,
  getSessionExpiryReason,
  createSessionMetadata,
  touchSessionMetadata,
} from '../src/utils/sessionTimeout.ts';

test('keeps session active before idle and max limits', () => {
  const metadata = createSessionMetadata(1_000);
  const touched = touchSessionMetadata(metadata, 10_000);

  assert.equal(getSessionExpiryReason(touched, 10_000 + IDLE_SESSION_TIMEOUT_MS - 1), null);
});

test('expires session after 60 minutes of inactivity', () => {
  const metadata = createSessionMetadata(1_000);

  assert.equal(getSessionExpiryReason(metadata, 1_000 + IDLE_SESSION_TIMEOUT_MS), 'idle');
});

test('expires session after 8 hours even when activity is recent', () => {
  const metadata = touchSessionMetadata(createSessionMetadata(1_000), 1_000 + MAX_SESSION_TIMEOUT_MS - 1000);

  assert.equal(getSessionExpiryReason(metadata, 1_000 + MAX_SESSION_TIMEOUT_MS), 'max');
});

test('treats missing or invalid metadata as expired', () => {
  assert.equal(getSessionExpiryReason(null, 1_000), 'missing');
  assert.equal(getSessionExpiryReason({ startedAt: Number.NaN, lastActivityAt: 1_000 }, 1_000), 'missing');
});
