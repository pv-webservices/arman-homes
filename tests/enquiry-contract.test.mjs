import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('enquiry code has no email delivery path or mandatory email collection', async () => {
  const form = await readFile('src/components/InquiryForm.astro', 'utf8');
  const handler = await readFile('src/scripts/enquiry.ts', 'utf8');
  assert.doesNotMatch(form + handler, /formsubmit|emailjs|nodemailer|smtp|resend|_replyto|_next|fetch\(/i);
  assert.doesNotMatch(form, /name: 'email'|name="email"/);
  assert.match(form, /Enquire on WhatsApp/);
  assert.match(form, /data-copy-message/);
  assert.match(handler, /Source Page:/);
});
