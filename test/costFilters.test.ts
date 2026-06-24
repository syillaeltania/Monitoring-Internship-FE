import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCostQuery, defaultCostFilters, monthOptions } from '../src/utils/costFilters.ts';

test('provides all twelve month options for monitoring cost', () => {
  assert.deepEqual(
    monthOptions.map((item) => item.label),
    ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'],
  );
});

test('defaults cost filter month and year from current date', () => {
  assert.deepEqual(defaultCostFilters(new Date('2026-06-19T00:00:00.000Z')), {
    month: 6,
    year: 2026,
    type: '',
    division: '',
    status: '',
  });
});

test('builds API query params from selected cost filters', () => {
  assert.deepEqual(
    buildCostQuery({
      month: 7,
      year: 2026,
      type: 'INSTITUTION',
      division: 'CORE',
      status: 'ACTIVE',
    }),
    {
      month: '7',
      year: '2026',
      type: 'INSTITUTION',
      division: 'CORE',
      status: 'ACTIVE',
    },
  );
});
