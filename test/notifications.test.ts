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
  assert.match(notificationSeverityClass('danger'), /FFB3A4|C64632/);
  assert.match(notificationSeverityClass('warning'), /F7D95D|8A6A00/);
  assert.match(notificationSeverityClass('info'), /3158E8/);
});
