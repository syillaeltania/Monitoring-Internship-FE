import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveTone, toneTextClass, toneWidgetClass } from '../src/utils/designSystem.ts';

test('resolves SaaS widget tones with stable fallback', () => {
  assert.equal(resolveTone('green'), 'green');
  assert.equal(resolveTone('unknown'), 'navy');
});

test('provides colored widget and text classes for each supported tone', () => {
  assert.match(toneWidgetClass('cyan'), /cyan/);
  assert.match(toneWidgetClass('red'), /red/);
  assert.match(toneTextClass('indigo'), /indigo/);
  assert.match(toneTextClass('orange'), /amber/);
});
