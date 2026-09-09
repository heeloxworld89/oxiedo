// ui_ux/10_CONTACT_UI.md §2-3, design/10_CONTACT.md. Progressive enhancement over markup that
// already renders four complete, labelled forms (FormField, task 1.9 / contact.astro, task 3.6).
// Validation fires on blur only. Submission POSTs to /contact (functions/contact.ts, task 4.6,
// follows Cloudflare Pages' convention of a top-level functions/ file mirroring its route — the
// same URL as the page, a different method).

// WHERE SUBMISSIONS GO. Two supported shapes; switching between them is this one constant.
//
//   A third-party relay (the default). Works on ANY static host, because it is a plain
//   cross-origin POST from the browser and needs no backend of ours. The default precisely so the
//   contact form is not blocked on a hosting decision.
//
//   '/contact'. Uses functions/contact.ts — server-side validation, IP rate limiting, and Resend.
//   Strictly better, and Cloudflare Pages only. Switch the moment the site deploys there.
//
// The recipient address is deliberately NOT rendered anywhere on the site: it is on a
// founder-owned domain that is not Oxiedo's, and an address whose domain does not match the site
// reads as a mistake or a phish. It exists here, in the endpoint, and nowhere a reader sees.
//
// FIRST-RUN STEP, once: the first submission triggers a one-off confirmation email to that
// address. Click the link in it and everything after that delivers silently.
const FORM_ENDPOINT = 'https://formsubmit.co/ajax/rokib@blackbloxie.com';

// Human-readable intent names, used in the subject line so a message is triageable from the inbox
// list without opening it.
const INTENTS: Record<string, string> = {
	'pre-book': 'pre-booking a deployment',
	invest: 'investment conversation',
	press: 'press enquiry',
	data: 'data protection request',
	apply: 'application',
	other: 'general enquiry',
};

const CONFIRMATIONS: Record<string, string> = {
	'pre-book': 'Received, and read personally. You will hear back within a few days, usually less.',
	invest: 'Received. We will reply to say whether this is a fit for the thesis. If it is, the material follows; if it is not, we say so plainly.',
	press: 'Received. Replies come from the people who built the architecture, usually within a few days. A stated deadline gets a faster answer.',
	data: 'Received. Data requests are answered within five working days, and a deletion request is acted on immediately and confirmed in writing.',
	apply: 'Received, and it reaches the people who built the architecture. A poor fit gets a direct answer rather than silence.',
	other: 'Received. We read everything personally and reply within a few days, usually less.',
};

// Includes HTMLSelectElement: the role picker on /careers carries .form-field-input and is
// required, so it goes through the same validation path as every text field.
type Field = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

function fieldMessage(input: Field): string {
	if (input.validity.valueMissing) {
		const label = input.labels?.[0]?.textContent?.trim().toLowerCase() ?? 'this field';
		return `Enter ${label}.`;
	}
	if (input.validity.typeMismatch && (input as HTMLInputElement).type === 'email')
		return 'Enter a work email address.';
	return 'Check this field.';
}

function setFieldState(input: Field, state: 'default' | 'error' | 'success') {
	input.classList.remove('form-field-input--default', 'form-field-input--error', 'form-field-input--success');
	input.classList.add(`form-field-input--${state}`);
}

function validateField(input: Field) {
	const errorId = `${input.id}-error`;
	let message = document.getElementById(errorId);
	if (input.checkValidity()) {
		setFieldState(input, 'success');
		message?.remove();
		input.removeAttribute('aria-describedby');
		return true;
	}
	setFieldState(input, 'error');
	if (!message) {
		message = document.createElement('p');
		message.id = errorId;
		message.className = 'form-field-error';
		input.insertAdjacentElement('afterend', message);
	}
	message.textContent = fieldMessage(input);
	input.setAttribute('aria-describedby', errorId);
	return false;
}

// RESTRUCTURED 2026-09-06 for the ClientRouter. Two hazards this guards against: re-running
// must not bind blur handlers twice on a form that survived navigation, and it must not append
// a second status paragraph after each form. The data-form-bound marker makes init idempotent.
export default function init() {
// Bound by ACTION, not by class. This selector was '.contact-form', which silently stopped
// matching the four forms on /contact when they were renamed to .contact-panel in the switching
// -form rebuild, and never matched .invest-form at all — so the two highest-value pages on the
// site lost inline validation, async submit and the status message with no error anywhere. The
// forms still posted natively, so nothing looked wrong. Keying on the endpoint means any form
// that submits to it is enhanced, and a future class rename cannot break the binding again.
document.querySelectorAll<HTMLFormElement>('form[action="/contact"]').forEach((form) => {
	if (form.dataset.formBound === 'true') return;
	form.dataset.formBound = 'true';

	form.querySelectorAll<Field>('.form-field-input').forEach((input) => {
		input.addEventListener('blur', () => validateField(input));
	});

	const status = document.createElement('p');
	status.className = 'contact-form-status';
	status.setAttribute('aria-live', 'polite');
	form.insertAdjacentElement('afterend', status);

	form.addEventListener('submit', async (event) => {
		event.preventDefault();

		const inputs = Array.from(form.querySelectorAll<Field>('.form-field-input'));
		const results = inputs.map(validateField);
		const firstInvalid = inputs[results.indexOf(false)];
		if (firstInvalid) {
			firstInvalid.focus();
			return;
		}

		const intent = String(new FormData(form).get('intent') ?? 'other');
		const submitBtn = form.querySelector<HTMLButtonElement>('button[type="submit"]');
		const originalLabel = submitBtn?.textContent ?? '';
		if (submitBtn) {
			submitBtn.disabled = true;
			submitBtn.textContent = 'Sending…';
		}
		status.classList.remove('contact-form-status--error');
		status.textContent = '';

		try {
			const data = new FormData(form);
			// Relay control fields. Harmless to the Cloudflare function, which ignores unknown keys.
			if (FORM_ENDPOINT.startsWith('http')) {
				data.append('_subject', `Oxiedo — ${INTENTS[intent] ?? intent}`);
				data.append('_captcha', 'false');
				data.append('_template', 'table');
			}
			const response = await fetch(FORM_ENDPOINT, {
				method: 'POST',
				body: data,
				headers: { Accept: 'application/json' },
			});
			if (!response.ok) throw new Error('send failed');

			form.hidden = true;
			status.textContent = CONFIRMATIONS[intent] ?? CONFIRMATIONS.other;
		} catch {
			status.classList.add('contact-form-status--error');
			status.textContent =
				'That did not send. Nothing typed has been lost: every field is exactly as it was, so press send again. If it fails twice, give it a minute and retry; the form will not clear.';
			if (submitBtn) {
				submitBtn.disabled = false;
				submitBtn.textContent = originalLabel;
			}
		}
	});
});
}
