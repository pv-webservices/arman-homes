// Builds the WhatsApp enquiry message. Enquiries are only ever sent by the visitor from WhatsApp.

/**
 * @param {string} intro opening line of the message
 * @param {[string, string][]} answers [label, value] pairs in form order
 * @returns {string}
 */
export function buildEnquiryMessage(intro, answers) {
  const lines = answers
    .map(([label, value]) => [label, String(value).trim()])
    .filter(([, value]) => value)
    .map(([label, value]) => `*${label}:* ${value}`);
  return lines.length ? [intro, '', ...lines].join('\n') : intro;
}

/**
 * @param {string} base business chat link, e.g. https://wa.me/919354210824
 * @param {string} text message to prefill
 * @returns {string}
 */
export function whatsappUrl(base, text) {
  const url = new URL(base);
  if (url.protocol !== 'https:' || url.hostname !== 'wa.me') throw new Error('WhatsApp link must be an https://wa.me address');
  return `${url.origin}${url.pathname}?text=${encodeURIComponent(text)}`;
}
