import assert from 'node:assert/strict';
import test from 'node:test';
import { formatChartValue } from '../src/utils/chartFormatting.ts';

test('formats count chart values without rupiah currency', () => {
  assert.equal(formatChartValue(7, 'count'), '7');
});

test('formats currency chart values with rupiah currency', () => {
  assert.equal(formatChartValue(23100000, 'currency'), 'Rp23.100.000');
});
