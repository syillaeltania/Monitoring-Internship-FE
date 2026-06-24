import assert from 'node:assert/strict';
import test from 'node:test';
import { buildOrganizationDropPayload } from '../src/utils/organizationMapping.ts';

test('builds participant mapping payload from organization drop target', () => {
  assert.deepEqual(
    buildOrganizationDropPayload('BUSDEV', {
      title: 'SMART',
      leader: 'Rahadi Aji',
      matchTeams: ['SMART (PR)', 'SMART (Admin)', 'SMART'],
    }),
    {
      division: 'BUSDEV',
      team: 'SMART (PR)',
      leader: 'Rahadi Aji',
    },
  );
});
