// ui_ux/02_SOLUTIONS_UI.md §1. Progressive enhancement over the anchor list built at task 2.2,
// which already works with JS disabled — this script only intercepts clicks and adds scroll-spy
// once it runs. The same .solutions-master markup serves the desktop sidebar and the mobile
// chip row (pure CSS reflow, no duplication), so one set of handlers covers both.

const masterLinks = document.querySelectorAll<HTMLAnchorElement>('.solutions-master a');
const detailBlocks = document.querySelectorAll<HTMLElement>('.solution-block');

if (masterLinks.length > 0 && detailBlocks.length > 0) {
	const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	// Suppressed while a click-initiated scroll is in flight, so the spy can't fight it and
	// flicker between the origin and destination item.
	let programmaticScroll = false;
	let settleTimeout: number;

	window.addEventListener(
		'scroll',
		() => {
			if (!programmaticScroll) return;
			clearTimeout(settleTimeout);
			settleTimeout = window.setTimeout(() => {
				programmaticScroll = false;
			}, 150);
		},
		{ passive: true }
	);

	function linkFor(id: string) {
		return document.querySelector<HTMLAnchorElement>(`.solutions-master a[href="#${id}"]`);
	}

	function setActive(link: HTMLAnchorElement) {
		masterLinks.forEach((a) => a.classList.remove('active'));
		link.classList.add('active');
		// No-op on desktop (nothing overflows); scrolls the chip into view on mobile.
		link.scrollIntoView({ inline: 'center', block: 'nearest', behavior: REDUCED_MOTION ? 'auto' : 'smooth' });
	}

	masterLinks.forEach((link) => {
		link.addEventListener('click', (event) => {
			const id = link.getAttribute('href')?.slice(1);
			const target = id ? document.getElementById(id) : null;
			if (!target) return;
			event.preventDefault();
			programmaticScroll = true;
			setActive(link);
			target.scrollIntoView({ behavior: REDUCED_MOTION ? 'auto' : 'smooth', block: 'start' });
		});
	});

	const spy = new IntersectionObserver(
		(entries) => {
			if (programmaticScroll) return;
			const visible = entries.filter((entry) => entry.isIntersecting);
			if (visible.length === 0) return;
			const topmost = visible.reduce((a, b) =>
				a.boundingClientRect.top < b.boundingClientRect.top ? a : b
			);
			const link = linkFor(topmost.target.id);
			if (link && !link.classList.contains('active')) setActive(link);
		},
		{ rootMargin: '-100px 0px -70% 0px', threshold: 0 }
	);

	detailBlocks.forEach((block) => spy.observe(block));
}
