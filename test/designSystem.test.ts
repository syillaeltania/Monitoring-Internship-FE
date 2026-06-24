import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveTone, toneTextClass, toneWidgetClass } from '../src/utils/designSystem.ts';

test('resolves SaaS widget tones with stable fallback', () => {
  assert.equal(resolveTone('green'), 'green');
  assert.equal(resolveTone('unknown'), 'navy');
});

test('provides colored widget and text classes for each supported tone', () => {
  assert.match(toneWidgetClass('cyan'), /3158E8|blue/);
  assert.match(toneWidgetClass('red'), /FF684F|coral/);
  assert.match(toneTextClass('indigo'), /3158E8|blue/);
  assert.match(toneTextClass('orange'), /8A6A00/);
});
