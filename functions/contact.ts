// 01_STACK.md §Hosting and forms, design/14_DATA.md. One endpoint. Validates server-side, rate-
// limits by IP, checks a honeypot, sends an email. No database, no CRM, no third-party form
// service, no logging of message bodies, no analytics.
//
// Cloudflare Pages Functions convention: this file's path (functions/contact.ts) maps directly
// to the /contact route — a POST here hits this function; a GET still serves the static page.
//
// PARTIAL / BLOCKED, honestly: rate-limit persistence needs a KV namespace, and sending an email
// needs a verified sending domain and a provider — neither is provisioned (the footer still
// reads [REPLACE WITH DOMAIN EMAIL BEFORE LAUNCH]). Both are marked TODO below and wired at
// Block 5, alongside picking and configuring the actual host. The validation, honeypot, and
// intent-routing logic below does not depend on either and is complete now.

// Minimal key-value store shape, not a specific host's SDK type — 01_STACK.md leaves the host
// (Cloudflare Pages vs Netlify) undecided until Block 5. Whichever is chosen binds its own
// concrete store (e.g. a Cloudflare KV namespace) to this same shape.
interface RateLimitStore {
	get(key: string): Promise<string | null>;
	put(key: string, value: string, options: { expirationTtl: number }): Promise<void>;
}

interface Env {
	CONTACT_RATE_LIMIT?: RateLimitStore;
	/** Resend API key. Without it this endpoint returns 502 and the client falls back to mailto. */
	RESEND_API_KEY?: string;
	/** Verified sender, e.g. "Oxiedo <contact@oxiedo.com>". Falls back to Resend's shared domain. */
	MAIL_FROM?: string;
	/** Recipient. Defaults to the founder's address, which is what the site publishes. */
	MAIL_TO?: string;
}

const INTENTS: Record<string, string> = {
	book: 'Legacy intent, no longer sent by any form',
	'pre-book': 'Pre-book a deployment',
	invest: 'Investment conversation',
	press: 'Press enquiry',
	data: 'Data protection request',
	apply: 'Application',
	other: 'Other',
};

// Mirrors the `required` attributes in src/pages/contact.astro's four forms — the client's
// HTML5 validation is not trustworthy on its own, so required fields are re-checked here.
// Fields not listed (e.g. invest-thesis) are genuinely optional and must not be rejected empty.
const REQUIRED_FIELDS: Record<string, string[]> = {
	book: ['book-name', 'book-org', 'book-frequency', 'book-cost', 'book-stack'],
	// UPDATED 2026-09-07 with the rewritten form. These names must match the `required` fields in
	// src/pages/contact.astro exactly — the old list named prebook-solution/-approach/-timeline,
	// which no longer exist, so every pre-book submission would have been rejected with a 400
	// naming a field the sender could not see.
	'pre-book': ['prebook-org', 'prebook-email', 'prebook-regulation', 'prebook-context'],
	invest: ['invest-name', 'invest-email', 'invest-org'],
	press: ['press-name', 'press-email', 'press-outlet', 'press-message'],
	data: ['data-name', 'data-email', 'data-request'],
	apply: ['apply-role', 'apply-name', 'apply-email', 'apply-why'],
	other: ['other-name', 'other-email', 'other-message'],
};

const RATE_LIMIT_WINDOW_SECONDS = 60 * 10;
const RATE_LIMIT_MAX_REQUESTS = 3;

function isNonEmptyString(value: FormDataEntryValue | null): value is string {
	return typeof value === 'string' && value.trim().length > 0;
}

async function isRateLimited(env: Env, ip: string): Promise<boolean> {
	if (!env.CONTACT_RATE_LIMIT) return false; // TODO (Block 5): KV namespace not yet provisioned.
	const key = `contact:${ip}`;
	const count = Number((await env.CONTACT_RATE_LIMIT.get(key)) ?? '0');
	if (count >= RATE_LIMIT_MAX_REQUESTS) return true;
	await env.CONTACT_RATE_LIMIT.put(key, String(count + 1), { expirationTtl: RATE_LIMIT_WINDOW_SECONDS });
	return false;
}

// Implemented 2026-09-08. Resend, because it is one fetch with no SDK — a Pages Function has no
// npm install step, so a provider that needs a client library is the wrong choice here.
//
// The body is assembled as plain text and passed straight to the provider. It is never logged,
// never persisted and never written to KV: the only copy that exists after this call returns is
// the one in the recipient's inbox.
async function sendEmail(
	env: Env,
	subject: string,
	fields: Record<string, string>,
): Promise<void> {
	if (!env.RESEND_API_KEY) {
		throw new Error('RESEND_API_KEY is not bound.');
	}

	const text = Object.entries(fields)
		.map(([k, v]) => `${k}\n${v}\n`)
		.join('\n');

	const res = await fetch('https://api.resend.com/emails', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${env.RESEND_API_KEY}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			from: env.MAIL_FROM ?? 'Oxiedo <onboarding@resend.dev>',
			to: [env.MAIL_TO ?? 'rokib@blackbloxie.com'],
			// Reply-to is whichever email field the intent actually carried, so hitting reply in the
		// inbox goes to the sender rather than to us.
		reply_to:
			fields['prebook-email'] ??
			fields['invest-email'] ??
			fields['press-email'] ??
			fields['data-email'] ??
			fields['apply-email'] ??
			fields['other-email'],
			subject,
			text,
		}),
	});

	// Deliberately not reading the body on failure: it can echo submitted content, and this
	// function does not put message content anywhere it could be captured by a log.
	if (!res.ok) throw new Error(`Provider returned ${res.status}`);
}

export const onRequestPost = async (context: { request: Request; env: Env }): Promise<Response> => {
	const { request, env } = context;

	const ip = request.headers.get('cf-connecting-ip') ?? request.headers.get('x-forwarded-for') ?? 'unknown';
	if (await isRateLimited(env, ip)) {
		return new Response('Too many requests.', { status: 429 });
	}

	let form: FormData;
	try {
		form = await request.formData();
	} catch {
		return new Response('Invalid submission.', { status: 400 });
	}

	// Honeypot — a real visitor never fills this field in. It is a decoy with no meaning for
	// humans (hidden from assistive tech via aria-hidden + tabindex="-1", positioned off-screen
	// rather than display:none, so a bot that only checks computed display still finds it).
	if (isNonEmptyString(form.get('website'))) {
		return new Response('OK', { status: 200 }); // silently accept, do nothing — do not tip off the bot
	}

	const intentId = form.get('intent');
	if (!isNonEmptyString(intentId) || !(intentId in INTENTS)) {
		return new Response('Missing or invalid intent.', { status: 400 });
	}

	for (const requiredKey of REQUIRED_FIELDS[intentId]) {
		if (!isNonEmptyString(form.get(requiredKey))) {
			return new Response(`Missing required field: ${requiredKey}.`, { status: 400 });
		}
	}

	const fields: Record<string, string> = {};
	for (const [key, value] of form.entries()) {
		if (key === 'website' || key === 'intent') continue;
		if (typeof value === 'string') fields[key] = value;
	}

	try {
		await sendEmail(env, `Oxiedo contact — ${INTENTS[intentId]}`, fields);
	} catch {
		return new Response('Could not send.', { status: 502 });
	}

	return new Response('OK', { status: 200 });
};
