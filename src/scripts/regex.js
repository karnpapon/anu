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

		let text=o.text;
		try {
			new RegExp(o.pattern, o.flags);
		} catch(e) {
			return this._onRegExComplete({id:"regexparse", name: e.name, message: e.message}, null);
		}

    const worker = new Worker(this._workerObjectURL);

    worker.onmessage = (evt) => {
      if (evt.data === "onload") {
        this._timeoutId = setTimeout(() => {
          worker.terminate();
          this._onRegExComplete({id: "timeout"}, null);
        }, 250);
      } else {
        clearTimeout(this._timeoutId);
        worker.terminate();
        this._onRegExComplete(evt.data.error, evt.data.matches);
      }
    };

    // we need to pass the pattern and flags as text, because Safari strips the unicode flag when passing a RegExp to a Worker
    worker.postMessage({pattern:o.pattern, flags:o.flags, text});
	}

	_onRegExComplete(error, matches) {
		let result = { error, matches };
		this._callback(result);
	}
}