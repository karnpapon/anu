// const getRandomInt = function(min, max) {
//   var min = Math.ceil(min);
//   var max = Math.floor(max);
//   return Math.floor(Math.random() * (max - min + 1)) + min;
// }

// const scale = (num, in_min, in_max, out_min, out_max) => {
//   return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
// }

// const isChar = (c) => {
//   return c.length === 1 && c.match(/[A-Z]/i);
// }

// const clamp = (v, min, max) => { return v < min ? min : v > max ? max : v } 

// const isEven = (x) => { return (x%2)==0; }
// const isOdd = (x) => { return !isEven(x); }

// const $ = id => document.getElementById(id);
// const qs = id => document.querySelector(id);
// const el = tag => document.createElement(tag);

// exports.getRandomInt = getRandomInt
// exports.scale = scale
// exports.isChar = isChar
// exports.clamp = clamp
// exports.isEven = isEven
// exports.isOdd = isOdd

// exports.$ = $;
// exports.qs = qs;
// exports.el = el;


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
