import test from 'node:test';
import assert from 'node:assert/strict';
import { filterInterns, sortInterns, uniqueDivisions } from '../src/utils/internFilters.ts';
import type { Intern } from '../src/services/api.ts';

const interns: Intern[] = [
  {
    id: '1',
    name: 'Rizkia',
    type: 'INSTITUTION',
    division: 'CORE',
    team: 'FINANCE',
    startDate: '2026-02-05',
    endDate: '2026-07-25',
    status: 'ACTIVE',
  },
  {
    id: '2',
    name: 'Giar',
    type: 'PROFESSIONAL',
    division: 'CORE',
    team: 'LOG',
    startDate: '2025-06-30',
    endDate: '2026-12-31',
    status: 'TERMINATED',
  },
  {
    id: '3',
    name: 'Dian',
    type: 'INSTITUTION',
    division: 'BUSDEV',
    team: 'CORE',
    startDate: '2026-05-11',
    endDate: '2027-01-25',
    status: 'ACTIVE',
  },
  {
    id: '4',
    name: 'Fikran',
    type: 'INSTITUTION',
    division: 'NEW BUSINESS',
    team: 'NB-2 (PGN)',
    startDate: '2026-03-09',
    endDate: '2026-11-09',
    status: 'ACTIVE',
  },
  {
    id: '5',
    name: 'Noval',
    type: 'INSTITUTION',
    division: 'NB',
    team: 'NB-3',
    startDate: '2026-03-09',
    endDate: '2026-09-25',
    status: 'ACTIVE',
  },
  {
    id: '6',
    name: 'Rochman',
    type: 'PROFESSIONAL',
    division: 'Telco',
    team: 'TELCO-1',
    startDate: '2025-10-27',
    endDate: '2026-04-27',
    status: 'TERMINATED',
  },
];

test('filters interns by ACTIVE status enum', () => {
  assert.deepEqual(
    filterInterns(interns, { search: '', type: '', division: '', team: '', status: 'ACTIVE' }).map((item) => item.name),
    ['Rizkia', 'Dian', 'Fikran', 'Noval'],
  );
});

test('normalizes division options into five corporate categories', () => {
  assert.deepEqual(uniqueDivisions(interns), ['CORE', 'NB', 'TELCO', 'BUSDEV', 'MSOS']);
});

test('filters division aliases by normalized category', () => {
  assert.deepEqual(
    filterInterns(interns, { search: '', type: '', division: 'NB', team: '', status: '' }).map((item) => item.name),
    ['Fikran', 'Noval'],
  );

  assert.deepEqual(
    filterInterns(interns, { search: '', type: '', division: 'TELCO', team: '', status: '' }).map((item) => item.name),
    ['Rochman'],
  );
});

test('filters interns by TERMINATED status enum', () => {
  assert.deepEqual(
    filterInterns(interns, { search: '', type: '', division: '', team: '', status: 'TERMINATED' }).map((item) => item.name),
    ['Giar', 'Rochman'],
  );
});

test('keeps existing text, type, and division filters working together with status', () => {
  assert.deepEqual(
    filterInterns(interns, { search: 'riz', type: 'INSTITUTION', division: 'CORE', team: '', status: 'ACTIVE' }).map(
      (item) => item.name,
    ),
    ['Rizkia'],
  );
});

test('keeps division and team filters separated when names overlap', () => {
  assert.deepEqual(
    filterInterns(interns, { search: '', type: '', division: 'CORE', team: '', status: '' }).map((item) => item.name),
    ['Rizkia', 'Giar'],
  );

  assert.deepEqual(
    filterInterns(interns, { search: '', type: '', division: '', team: 'CORE', status: '' }).map((item) => item.name),
    ['Dian'],
  );
});

test('sorts interns by latest and oldest join date', () => {
  assert.deepEqual(sortInterns(interns, 'startDateDesc').map((item) => item.name), [
    'Dian',
    'Fikran',
    'Noval',
    'Rizkia',
    'Rochman',
    'Giar',
  ]);

  assert.deepEqual(sortInterns(interns, 'startDateAsc').map((item) => item.name), [
    'Giar',
    'Rochman',
    'Rizkia',
    'Fikran',
    'Noval',
    'Dian',
  ]);
});

test('sorts interns by latest and oldest end date', () => {
  assert.deepEqual(sortInterns(interns, 'endDateDesc').map((item) => item.name), [
    'Dian',
    'Giar',
    'Fikran',
    'Noval',
    'Rizkia',
    'Rochman',
  ]);

  assert.deepEqual(sortInterns(interns, 'endDateAsc').map((item) => item.name), [
    'Rochman',
    'Rizkia',
    'Noval',
    'Fikran',
    'Giar',
    'Dian',
  ]);
});
