import test from 'node:test';
import assert from 'node:assert/strict';
import { clampPage, paginateRows } from '../src/utils/pagination.ts';

test('paginates rows with supported page sizes', () => {
  const rows = Array.from({ length: 26 }, (_, index) => ({ id: index + 1 }));

  assert.deepEqual(paginateRows(rows, 1, 10).rows.map((row) => row.id), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  assert.deepEqual(paginateRows(rows, 2, 25).rows.map((row) => row.id), [26]);
  assert.equal(paginateRows(rows, 1, 50).totalPages, 1);
});

test('clamps page into valid range', () => {
  assert.equal(clampPage(0, 3), 1);
  assert.equal(clampPage(4, 3), 3);
  assert.equal(clampPage(2, 3), 2);
  assert.equal(clampPage(2, 0), 1);
});
