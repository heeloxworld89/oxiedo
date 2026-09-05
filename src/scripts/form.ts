// ui_ux/10_CONTACT_UI.md §2-3, design/10_CONTACT.md. Progressive enhancement over markup that
// already renders four complete, labelled forms (FormField, task 1.9 / contact.astro, task 3.6).
// Validation fires on blur only. Submission POSTs to /contact (functions/contact.ts, task 4.6,
// follows Cloudflare Pages' convention of a top-level functions/ file mirroring its route — the
// same URL as the page, a different method).

const CONFIRMATIONS: Record<string, string> = {
	book: 'Your session request has been received. You will hear from us within a few days — usually less. Come prepared to describe one specific training failure.',
	'pre-book': 'Your application has been received. Charter Partner applications are reviewed personally. You will hear from us within a few days.',
	invest: 'We will read your message and reply to let you know if the brief is a fit for what you invest in. If it is, we will send it. If it is not, we will say so plainly.',
	other: 'Your message is logged. We read everything personally and respond within a few days — usually less.',
};

const FAILURE_MESSAGE =
	'That did not send. Email [REPLACE WITH DOMAIN EMAIL BEFORE LAUNCH] directly and we will pick it up.';

function fieldMessage(input: HTMLInputElement): string {
	if (input.validity.valueMissing) {
		const label = input.labels?.[0]?.textContent?.trim().toLowerCase() ?? 'this field';
		return `Enter ${label}.`;
	}
	if (input.validity.typeMismatch && input.type === 'email') return 'Enter a work email address.';
	return 'Check this field.';
}

function setFieldState(input: HTMLInputElement, state: 'default' | 'error' | 'success') {
	input.classList.remove('form-field-input--default', 'form-field-input--error', 'form-field-input--success');
	input.classList.add(`form-field-input--${state}`);
}

function validateField(input: HTMLInputElement) {
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

document.querySelectorAll<HTMLFormElement>('.contact-form').forEach((form) => {
	form.querySelectorAll<HTMLInputElement>('.form-field-input').forEach((input) => {
		input.addEventListener('blur', () => validateField(input));
	});

	const status = document.createElement('p');
	status.className = 'contact-form-status';
	status.setAttribute('aria-live', 'polite');
	form.insertAdjacentElement('afterend', status);

	form.addEventListener('submit', async (event) => {
		event.preventDefault();

		const inputs = Array.from(form.querySelectorAll<HTMLInputElement>('.form-field-input'));
		const results = inputs.map(validateField);
		const firstInvalid = inputs[results.indexOf(false)];
		if (firstInvalid) {
			firstInvalid.focus();
			return;
		}

		const submitBtn = form.querySelector<HTMLButtonElement>('button[type="submit"]');
		const originalLabel = submitBtn?.textContent ?? '';
		if (submitBtn) {
			submitBtn.disabled = true;
			submitBtn.textContent = 'Sending…';
		}
		status.classList.remove('contact-form-status--error');
		status.textContent = '';

		try {
			const response = await fetch('/contact', { method: 'POST', body: new FormData(form) });
			if (!response.ok) throw new Error('send failed');

			const intent = form.closest<HTMLElement>('section[id]')?.id ?? 'other';
			form.hidden = true;
			status.textContent = CONFIRMATIONS[intent] ?? CONFIRMATIONS.other;
		} catch {
			status.classList.add('contact-form-status--error');
			status.textContent = FAILURE_MESSAGE;
			if (submitBtn) {
				submitBtn.disabled = false;
				submitBtn.textContent = originalLabel;
			}
		}
	});
});
