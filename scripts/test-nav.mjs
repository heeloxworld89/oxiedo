/**
 * Regression test for the mobile navigation.
 *
 * WHY THIS EXISTS. The mobile menu has broken four separate times, each time in a way no build
 * step or CSS audit could see: a wiped `.js` class, a listener added twice, a fixed-position
 * panel trapped by an ancestor's backdrop-filter, and a `var` that hoisted over a helper of the
 * same name and killed the click handler outright. Every one of those shipped green. The gap was
 * never the fix — it was that nothing ever RAN the thing.
 *
 * It executes the inline script exactly as it ships, extracted from dist/index.html, against a
 * DOM stub that mirrors the real nav markup, and drives it with synthetic clicks. No dependency:
 * the script touches a dozen DOM methods and they are stubbed here in full.
 */
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert';

// ── a DOM stub, only as wide as the script under test actually reaches ──────────────
class El {
	constructor(tag, cls = [], parent = null) {
		this.tagName = tag.toUpperCase();
		this.classList = new Set(cls);
		this.classList.contains = (c) => Set.prototype.has.call(this.classList, c);
		this.parentElement = parent;
		this.children = [];
		this.attrs = new Map();
		this.hidden = false;
		this.focused = false;
		if (parent) parent.children.push(this);
	}
	get nextElementSibling() {
		const sibs = this.parentElement ? this.parentElement.children : [];
		return sibs[sibs.indexOf(this) + 1] ?? null;
	}
	setAttribute(k, v) { this.attrs.set(k, String(v)); }
	getAttribute(k) { return this.attrs.has(k) ? this.attrs.get(k) : null; }
	hasAttribute(k) { return this.attrs.has(k); }
	removeAttribute(k) { this.attrs.delete(k); }
	focus() { this.focused = true; }
	matches(sel) {
		const parts = sel.trim().split(/\s+/);
		if (parts.length === 1) return this._simple(parts[0]);
		if (!this._simple(parts[parts.length - 1])) return false;      // descendant: ".a b"
		for (let p = this.parentElement; p; p = p.parentElement) if (p._simple(parts[0])) return true;
		return false;
	}
	_simple(s) {
		return s.startsWith('.') ? this.classList.contains(s.slice(1)) : this.tagName === s.toUpperCase();
	}
	closest(sel) {
		for (let n = this; n; n = n.parentElement) if (n.matches(sel)) return n;
		return null;
	}
	querySelector(sel) {
		const walk = (n) => {
			for (const c of n.children) {
				if (c.matches(sel.split(',')[0].trim())) return c;
				const d = walk(c);
				if (d) return d;
			}
			return null;
		};
		return walk(this);
	}
	// <dialog>
	showModal() {
		if (this.hasAttribute('open')) { const e = new Error('already open'); e.name = 'InvalidStateError'; throw e; }
		this.setAttribute('open', '');
	}
	close() { this.removeAttribute('open'); dispatch('close', this); }
}

// ── the real nav markup, in miniature ──────────────────────────────────────────────
const html = new El('html');
const header = new El('header', ['nav'], html);
const burger = new El('button', ['nav-hamburger'], header);
burger.setAttribute('aria-expanded', 'false');
const dialog = new El('dialog', ['nav-mobile'], header);
const closeBtn = new El('button', ['nav-mobile-close'], dialog);
const list = new El('ul', ['nav-mobile-links'], dialog);
const li = new El('li', [], list);
const row = new El('div', ['nav-mobile-row'], li);
const link = new El('a', ['nav-mobile-link'], row);
const toggle = new El('button', ['nav-mobile-toggle'], row);
toggle.setAttribute('aria-expanded', 'false');
const sub = new El('ul', ['nav-mobile-sub'], li);
sub.hidden = true;

const listeners = {};
function dispatch(type, target) {
	const ev = { type, target, defaultPrevented: false, preventDefault() { this.defaultPrevented = true; }, key: undefined };
	for (const fn of listeners[type] ?? []) fn(ev);
	return ev;
}

const document = {
	documentElement: html,
	addEventListener: (t, fn) => { (listeners[t] ??= []).push(fn); },
	querySelector: (sel) => html.querySelector(sel),
};
html.classList.add = Set.prototype.add.bind(html.classList);
html.classList.remove = Set.prototype.delete.bind(html.classList);

// ── run the script exactly as it ships ─────────────────────────────────────────────
const built = readFileSync('dist/index.html', 'utf8');
const m = built.match(/<script>\s*\(function \(\)[\s\S]*?<\/script>/);
assert.ok(m, 'inline nav script not found in dist/index.html');
const source = m[0].replace(/^<script>/, '').replace(/<\/script>$/, '');

const sandbox = { window: {}, document, console };
sandbox.window.matchMedia = () => ({ matches: false });
vm.createContext(sandbox);
vm.runInContext(source, sandbox, { filename: 'inline-nav.js' });

// ── the behaviours that have actually broken ───────────────────────────────────────
const tests = [];
const it = (name, fn) => { try { fn(); tests.push(['PASS', name]); } catch (e) { tests.push(['FAIL', name + ' — ' + e.message]); } };

it('tapping the hamburger opens the menu', () => {
	dispatch('click', burger);
	assert.ok(dialog.hasAttribute('open'), 'dialog did not open');
	assert.equal(burger.getAttribute('aria-expanded'), 'true');
	assert.ok(html.classList.contains('nav-locked'), 'scroll lock not applied');
});

it('tapping it again closes the menu', () => {
	dispatch('click', burger);
	assert.ok(!dialog.hasAttribute('open'), 'dialog did not close');
	assert.equal(burger.getAttribute('aria-expanded'), 'false');
	assert.ok(!html.classList.contains('nav-locked'), 'scroll lock not released');
});

it('the close button closes the menu', () => {
	dispatch('click', burger);
	dispatch('click', closeBtn);
	assert.ok(!dialog.hasAttribute('open'), 'dialog still open');
});

it('the submenu caret expands and collapses, and does not break the hamburger', () => {
	dispatch('click', burger);
	dispatch('click', toggle);
	assert.equal(toggle.getAttribute('aria-expanded'), 'true');
	assert.equal(sub.hidden, false, 'submenu did not reveal');
	dispatch('click', toggle);
	assert.equal(sub.hidden, true, 'submenu did not collapse');
	dispatch('click', burger);                                  // close
	dispatch('click', burger);                                  // and reopen — the regression
	assert.ok(dialog.hasAttribute('open'), 'hamburger stopped working after using the caret');
});

it('following a link inside the menu closes it', () => {
	if (!dialog.hasAttribute('open')) dispatch('click', burger);
	dispatch('click', link);
	assert.ok(!dialog.hasAttribute('open'), 'menu stayed open after navigating');
});

let failed = 0;
for (const [status, name] of tests) {
	if (status === 'FAIL') failed++;
	console.log(`  ${status}  ${name}`);
}
console.log(failed ? `\n${failed} of ${tests.length} nav tests FAILED` : `\nall ${tests.length} nav tests pass`);
process.exit(failed ? 1 : 0);
