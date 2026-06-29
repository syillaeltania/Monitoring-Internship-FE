import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPlanFormFromPlan, emptyPlanForm } from '../src/utils/planForm.ts';

test('builds an editable plan form from existing plan data', () => {
  const form = buildPlanFormFromPlan({
    name: 'Milka Nastiti Supritha',
    type: 'INSTITUTION',
    institution: 'Universitas Telkom',
    major: 'SIA',
    targetDivision: 'BUSDEV',
    targetTeam: 'SMART',
    leader: 'Rahadi Aji',
    acceptanceLetterDate: '2026-06-20T00:00:00.000Z',
    plannedStartDate: '2026-07-01T00:00:00.000Z',
    plannedEndDate: '2027-06-25T00:00:00.000Z',
    documentStatus: 'Lengkap',
    onboardingStatus: 'Belum onboarding',
    processStatus: 'WAITING_JOIN',
    phone: '08123',
    notes: 'Perlu mapping final',
  });

  assert.deepEqual(form, {
    name: 'Milka Nastiti Supritha',
    type: 'INSTITUTION',
    institution: 'Universitas Telkom',
    major: 'SIA',
    targetDivision: 'BUSDEV',
    targetTeam: 'SMART',
    leader: 'Rahadi Aji',
    acceptanceLetterDate: '2026-06-20',
    plannedStartDate: '2026-07-01',
    plannedEndDate: '2027-06-25',
    documentStatus: 'Lengkap',
    onboardingStatus: 'Belum onboarding',
    processStatus: 'WAITING_JOIN',
    phone: '08123',
    notes: 'Perlu mapping final',
  });
});

test('empty plan form defaults to waiting join workflow', () => {
  assert.equal(emptyPlanForm().processStatus, 'WAITING_JOIN');
});
