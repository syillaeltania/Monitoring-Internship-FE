import test from 'node:test';
import assert from 'node:assert/strict';
import { getPlacementKey } from '../src/utils/replacementScheduler.ts';

test('normalizes MSOS SQ and Software Quality placement names to the same key', () => {
  assert.equal(getPlacementKey('MSOS', 'SQ'), getPlacementKey('MSOS', 'Software Quality'));
  assert.equal(getPlacementKey('MSOS', 'SOFTWARE QUALITY'), getPlacementKey('MSOS', 'Software Quality'));
});
