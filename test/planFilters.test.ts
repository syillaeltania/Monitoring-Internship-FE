import test from 'node:test';
import assert from 'node:assert/strict';
import { filterPlansByStatus, getPlanDisplayStatus, isCompletedPlan, sortPlans } from '../src/utils/planFilters.ts';

const plans = [
  { id: '1', name: 'Dian', plannedStartDate: '2026-08-10', plannedEndDate: '2026-12-10', processStatus: 'WAITING_JOIN' },
  { id: '2', name: 'Rizkia', plannedStartDate: '2026-06-23', plannedEndDate: '2026-07-23', processStatus: 'COMPLETED' },
  { id: '3', name: 'Salsa', plannedStartDate: '2026-07-05', plannedEndDate: '2026-11-05', processStatus: 'COMPLETION_CHECKLIST_DONE' },
  { id: '4', name: 'Nurul', plannedStartDate: '2026-06-01', plannedEndDate: '2026-09-01', processStatus: 'WAITING_JOIN' },
];

test('sorts plans by nearest and farthest planned join date', () => {
  assert.deepEqual(sortPlans(plans, 'joinDateAsc').map((plan) => plan.name), ['Nurul', 'Rizkia', 'Salsa', 'Dian']);
  assert.deepEqual(sortPlans(plans, 'joinDateDesc').map((plan) => plan.name), ['Dian', 'Salsa', 'Rizkia', 'Nurul']);
});

test('detects completed plan statuses for dark navy row highlighting', () => {
  assert.equal(isCompletedPlan(plans[0]), false);
  assert.equal(isCompletedPlan(plans[1]), true);
  assert.equal(isCompletedPlan(plans[2]), true);
});

test('shows on going for plans whose join period has started and is still running', () => {
  const today = new Date('2026-06-19T00:00:00.000Z');

  assert.equal(getPlanDisplayStatus(plans[0], today), 'WAITING_JOIN');
  assert.equal(getPlanDisplayStatus(plans[1], today), 'COMPLETED');
  assert.equal(getPlanDisplayStatus(plans[3], today), 'ON_GOING');
});

test('filters plans by displayed process status including automatic on going', () => {
  const today = new Date('2026-06-19T00:00:00.000Z');

  assert.deepEqual(filterPlansByStatus(plans, 'ON_GOING', today).map((plan) => plan.name), ['Nurul']);
  assert.deepEqual(filterPlansByStatus(plans, 'COMPLETED', today).map((plan) => plan.name), ['Rizkia']);
  assert.deepEqual(filterPlansByStatus(plans, '', today).map((plan) => plan.name), ['Dian', 'Rizkia', 'Salsa', 'Nurul']);
});
