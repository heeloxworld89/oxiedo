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
	// TODO (Block 5): bind the chosen email provider here, e.g. an API token secret.
}

const INTENTS: Record<string, string> = {
	book: 'Book a Warning Light session',
	'pre-book': 'Apply for a Charter Partnership',
	invest: 'Investment conversation',
	other: 'Other',
};

// Mirrors the `required` attributes in src/pages/contact.astro's four forms — the client's
// HTML5 validation is not trustworthy on its own, so required fields are re-checked here.
// Fields not listed (e.g. invest-thesis) are genuinely optional and must not be rejected empty.
const REQUIRED_FIELDS: Record<string, string[]> = {
	book: ['book-name', 'book-org', 'book-frequency', 'book-cost', 'book-stack'],
	'pre-book': [
		'prebook-solution',
		'prebook-regulation',
		'prebook-approach',
		'prebook-timeline',
		'prebook-org',
	],
	invest: ['invest-name', 'invest-email', 'invest-org'],
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

async function sendEmail(_subject: string, _fields: Record<string, string>): Promise<void> {
	// TODO (Block 5): no sending domain or provider is configured yet. Wire the chosen provider
	// here once the domain email in design/10, design/14, and the footer is real. Do not log
	// `_fields` anywhere — message bodies are never persisted, per design/14 §9.
	throw new Error('Email sending is not configured yet — see TODO above.');
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
		await sendEmail(`Oxiedo contact — ${INTENTS[intentId]}`, fields);
	} catch {
		return new Response('Could not send.', { status: 502 });
	}

	return new Response('OK', { status: 200 });
};
