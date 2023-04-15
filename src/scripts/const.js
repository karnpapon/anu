const MARKER_GLYPH = ':'
const MARKER_PLAY_GLYPH = '>'
const MARKER_PAUSE_GLYPH = 'x'
const EMPTY_GLYPH = '.'
const BANG_GLYPH = '*'
const SPACE_GLYPH = ' '

const RegexMode = {
	Realtime: Symbol("regex-mode-realtime"),
	OnEval: Symbol("regex-mode-oneval"),
}

const RegexFlag = {
	Global: Symbol("regex-flag-g"),
	Insensitive: Symbol("regex-flag-i"),
	Multiline: Symbol("regex-flag-m"),
	Unicode: Symbol("regex-flag-u"),
	Dotall: Symbol("regex-flag-s"),
	Sticky: Symbol("regex-flag-y"),
}


// helps
const TOP_BORDER_SYMBOL = ['┌','─','┐']
const CONTENT_SYMBOL = ['|']
const BOTTOM_BORDER_SYMBOL = ['└','─','┘']
const LIBRARY = {
  "n": { "info": "add new marker" },
  "f": { "info": "focus only marker(s)" },
  "e": { "info": "rename marker" },
  "o": { "info": "set osc msg" },
  "m": { "info": "set midi msg" },
  "r": { "info": "reverse step" },
  "> or <": { "info": "incr/decr BPM" },
  "[ or ]": { "info": "incr/decr note-ratio (default 1:16)" },
  
  "Backspace": { "info": "remove current marker" },
  "Spacebar": { "info": "play/pause" },
  "Cmd-Arrow": { "info": "jump" },
  "CmdOrCtrl-(1..5)": { "info": "toggle regex flag respectively" },
  "CmdOrCtrl-/": { "info": "switch regex mode" },
  "Cmd-Return": { "info": "toggle snap step to marker range" },
  "Option-e": { "info": "show current selected marker name" },
  "Option-Tab": { "info": "change selected markers" },
  "Shift-Arrow": { "info": "incr/decr marker range" },
  "Shift-Arrow-Cmd": { "info": "jump incr/decr marker range" },
  "Shift-(Plus or Minus)": { "info": "add/remove step" },
}
const LIBRARY_ENDNOTES = "- MAKE SURE INPUT HAS BEEN TOGGLED OFF -"

// displayer
const DISPLAYER_DEFAULT_TEXTS = "(CmdOrCtrl-i) toggle input\n (CmdOrCtrl-g) toggle Regex input\n(Return) eval input (target input must = ON)\n(h) toggle helps window\n"