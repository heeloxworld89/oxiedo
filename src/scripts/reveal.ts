// design/18_ANIMATION_AND_INTERACTION.md §2. Adds .visible to .reveal elements on entry, then
// unobserves — fires once per element. The CSS already defaults every .reveal to visible; this
// script only ever takes effect once `.js` is present (motion.css), so a page with this script
// blocked renders exactly as it did before this file existed.
//
// Under prefers-reduced-motion: reduce, motion.css already forces .reveal visible with
// !important — the observer would have nothing useful to do, so it never runs.

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReducedMotion) {
	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					entry.target.classList.add('visible');
					observer.unobserve(entry.target);
				}
			}
		},
		{ threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
	);

	document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
}
