import assert from 'node:assert/strict';
import test from 'node:test';
import { replacementTabs } from '../src/utils/replacementTabs.ts';

test('provides replacement page tabs in monitoring workflow order', () => {
  assert.deepEqual(
    replacementTabs.map((tab) => tab.key),
    ['scheduler', 'kanban', 'table'],
  );
});
