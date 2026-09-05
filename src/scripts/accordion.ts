// design/18_ANIMATION_AND_INTERACTION.md §7, ui_ux/09_FAQ_UI.md §1-3. Progressive enhancement
// over markup that already renders every panel open (Accordion.astro). Collapses all but a
// hash-targeted panel once .js confirms JS can run. Enter/Space activation is native <button>
// behaviour — no extra handling needed. height:0→auto needs a measured pixel value mid-
// transition (CSS cannot transition to "auto" directly); using height rather than display:none
// keeps the transition working and keeps content in in-page search.

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function setOpen(trigger: HTMLButtonElement, panel: HTMLElement, open: boolean, animate: boolean) {
	trigger.setAttribute('aria-expanded', String(open));
	panel.style.overflow = 'hidden';

	if (!animate || REDUCED_MOTION) {
		panel.style.transition = 'none';
		panel.style.height = open ? 'auto' : '0px';
		return;
	}

	panel.style.transition = 'height var(--duration-normal) var(--ease-out)';
	const startHeight = panel.getBoundingClientRect().height;
	panel.style.height = `${startHeight}px`;
	panel.offsetHeight; // force reflow so the browser registers the start height
	panel.style.height = open ? `${panel.scrollHeight}px` : '0px';

	panel.addEventListener(
		'transitionend',
		function onEnd() {
			if (open) panel.style.height = 'auto';
			panel.removeEventListener('transitionend', onEnd);
		},
		{ once: true }
	);
}

const hashId = window.location.hash.slice(1);

document.querySelectorAll<HTMLElement>('.accordion-item').forEach((item) => {
	const trigger = item.querySelector<HTMLButtonElement>('.accordion-trigger');
	const panel = item.querySelector<HTMLElement>('.accordion-panel');
	if (!trigger || !panel) return;

	setOpen(trigger, panel, panel.id === hashId, false);

	trigger.addEventListener('click', () => {
		const expanded = trigger.getAttribute('aria-expanded') === 'true';
		setOpen(trigger, panel, !expanded, true);
	});
});

if (hashId) {
	document.getElementById(hashId)?.scrollIntoView({ behavior: REDUCED_MOTION ? 'auto' : 'smooth' });
}
