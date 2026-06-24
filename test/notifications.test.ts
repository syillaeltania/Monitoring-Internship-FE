import test from 'node:test';
import assert from 'node:assert/strict';
import { countNotifications, notificationSeverityClass, notificationSeverityLabel } from '../src/utils/notifications.ts';

test('counts dashboard notifications safely', () => {
  assert.equal(countNotifications([{ title: 'A' }, { title: 'B' }]), 2);
  assert.equal(countNotifications(undefined), 0);
});

test('maps notification severity into readable labels and classes', () => {
  assert.equal(notificationSeverityLabel('danger'), 'Urgent');
  assert.equal(notificationSeverityLabel('warning'), 'Perhatian');
  assert.equal(notificationSeverityLabel('info'), 'Info');
  assert.match(notificationSeverityClass('danger'), /red/);
  assert.match(notificationSeverityClass('warning'), /amber/);
  assert.match(notificationSeverityClass('info'), /blue/);
});
