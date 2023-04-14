let Utils = {};

Utils.now = function() {
	return window.performance ? performance.now() : Date.now();
};

Utils.unescSubstStr = function(str) {
	if (!str) { return ""; }
	return str.replace(Utils.SUBST_ESC_RE, (a, b, c)=> Utils.SUBST_ESC_CHARS[b] || String.fromCharCode(parseInt(c, 16)) );
};

Utils.SUBST_ESC_CHARS = {
	// this is just the list supported in Replace. Others: b, f, ", etc.
	n: "\n",
	r: "\r",
	t: "\t",
	"\\": "\\"
};

Utils.SUBST_ESC_RE = /\\([nrt\\]|u([A-Z0-9]{4}))/ig;
