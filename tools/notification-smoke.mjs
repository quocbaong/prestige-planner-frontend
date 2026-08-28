import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');

const page = read('src/pages/NotificationPage.jsx');
const dropdown = read('src/components/common/NotificationDropdown.jsx');
const broadcast = read('src/pages/BroadcastPage.jsx');
const headers = [
  read('src/components/layouts/parts/Header.jsx'),
  read('src/components/layouts/parts/AttendeeHeader.jsx'),
  read('src/components/layouts/parts/OrganizerHeader.jsx')
];

assert.match(page, /notificationService\.list\(\)/);
assert.match(page, /notificationService\.markRead\(notif\.id\)/);
assert.match(page, /notificationService\.markAllRead\(\)/);
assert.match(dropdown, /notificationService\.markAllRead\(\)/);
assert.match(dropdown, /onNotificationStateChanged\?\.\(\)/);
assert.match(broadcast, /broadcastService\.getPage\(\)/);
assert.match(broadcast, /broadcastService\.send\(/);
for (const header of headers) assert.match(header, /onNotificationStateChanged=\{fetch(?:Notifications|UnreadCount)\}/);

console.log('PASS: notification/read-all/broadcast smoke contract');
