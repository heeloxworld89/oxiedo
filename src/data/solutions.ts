// PRELIMINARY STUB — created early, at task 1.10, because LadderSchematic.astro must map over
// this file rather than hardcode ladder contents. The canonical version of this file is task
// 2.2's job; that task should re-verify every field against design/02_SOLUTIONS.md in full
// before /solutions ships. Every value below is sourced (design/02_SOLUTIONS.md for name,
// status and price; Commercial Plan/04 §5 for gate cost and failure branch, where design/02's
// own "What Gates It" section doesn't state one) — nothing here is invented, but the pass has
// not been exhaustive across every subsection of design/02.

export type SolutionStatus = 'available' | 'inbuild' | 'upcoming';

export interface Gate {
	name: string;
	cost: string;
	status: string;
	ifItFails: string;
}

export interface Solution {
	id: string;
	name: string;
	status: SolutionStatus;
	price: string;
	gate: Gate | null;
	copyRef: string;
}

export const solutions: Solution[] = [
	{
		id: 'warning-light',
		name: 'The Warning Light',
		status: 'available',
		price: '$10,000–$50,000 per run · $75,000–$250,000/yr',
		gate: null,
		copyRef: 'design/02_SOLUTIONS.md §Section 2',
	},
	{
		id: 'label-audit',
		name: 'The Label Audit',
		status: 'inbuild',
		price: '$25,000–$75,000 per engagement',
		gate: {
			name: 'Frozen-model wrapper viability',
			cost: '~1 GPU-day',
			status: 'not started',
			ifItFails: 'Native-training mode only — stronger signal, higher friction.',
		},
		copyRef: 'design/02_SOLUTIONS.md §Section 4',
	},
	{
		id: 'model-change-record',
		name: 'The Model Change Record (The Diary)',
		status: 'inbuild',
		price: '$50,000–$150,000 per engagement',
		gate: {
			name: 'Four known defects closed + regulatory review',
			cost: 'days of work',
			status: 'not started',
			ifItFails: 'None — the defects are fixable.',
		},
		copyRef: 'design/02_SOLUTIONS.md §Section 5',
	},
	{
		id: 'source-separator',
		name: 'The Source Separator',
		status: 'upcoming',
		price: '$150,000–$400,000/year, on-premise',
		gate: {
			name: 'The separation study',
			cost: '~20 GPU-hr',
			status: 'not started',
			ifItFails: 'Four products close. Three survive.',
		},
		copyRef: 'design/02_SOLUTIONS.md §Section 6',
	},
	{
		id: 'certified-deletion',
		name: 'Certified Deletion',
		status: 'upcoming',
		price: 'Per-certificate — negotiated during Charter Partnership',
		gate: {
			name: 'Separation study + legal opinion on what may be certified (GDPR Article 17)',
			cost: 'one consultation',
			status: 'not started',
			ifItFails: 'The product becomes a strong story rather than a certifiable one.',
		},
		copyRef: 'design/02_SOLUTIONS.md §Section 7',
	},
	{
		id: 'federated-node',
		name: 'The Federated Node',
		status: 'upcoming',
		price: '$60,000–$120,000 per federation',
		gate: {
			name: 'Separation study + formal privacy analysis',
			cost: 'analysis, no GPU',
			status: 'not started',
			ifItFails: 'Blocks every consortium conversation.',
		},
		copyRef: 'design/02_SOLUTIONS.md §Section 8',
	},
	{
		id: 'bounded-update-engine',
		name: 'The Bounded Update Engine',
		status: 'upcoming',
		price: '$200,000–$500,000',
		gate: {
			name: "A regulatory consultant's read",
			cost: 'one engagement',
			status: 'not started',
			ifItFails: 'Long lead time — start it now, it gates the largest prize.',
		},
		copyRef: 'design/02_SOLUTIONS.md §Section 9',
	},
];
