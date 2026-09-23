// THE HOOK'S THREE CLIPS — what is cut, from where, and who is speaking.
//
// The demo tour opens on thirty seconds of three people saying, on camera, that AI is
// dangerous: Geoffrey Hinton on 60 Minutes, Jacob Coxon on CNN, Elon Musk at SXSW. Then
// the narrator takes over and the black box is opened. See Replay Demo Plan/15_HOOK.md.
//
// EVERYTHING ON SCREEN IS THE CLIP'S OWN. The captions are the words actually spoken,
// transcribed with word timings (ElevenLabs speech-to-text, kept in ./clips/*.stt.json so
// the build never needs the key again), with two edits a subtitler makes as a matter of
// course and nothing else: the fillers "Um," and "Uh," are not shown, each speaker's first
// word is capitalised, and sentences get their closing punctuation. The names and roles are the ones the broadcasters themselves put
// on screen, and each clip carries its source and date.
//
// THE SOURCES ARE REPOSTS, NOT MASTERS. Two carry a social account's burned-in captions
// (one with a typo, "FARE"), so each is cropped above them; the CNN crop keeps CNN's own
// name straps and headline, which say where it came from.

export const SOURCE_DIR = '../media';      // relative to the repo root: oxido/media

export const CLIPS = [
	{
		id: 'hinton',
		file: 'hinton.mp4',
		// "…more intelligent than us" ends at 13.10 s; a breath after it.
		start: 0,
		end: 13.35,
		crop: null,                          // 1024×576, the broadcast frame as aired
		source: '60 Minutes · CBS · October 2023',
		speakers: [
			{ from: 'Does', name: 'Scott Pelley', role: '60 Minutes' },
			{ from: 'No.', name: 'Geoffrey Hinton', role: 'Turing Award winner · Nobel laureate' },
		],
		fix: { us: 'us.' },
	},
	{
		id: 'coxon',
		file: 'ai can kill human.mp4',
		// The file runs on into "…frighteningly real and"; cut after "real" (12.04 s).
		start: 0,
		end: 12.06,
		// Above the repost's burned-in captions (which start at 768 px); CNN's own straps,
		// at 660–707 px, stay in.
		crop: { w: 576, h: 744, x: 0, y: 0 },
		source: 'CNN · September 2026',
		speakers: [
			{ from: 'First', name: 'Anderson Cooper', role: 'CNN anchor' },
			{ from: 'Uh,', name: 'Jacob Coxon', role: 'Former OpenAI and Anthropic researcher' },
		],
		fix: { decade: 'decade?', real: 'real.' },
	},
	{
		id: 'musk',
		file: 'elon.mp4',
		// The first sentence only: "…than nukes." ends at 4.22 s, the next word at 4.58 s.
		start: 0,
		end: 4.45,
		// Inside the letterbox (content from 114 px) and above the burned-in captions
		// (from ~596 px): a square on the face.
		crop: { w: 476, h: 476, x: 34, y: 114 },
		source: 'SXSW · March 2018',
		speakers: [
			{ from: 'Mark', name: 'Elon Musk', role: '' },
		],
		fix: {},
	},
];

/** Words a subtitler leaves out: hesitation, not content. */
export const FILLERS = new Set(['um,', 'uh,', 'um', 'uh', 'um.', 'uh.']);

/** Loudness every clip is brought to, measured from the narrator's own lines (−19 LUFS),
 *  so the hook and the voice that follows it play at one level. */
export const TARGET_LUFS = -19;
