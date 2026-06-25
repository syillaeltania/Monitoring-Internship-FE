import test from 'node:test';
import assert from 'node:assert/strict';
import { isValidEmail, passwordChecklist, validatePasswordPair } from '../src/utils/authValidation.ts';

test('validates email format for auth forms', () => {
  assert.equal(isValidEmail('hcm@neuron.id'), true);
  assert.equal(isValidEmail('invalid-email'), false);
});

test('checks password strength requirements', () => {
  assert.deepEqual(passwordChecklist('Password1'), {
    minLength: true,
    uppercase: true,
    lowercase: true,
    number: true,
  });
  assert.equal(passwordChecklist('password').uppercase, false);
  assert.equal(passwordChecklist('Password').number, false);
});

test('validates matching password confirmation', () => {
  assert.deepEqual(validatePasswordPair('Password1', 'Password1'), []);
  assert.ok(validatePasswordPair('short', 'short').includes('Password minimal 8 karakter.'));
  assert.ok(validatePasswordPair('Password1', 'Password2').includes('Konfirmasi password belum sama.'));
});
