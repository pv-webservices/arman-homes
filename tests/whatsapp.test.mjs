import test from 'node:test';
import assert from 'node:assert/strict';
import { buildEnquiryMessage, whatsappUrl } from '../src/scripts/whatsapp.mjs';

test('message starts with the intro and lists each answered field by its label', () => {
  const text = buildEnquiryMessage('Hello Arman Homes, I have a property enquiry.', [
    ['Project', 'Echoes'],
    ['Full Name', '  Test Visitor '],
    ['Phone Number', '+91 90000 00000'],
    ['Message', 'Looking for a 2 BHK.\nNear Hinjawadi.'],
  ]);
  assert.equal(text, [
    'Hello Arman Homes, I have a property enquiry.',
    '',
    '*Project:* Echoes',
    '*Full Name:* Test Visitor',
    '*Phone Number:* +91 90000 00000',
    '*Message:* Looking for a 2 BHK.\nNear Hinjawadi.',
  ].join('\n'));
});

test('empty answers are left out of the message', () => {
  assert.equal(buildEnquiryMessage('Hi', [['Email Address', ''], ['Full Name', '   ']]), 'Hi');
});

test('WhatsApp link uses the business number and encodes the message', () => {
  assert.equal(whatsappUrl('https://wa.me/919354210824', 'Hi & bye\n2 BHK'), 'https://wa.me/919354210824?text=Hi%20%26%20bye%0A2%20BHK');
});

test('WhatsApp link rejects anything that is not a wa.me address', () => {
  assert.throws(() => whatsappUrl('https://example.com/919354210824', 'Hi'), /wa\.me/);
  assert.throws(() => whatsappUrl('http://wa.me/919354210824', 'Hi'), /wa\.me/);
});
