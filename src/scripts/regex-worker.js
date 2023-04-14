onmessage = function (evt) {
  console.log("regex worker")
	postMessage("onload");
	var data = evt.data, text = data.text, tests = data.tests, mode = data.mode;
	var regex = new RegExp(data.pattern, data.flags);
	// shared between BrowserSolver & RegExWorker
	var matches = [], match, index, error;
  while (match = regex.exec(text)) {
    if (index === regex.lastIndex) { error = {id:"infinite", warning:true}; ++regex.lastIndex; }
    index = regex.lastIndex;
    var groups = match.reduce(function (arr, s, i) { return (i===0 || arr.push({s:s})) && arr },[]);
    matches.push({i:match.index, l:match[0].length, groups:groups});
    if (!regex.global) { break; } // or it will become infinite.
  }
	postMessage({error: error, matches: matches, mode: mode});
};