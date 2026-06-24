import test from 'node:test';
import assert from 'node:assert/strict';
import type { Intern } from '../src/services/api.ts';
import { buildEndingSoonReminders, buildReplacementBoard, buildSchedulerRows, officialReplacementTeams, getMonthInterns, getReplacementCellTone } from '../src/utils/replacementScheduler.ts';

const interns: Intern[] = [
  {
    id: 'i-1',
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
    id: 'i-2',
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
    id: 'i-3',
    name: 'Randi Gunawan',
    type: 'INSTITUTION',
    institution: 'UNLA',
    division: 'CORE',
    team: 'CLC',
    position: 'Admin',
    leader: 'Rangga',
    startDate: '2026-03-30',
    endDate: '2026-06-13',
    status: 'ACTIVE',
  },
  {
    id: 'i-4',
    name: 'Meida Nur Janah',
    type: 'INSTITUTION',
    institution: 'LPKIA',
    division: 'CORE',
    team: 'CLC',
    position: 'Admin',
    leader: 'Rangga',
    startDate: '2026-04-13',
    endDate: '2026-07-24',
    status: 'ACTIVE',
  },
  {
    id: 'i-5',
    name: 'Salsa Fauzia',
    type: 'INSTITUTION',
    institution: 'UNLA',
    division: 'CORE',
    team: 'HCM',
    position: 'Admin',
    leader: 'Ryan',
    startDate: '2026-02-18',
    endDate: '2026-06-25',
    status: 'ACTIVE',
  },
  {
    id: 'i-6',
    name: 'Completed Intern',
    type: 'INSTITUTION',
    institution: 'UNLA',
    division: 'CORE',
    team: 'HCM',
    startDate: '2026-01-01',
    endDate: '2026-06-20',
    status: 'COMPLETED',
  },
  {
    id: 'p-1',
    name: 'Giar Sabiansyah',
    type: 'PROFESSIONAL',
    institution: 'SMKN 4 Bandung',
    division: 'CORE',
    team: 'LOG',
    position: 'Log',
    leader: 'Soleh',
    startDate: '2025-06-30',
    endDate: '2026-12-31',
    status: 'ACTIVE',
  },
];

const replacementRows = [
  {
    id: 'r-core-finance',
    division: 'CORE',
    team: 'FINANCE',
    leader: 'Irena',
    activeInstitutionCount: 1,
    activeProfessionalCount: 0,
    minimumInstitutionNeed: 1,
    replacementStatus: 'NEEDS_REPLACEMENT',
    soonestEndDate: '2026-07-25',
  },
];

test('builds scheduler rows from replacement needs and master participant placements', () => {
  const rows = buildSchedulerRows(replacementRows, interns);

  assert.equal(rows.length, officialReplacementTeams.length);
  assert.equal(rows.some((row) => row.division === 'CORE' && row.team === 'FINANCE'), true);
  assert.equal(rows.some((row) => row.division === 'CORE' && row.team === 'CLC'), true);
  assert.equal(rows.some((row) => row.division === 'CORE' && row.team === 'HCM'), true);
  assert.equal(rows.some((row) => row.division === 'NEW BUSINESS' && row.team === 'NB-2 (PGN)'), true);
});

test('marks yellow only in the participant last active month', () => {
  const financeRow = buildSchedulerRows(replacementRows, interns).find((row) => row.team === 'FINANCE')!;

  assert.equal(getReplacementCellTone(financeRow, interns, 2026, 5), 'active');
  assert.equal(getReplacementCellTone(financeRow, interns, 2026, 6), 'ending');
  assert.equal(getReplacementCellTone(financeRow, interns, 2026, 7), 'empty');
});

test('marks a team with more than one active intern as dark gray even when one intern ends that month', () => {
  const rows = buildSchedulerRows(replacementRows, interns);
  const clcRow = rows.find((row) => row.team === 'CLC')!;

  assert.equal(getReplacementCellTone(clcRow, interns, 2026, 5), 'multi');
});

test('month participants come only from institution interns in the same placement', () => {
  const rows = buildSchedulerRows(replacementRows, interns);
  const financeRow = rows.find((row) => row.team === 'FINANCE')!;
  const logRow = rows.find((row) => row.team === 'LOG');

  assert.equal(logRow, undefined);
  assert.deepEqual(getMonthInterns(financeRow, interns, 2026, 6).map((intern) => intern.name), ['Rizkia Fawziya']);
});

test('builds notifications from active institution interns ending within 3 months', () => {
  const reminders = buildEndingSoonReminders(interns, new Date('2026-06-19T00:00:00.000Z'));

  assert.deepEqual(
    reminders.map((item) => ({
      name: item.name,
      division: item.division,
      team: item.team,
      daysLeft: item.daysLeft,
    })),
    [
      {
        name: 'Salsa Fauzia',
        division: 'CORE',
        team: 'HCM',
        daysLeft: 6,
      },
      {
        name: 'Meida Nur Janah',
        division: 'CORE',
        team: 'CLC',
        daysLeft: 35,
      },
      {
        name: 'Rizkia Fawziya',
        division: 'CORE',
        team: 'FINANCE',
        daysLeft: 36,
      },
    ],
  );
});

test('groups replacement rows into risk board columns', () => {
  const rows = buildSchedulerRows(
    [
      ...replacementRows,
      {
        id: 'urgent-row',
        division: 'TELCO',
        team: 'TELCO-5',
        leader: 'Fitrian',
        activeInstitutionCount: 0,
        activeProfessionalCount: 0,
        minimumInstitutionNeed: 1,
        replacementStatus: 'URGENT_EMPTY',
      },
    ],
    interns,
  );

  const board = buildReplacementBoard(rows, interns, new Date('2026-06-19T00:00:00.000Z'));

  assert.equal(board.urgent.some((item) => item.team === 'TELCO-5'), false);
  assert.equal(board.urgent.some((item) => item.team === 'SMART (PR)'), true);
  assert.deepEqual(board.h30.map((item) => item.team), ['HCM']);
  assert.deepEqual(board.h90.map((item) => item.team), ['CLC', 'FINANCE']);
  assert.deepEqual(board.safe.map((item) => item.team), ['NB-2 (PGN)']);
});

test('scheduler rows follow the official replacement team structure only', () => {
  const rows = buildSchedulerRows(
    [
      {
        id: 'outside-row',
        division: 'CORE',
        team: 'OUTSIDE TEAM',
        activeInstitutionCount: 0,
        activeProfessionalCount: 0,
        minimumInstitutionNeed: 1,
        replacementStatus: 'URGENT_EMPTY',
      },
    ],
    [
      ...interns,
      {
        id: 'outside-intern',
        name: 'Outside Intern',
        type: 'INSTITUTION',
        institution: 'UNLA',
        division: 'CORE',
        team: 'OUTSIDE TEAM',
        startDate: '2026-06-01',
        endDate: '2026-12-31',
        status: 'ACTIVE',
      },
    ],
  );

  assert.equal(rows.length, officialReplacementTeams.length);
  assert.equal(rows.some((row) => row.team === 'OUTSIDE TEAM'), false);
  assert.equal(rows.some((row) => row.division === 'BUSDEV' && row.team === 'SMART (PR)'), true);
  assert.equal(rows.some((row) => row.division === 'TELCO' && row.team === 'TELCO-3'), true);
});
