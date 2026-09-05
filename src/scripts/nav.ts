// design/12 §Navigation, design/18 §3. Progressive enhancement over markup that already works
// without JS — Nav.astro's links and mobile menu are all visible/reachable before this file
// runs. Scroll state and the overlay toggle only ever take effect once `.js` is present.

const nav = document.querySelector('.nav');
const hamburger = document.querySelector<HTMLButtonElement>('.nav-hamburger');
const mobile = document.querySelector<HTMLElement>('.nav-mobile');
const closeBtn = document.querySelector<HTMLButtonElement>('.nav-mobile-close');

// Scroll state — design/18 §3: 40px threshold, passive + rAF-throttled per the perf budget.
let ticking = false;
function updateScrollState() {
	nav?.classList.toggle('scrolled', window.scrollY > 40);
	ticking = false;
}
window.addEventListener(
	'scroll',
	() => {
		if (!ticking) {
			requestAnimationFrame(updateScrollState);
			ticking = true;
		}
	},
	{ passive: true }
);
updateScrollState();

// Mobile overlay — traps focus, closes on Escape and on link activation.
if (hamburger && mobile) {
	const focusableSelector = 'a[href], button:not([disabled])';

	function openMenu() {
		mobile!.classList.add('open');
		hamburger!.setAttribute('aria-expanded', 'true');
		mobile!.querySelector<HTMLElement>(focusableSelector)?.focus();
		document.addEventListener('keydown', onKeydown);
	}

	function closeMenu() {
		mobile!.classList.remove('open');
		hamburger!.setAttribute('aria-expanded', 'false');
		hamburger!.focus();
		document.removeEventListener('keydown', onKeydown);
	}

	function onKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			closeMenu();
			return;
		}
		if (event.key !== 'Tab') return;
		const focusable = Array.from(mobile!.querySelectorAll<HTMLElement>(focusableSelector));
		if (focusable.length === 0) return;
		const first = focusable[0];
		const last = focusable[focusable.length - 1];
		if (event.shiftKey && document.activeElement === first) {
			event.preventDefault();
			last.focus();
		} else if (!event.shiftKey && document.activeElement === last) {
			event.preventDefault();
			first.focus();
		}
	}

	hamburger.addEventListener('click', () => {
		if (mobile.classList.contains('open')) closeMenu();
		else openMenu();
	});
	closeBtn?.addEventListener('click', closeMenu);
	mobile.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
}
