let Utils = {};

Utils.now = function() {
	return window.performance ? performance.now() : Date.now();
};

Utils.unescSubstStr = function(str) {
	if (!str) { return ""; }
	return str.replace(Utils.SUBST_ESC_RE, (a, b, c)=> Utils.SUBST_ESC_CHARS[b] || String.fromCharCode(parseInt(c, 16)) );
};

Utils.get = function( value, query, defaultVal = undefined) {
  const splitQuery = Array.isArray(query) ? query : query.replace(/(\[(\d)\])/g, ".$2").replace(/^\./, "")
    .split(".");

  if (!splitQuery.length || splitQuery[0] === undefined) return value ;

  const key = splitQuery[0];

  if (
    typeof value !== "object"
    || value === null
    || !(key in value)
    || (value)[key] === undefined
  ) {
    return defaultVal;
  }

  return Utils.get((value)[key], splitQuery.slice(1), defaultVal);
}

Utils.SUBST_ESC_CHARS = {
	// this is just the list supported in Replace. Others: b, f, ", etc.
	n: "\n",
	r: "\r",
	t: "\t",
	"\\": "\\"
};

Utils.SUBST_ESC_RE = /\\([nrt\\]|u([A-Z0-9]{4}))/ig;
