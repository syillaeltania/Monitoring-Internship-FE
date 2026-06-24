import assert from 'node:assert/strict';
import test from 'node:test';
import type { Intern } from '../src/services/api.ts';
import { buildCsv, filterReportInterns, formatReportDate, participantRows, summarizeReportInterns } from '../src/utils/reporting.ts';

const interns: Intern[] = [
  {
    id: '1',
    name: 'Rizkia Fawziya',
    type: 'INSTITUTION',
    institution: 'UNLA',
    division: 'CORE',
    team: 'FINANCE',
    position: 'Admin',
    leader: 'Irena',
    startDate: '2026-02-05',
    endDate: '2026-07-25',
    status: 'ACTIVE',
  },
  {
    id: '2',
    name: 'Fikran Mahdan Nuha',
    type: 'INSTITUTION',
    institution: 'ARS University',
    division: 'NEW BUSINESS',
    team: 'NB-2 (PGN)',
    position: 'QA',
    leader: 'Hafiz',
    startDate: '2026-03-09',
    endDate: '2026-11-09',
    status: 'ACTIVE',
  },
  {
    id: '3',
    name: 'Aulia Zhafira',
    type: 'PROFESSIONAL',
    institution: 'POLBAN',
    division: 'CORE',
    team: 'HCM',
    position: 'HCM',
    leader: 'Ryan N',
    startDate: '2026-05-04',
    endDate: '2026-11-04',
    status: 'COMPLETED',
  },
];

test('filters report participants by active period, division category, status, and leader', () => {
  const filtered = filterReportInterns(interns, {
    year: '2026',
    month: '6',
    division: 'CORE',
    type: '',
    status: 'ACTIVE',
    leader: 'ire',
  });

  assert.deepEqual(filtered.map((item) => item.name), ['Rizkia Fawziya']);
});

test('summarizes report participants by type and status', () => {
  const summary = summarizeReportInterns(interns);

  assert.equal(summary.total, 3);
  assert.equal(summary.institution, 2);
  assert.equal(summary.professional, 1);
  assert.equal(summary.active, 2);
  assert.equal(summary.completed, 1);
});

test('builds csv with escaped values', () => {
  const csv = buildCsv(['Nama', 'Notes'], [['Dian "QA"', 'CORE, HCM']]);

  assert.equal(csv, '"Nama","Notes"\n"Dian ""QA""","CORE, HCM"');
});

test('formats report dates as readable Indonesian dates', () => {
  assert.equal(formatReportDate('2024-05-28T00:00:00.000Z'), '28 Mei 2024');
});

test('participant rows use readable dates for start and end date', () => {
  const row = participantRows([interns[0]])[0];

  assert.equal(row[7], '05 Feb 2026');
  assert.equal(row[8], '25 Jul 2026');
});
