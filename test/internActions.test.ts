import test from 'node:test';
import assert from 'node:assert/strict';
import { canDeleteFromInternForm, internTableActions } from '../src/utils/internActions.ts';

test('intern table exposes edit as the only row action', () => {
  assert.deepEqual([...internTableActions()], ['edit']);
});

test('intern delete action is only available from an active edit form', () => {
  assert.equal(canDeleteFromInternForm('intern-1'), true);
  assert.equal(canDeleteFromInternForm(''), false);
});
