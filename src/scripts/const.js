const MARKER_GLYPH = ':'
const MARKER_PLAY_GLYPH = '>'
const MARKER_PAUSE_GLYPH = 'x'
const EMPTY_GLYPH = '.'
const BANG_GLYPH = '*'
const SPACE_GLYPH = ' '
const BLOCK_REPLACE_GLYPH = '.'
// const BLOCK_REPLACE_GLYPH = '　'
// const BLOCK_REPLACE_GLYPH = ['⎯']
// const BLOCK_REPLACE_GLYPH = ['▞', '▟', '▜', '▛', '▚', '▙', '▘','▗','▖','▝']

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
  "r": { "info": "reverse step" },
  "e": { "info": "[*] rename marker" },
  "o": { "info": "[*] set osc msg" },
  "m": { "info": "[*] set midi msg" },
  "x": { "info": "[*] mute" },
  "'": { "info": "[*] replace marker block" },
  "> or <": { "info": "incr/decr BPM " },
  "{ or }": { "info": "[*] incr/decr note-ratio (default 1/16)" },
  "?": { "info": "[*] show control informations" },
  
  "Backspace": { "info": "[*] remove current marker" },
  "Spacebar": { "info": "play/pause" },

  "Cmd-Arrow": { "info": "[*] jump" },
  "Cmd-(1..6)": { "info": "toggle regex flag respectively" },
  "Cmd-/": { "info": "switch regex mode" },

  "Option-Tab": { "info": "change selected markers" },

  "Shift-Return": { "info": "[*] toggle snap step to marker range" },
  "Shift-Arrow": { "info": "[*] incr/decr marker range" },
  "Shift-Arrow-Cmd": { "info": "[*] jump incr/decr marker range" },
  "Shift-(+ or -)": { "info": "[*] add/remove step" },
}
const LIBRARY_ENDNOTES_1 = "[*] affect individual marker"
const LIBRARY_ENDNOTES_2 = "MAKE SURE INPUT HAS BEEN TOGGLED OFF"

// displayer
const DISPLAYER_DEFAULT_TEXTS = "(CmdOrCtrl-i) toggle input\n (CmdOrCtrl-g) toggle Regex input\n(Return) eval input (target input must = ON)\n(h) toggle helps window\n"