// design/18_ANIMATION_AND_INTERACTION.md §2. Adds .visible to .reveal elements on entry, then
// unobserves — fires once per element. The CSS already defaults every .reveal to visible; this
// script only ever takes effect once `.js` is present (motion.css), so a page with this script
// blocked renders exactly as it did before this file existed.
//
// Under prefers-reduced-motion: reduce, motion.css already forces .reveal visible with
// !important — the observer would have nothing useful to do, so it never runs.

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// RESTRUCTURED 2026-09-06 for the ClientRouter — re-observes the new document's .reveal
// elements after each client-side navigation. A fresh observer per page is correct: the old
// document's nodes are gone, so the previous observer has nothing left to hold.
function revealAll() {
	document.querySelectorAll('.reveal').forEach((el) => el.classList.add('visible'));
}

export default function init() {
	if (prefersReducedMotion) return;

	// No IntersectionObserver means no reveal — show everything rather than leave the page blank.
	if (!('IntersectionObserver' in window)) {
		revealAll();
		return;
	}

	// THRESHOLD IS 0, AND THAT IS THE WHOLE FIX. It used to be 0.15, which asks for 15% of the
	// element's AREA to be inside the viewport. On a phone every section stacks vertically and
	// several run past 5,000px; against a ~700px viewport the ratio tops out around 0.14 and the
	// entry never fires, so the section sat at opacity 0 for good. The homepage showed a blank
	// screen between the hero and the scenario for exactly this reason, and the old
	// `rootMargin: -10%` shrank the root further and made it likelier. At threshold 0 the entry
	// fires as soon as any part of the element crosses the boundary, whatever its height.
	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					entry.target.classList.add('visible');
					observer.unobserve(entry.target);
				}
			}
		},
		{ threshold: 0, rootMargin: '0px 0px -60px 0px' }
	);

	document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

	// Last-resort net. If anything above goes wrong the page must still have content on it;
	// invisible copy is worse than an un-animated reveal.
	window.setTimeout(revealAll, 3000);
}
