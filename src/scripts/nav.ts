// design/12 §Navigation, design/18 §3. Scroll state only.
//
// THE MOBILE MENU IS NO LONGER HANDLED HERE, moved 2026-09-08. It used to be bound in this
// module's init(), which runs from Base.astro inside an `astro:page-load` listener. That put the
// single most important control on a phone — the only route to navigation — at the end of a
// four-link chain: ClientRouter has to load, fire its event, the module bundle has to resolve,
// and init has to reach the binding. Any break anywhere in that chain and the hamburger is dead
// with nothing on screen to say why, which is exactly what kept happening.
// It is now a delegated inline script in Base.astro: no bundle, no event dependency, no module
// graph, and it survives client-side navigation because it listens on `document`.
//
// RESTRUCTURED 2026-09-06 for the ClientRouter: the DOM is replaced on every client-side
// navigation, so element bindings have to be re-attached (init, called on astro:page-load)
// while the window-level scroll listener must attach exactly once (module scope, which runs
// once per document). Binding the scroll listener inside init would stack a new listener on
// every navigation.

let ticking = false;

function updateScrollState() {
	document.querySelector('.nav')?.classList.toggle('scrolled', window.scrollY > 40);
	ticking = false;
}

// once per document, not per navigation
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

export default function init() {
	updateScrollState();
}
