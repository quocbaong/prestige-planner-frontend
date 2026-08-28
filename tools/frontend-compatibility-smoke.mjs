import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const sourceFiles = [];
const walk = directory => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (/\.(js|jsx|ts|tsx)$/.test(entry.name)) sourceFiles.push(file);
  }
};
walk(path.join(root, 'src'));

execFileSync(process.execPath, [path.join(root, 'tools', 'check-api-boundary.mjs')], { cwd: root, stdio: 'inherit' });

const axios = read('src/lib/axios.js');
assert.equal((axios.match(/axios\.create\s*\(/g) || []).length, 1);
assert.ok(!/https?:\/\/(?:localhost|127\.0\.0\.1)/.test(axios), 'canonical client must not hard-code a Gateway fallback');
for (const term of ['VITE_API_URL', 'gatewayBaseUrl', 'refreshPromise', '_retry', 'X-Correlation-Id', 'correlationId', 'details', 'clearSession']) {
  assert.ok(axios.includes(term), `canonical client is missing ${term}`);
}

const mappings = {
  'src/services/authService.js': ['/auth/login', '/auth/logout'],
  'src/services/notificationService.js': ['/notifications', '/notifications/read-all'],
  'src/services/broadcastService.js': ['/admin/broadcast'],
  'src/services/adminEventService.js': ['/admin/events'],
  'src/services/settingsService.js': ['/admin/settings/event', '/admin/settings/payment'],
  'src/services/dashboardService.js': ['/organizer/events/${eventId}/ticket-metrics', '/organizer/events/${eventId}/order-metrics', '/admin/dashboard/finance'],
  'src/services/reportService.js': ['/organizer/reports/financial'],
};
for (const [file, terms] of Object.entries(mappings)) {
  const source = read(file);
  for (const term of terms) assert.ok(source.includes(term), `${file} is missing ${term}`);
}

const apiSurface = sourceFiles.filter(file => !file.endsWith(`${path.sep}lib${path.sep}axios.js`))
  .map(file => fs.readFileSync(file, 'utf8')).join('\n');
for (const forbidden of ['/admin/dashboard/export', '/admin/settings', '/organizer/dashboard/overview', '/organizer/dashboard/attendees', '/organizer/dashboard/checkin-density', '/organizer/dashboard/audience-segments', '/organizer/dashboard/conversion-funnel', '/organizer/dashboard/events', '/organizer/reports/export']) {
  if (forbidden === '/admin/settings') continue;
  assert.ok(!apiSurface.includes(forbidden), `legacy dashboard/report endpoint remains: ${forbidden}`);
}
assert.ok(!read('src/pages/SettingsPage.jsx').includes("api.get('/admin/settings')"));
assert.ok(!read('src/pages/SettingsPage.jsx').includes("api.post('/admin/settings')"));
for (const forbidden of ['marketplaceService', 'chatService', 'aiService', '/api/v1/marketplace', '/api/v1/chat', '/api/v1/ai']) {
  assert.ok(!apiSurface.includes(forbidden), `Phase 11 must not add ${forbidden}`);
}

for (const term of ['notificationService.list()', 'notificationService.markRead', 'notificationService.markAllRead']) {
  assert.ok(read('src/pages/NotificationPage.jsx').includes(term), `notification regression mapping missing ${term}`);
}
assert.ok(read('src/pages/BroadcastPage.jsx').includes('broadcastService.send'));
assert.ok(read('src/pages/DashboardPage.jsx').includes('adminEventService.list'));
assert.ok(read('src/pages/SettingsPage.jsx').includes('settingsService.savePayment'));
assert.ok(read('src/pages/OrganizerReportTemplatesPage.jsx').includes('reportService.exportFinancial'));
assert.ok(!read('src/pages/OrganizerReportTemplatesPage.jsx').includes('Promise.resolve({ data: null })'));
assert.ok(!read('src/pages/SupportPage.jsx').includes('ticketSuccess'));

console.log(`PASS: frontend compatibility smoke (${sourceFiles.length} source files scanned)`);
