// based on regexr.com
class RegexSolver {

	constructor() {
		const workerBlob = new Blob([
			document.querySelector('#regexWorker').textContent
		], { type: "text/javascript" });
		this._workerObjectURL = URL.createObjectURL(workerBlob);
	}

	solve(o, callback) {
		this._callback = callback;
		this._req = o;

		let regex, text=o.text, tests=o.tests, mode = o.mode;
		try {
			this._regex = regex = new RegExp(o.pattern, o.flags);
		} catch(e) {
			return this._onRegExComplete({id:"regexparse", name: e.name, message: e.message}, null, mode);
		}

    const worker = new Worker(this._workerObjectURL);

    worker.onmessage = (evt) => {
      if (evt.data === "onload") {
        this._timeoutId = setTimeout(() => {
          worker.terminate();
          this._onRegExComplete({id: "timeout"}, null, mode);
        }, 250);
      } else {
        clearTimeout(this._timeoutId);
        worker.terminate();
        this._onRegExComplete(evt.data.error, evt.data.matches, evt.data.mode);
      }
    };

    // we need to pass the pattern and flags as text, because Safari strips the unicode flag when passing a RegExp to a Worker
    worker.postMessage({pattern:o.pattern, flags:o.flags, text});
	}

	_onRegExComplete(error, matches, mode) {
		let result = {
			error,
			mode,
			matches
		};

		this._callback(result);
	}
}