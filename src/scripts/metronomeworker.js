function MetronomeWorker(){

	this.timerID=null;
	this.interval=100;

		
	window.addEventListener('message', e => {
		if (e.data=="start") {
			console.log("starting");
			this.timerID=setInterval(function(){window.parent.postMessage("tick", '*');},this.interval)
		}
		else if (e.data.interval) {
			console.log("setting interval");
			this.interval=e.data.interval;
			console.log("interval="+this.interval);
			if (this.timerID) {
				clearInterval(this.timerID);
				this.timerID=setInterval(function(){window.parent.postMessage("tick", '*');},this.interval)
			}
		}
		else if (e.data=="stop") {
			console.log("stopping");
			clearInterval(this.timerID);
			this.timerID=null;
		}
	})
}


module.exports = MetronomeWorker