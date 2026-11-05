import { whatsappUrl } from '../data/site';

document.querySelectorAll<HTMLFormElement>('[data-inquiry-form]').forEach(form => {
  const status = form.querySelector<HTMLElement>('[data-form-status]')!;
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
  const draft = form.querySelector<HTMLAnchorElement>('[data-draft-link]')!;
  const fallback = form.querySelector<HTMLElement>('[data-form-fallback]')!;
  const preview = form.querySelector<HTMLTextAreaElement>('[data-message-preview]')!;
  const manualCopy = form.querySelector<HTMLElement>('[data-manual-copy]')!;
  const fields = [...form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('[data-validate]')];
  let locked = false;
  let message = '';
  const restore = () => { locked = false; button.disabled = false; };
  addEventListener('pageshow', restore);
  const validate = (field: typeof fields[number]) => {
    const value = field.value.trim();
    let error = '';
    if (field.type === 'checkbox') {
      if (field.required && !(field as HTMLInputElement).checked) error = 'Please agree to share your details before continuing.';
    } else if (field.required && !value) error = 'Please complete this field.';
    else if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) {
      if (field.minLength > 0 && value.length < field.minLength) error = `Please enter at least ${field.minLength} characters.`;
      if (field.maxLength > 0 && value.length > field.maxLength) error = `Please enter no more than ${field.maxLength} characters.`;
      if (field.type === 'tel' && value && (!/^\+?[0-9 ()\-.]+$/.test(value) || !/^\d{10,15}$/.test(value.replace(/\D/g, '')))) error = 'Please enter a valid phone number (10–15 digits).';
    }
    if (field instanceof HTMLSelectElement && value && ![...field.options].some(option => option.value === value)) error = 'Please select an available option.';
    document.getElementById(`${field.id}-error`)?.replaceChildren(error);
    field.setAttribute('aria-invalid', String(!!error));
    return !error;
  };
  fields.forEach(field => field.addEventListener('input', () => {
    if (field.getAttribute('aria-invalid') === 'true') validate(field);
    status.textContent = '';
    fallback.hidden = true;
    manualCopy.hidden = true;
    message = preview.value = '';
    draft.href = whatsappUrl();
  }));
  form.querySelector<HTMLButtonElement>('[data-copy-message]')!.addEventListener('click', async () => {
    if (!message) return;
    try {
      await navigator.clipboard.writeText(message);
      status.textContent = 'Message copied. Paste it into WhatsApp, review it and send when ready.';
    } catch {
      preview.value = message;
      manualCopy.hidden = false;
      preview.focus();
      preview.select();
      status.textContent = 'Select and copy the message below, then paste it into WhatsApp.';
    }
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (locked) return;
    fallback.hidden = true;
    const validity = fields.map(validate);
    if (validity.includes(false)) {
      status.textContent = 'Please check the highlighted fields. Your enquiry has not been sent.';
      fields[validity.indexOf(false)].focus();
      return;
    }
    const data = new FormData(form);
    const value = (key: string) => String(data.get(key) || '').trim();
    const entries = [
      ['Name', value('full_name')], ['Phone', value('phone')],
      ['Project', value('project')], ['Enquiry Type', value('inquiry_type') || 'Sell Property'],
      ['Property Location', value('property_location')], ['Property Type', value('property_type')],
      ['Property Details', value('property_details')], ['Message', value('message')],
    ];
    // Query strings may contain unrelated personal information; use the canonical source path.
    message = ['New Website Enquiry — Arman Homes', ...entries.filter(([, value]) => value).map(([label, value]) => `${label}: ${value}`), `Source Page: ${form.dataset.source}`].join('\n');
    draft.href = whatsappUrl(message);
    fallback.hidden = false;
    if (!navigator.onLine) {
      status.textContent = 'You appear to be offline. Your details are still here. Copy the message or reconnect to open WhatsApp.';
      return;
    }
    locked = true;
    button.disabled = true;
    try {
      // Open within the user action and sever opener before navigating externally.
      const chat = window.open('about:blank', '_blank');
      if (!chat) throw new Error('Popup blocked');
      chat.opener = null;
      chat.location.replace(draft.href);
      status.textContent = 'WhatsApp opened. Review and send your message there. Delivery is not confirmed.';
    } catch {
      status.textContent = 'Unable to open WhatsApp automatically. Your details are still here. Use the direct link, copy the message or call us.';
    } finally { window.setTimeout(restore, 1200); }
  });
  // The disabled native submit protects no-JS visitors; direct contact links remain available.
  form.noValidate = true;
  button.disabled = false;
});
