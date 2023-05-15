"use strict";

// implementation based on https://github.com/cwilso/metronome.
function Metronome(_canvas) {
  this.audioContext = null;
  this.unlocked = false;
  this.isPlaying = false; // Are we currently playing?
  this.startTime; // The start time of the entire sequence.
  this.current16thNote; // What note is currently last scheduled?
  this.noteRatio = 1 // default to 16th notes (16 % 1 == 0).
  // this.tempo = 120.0; // tempo (in beats per minute)
  this.tempo = { value: 120.0, target: 120.0 }
  this.lookahead = 25.0; // How frequently to call scheduling function(in milliseconds)

  // How far ahead to schedule audio (sec)
  // This is calculated from lookahead, and overlaps
  // with next interval (in case the timer is late)
  this.scheduleAheadTime = 0.1; 

  this.nextNoteTime = 0.0; // when the next note is due.
  this.nextRatchetingNoteTime = 0.0; 
  this.noteResolution = 0; // 0 == 16th, 1 == 8th, 2 == quarter note
  this.noteLength = 0.0; // length of "beep" (in seconds)
  this.last16thNoteDrawn = -1; // the last "box" we drew on the screen
  this.notesInQueue = []; // the notes that have been put into the web audio, and may or may not have played yet. {note, time}
  this.timerWorker = null; // The Web Worker used to fire timer messages

  this.nextNote = function () {
    // Advance current note and time by a 16th note...
    var secondsPerBeat = 60.0 / this.tempo.value; // Notice this picks up the CURRENT tempo value to calculate beat length.
    this.nextNoteTime += (0.25 * secondsPerBeat); // Add beat length to last beat time
    // console.log("this.nextRatchetingNoteTime", this.nextRatchetingNoteTime)


    this.current16thNote++; // Advance the beat number, wrap to zero
    if (this.current16thNote == 16) {
      this.current16thNote = 0;
    }
  };

  this.scheduleNote = function (beatNumber, time) {
    // push the note on the queue, even if we're not playing.
    // for displaying tick.
    // this.notesInQueue.push({ note: beatNumber, time: time });
    let osc = this.audioContext.createOscillator();
    osc.connect(this.audioContext.destination);
    osc.start(time);
    osc.stop(time + this.noteLength);
    osc.onended = () => { 
      // _canvas.io.midi.sendClock()
      _canvas.run() 
    }
  };

  this.set = function(value) {
    if (value) { this.tempo.value = clamp(value, 60, 300) }
    client.console.bpmNumber.innerText = this.tempo.value
  }

  this.setNoteRatio = function(value) {
    if (value) { this.noteRatio = clamp(value, 1, 16) }
    client.console.currentNumber.innerText = `${this.noteRatio}:16`
  }

  this.mod = function(mod = 0) {
   this.set(this.tempo.value + mod)
  }

  this.modNoteRatio = function(mod = 0) {
    this.setNoteRatio(this.noteRatio + mod)
   }

  this.scheduler = function () {
    // while there are notes that will need to play before the next interval,
    // schedule them and advance the pointer.
    while (
      this.nextNoteTime <
      this.audioContext.currentTime + this.scheduleAheadTime
      ) {
      this.scheduleNote(this.current16thNote, this.nextNoteTime);
      this.nextNote();
    }
  };

  this.scheduleRatcheting = function(){
    while(
      this.nextRatchetingNoteTime < 
      this.audioContext.currentTime + 0.01
      ) {
        let osc = this.audioContext.createOscillator();
        osc.connect(this.audioContext.destination);
        osc.start(this.nextRatchetingNoteTime);
        osc.stop(this.nextRatchetingNoteTime + this.noteLength);
        osc.onended = () => { _canvas.io.osc.sendCurrentMsg() }
        this.nextRatchetingNoteTime += (0.5 * (0.25 * (60.0 / this.tempo.value))) / _canvas.ratchetRatios[_canvas.marker.getCurrentMarkerControlByField("noteRatioRatchetIndex")];
      }
  }

  this.play = function () {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    
    if (!this.unlocked) {
      // play silent buffer to unlock the audio
      const buffer = this.audioContext.createBuffer(1, 1, 22050);
      let node = this.audioContext.createBufferSource();
      node.buffer = buffer;
      node.start(0);
      this.unlocked = true;
    }
    
    if (!_canvas.clock.isPaused) {
      this.current16thNote = 0;
      this.nextNoteTime = this.audioContext.currentTime;
      this.nextRatchetingNoteTime = this.audioContext.currentTime;
      metronome.timerWorker.postMessage("start");
      _canvas.marker.anyRatcheting() ? metronome.timerWorker.postMessage("ratchet"):null;
    } 
  };

  this.stop = function(){
    this.timerWorker.postMessage("stop"); 
    this.timerWorker.postMessage("ratchet_stop"); 
    client.console.currentNumber.innerText = `${canvas.marker.getCurrentMarkerControlByField("noteRatio")}:16`
  }

  function loadWebWorker(worker) {
    const code = worker.toString();
    const blob = new Blob([code]);
    return new Worker(window.URL.createObjectURL(blob));
  }

  this.init = function () {
    const workerScript = document.querySelector('#metronomeWorker').textContent
    this.timerWorker = loadWebWorker(workerScript)
    this.timerWorker.onmessage = function (e) {
      if (e.data == "tick") {
        metronome.scheduler();
      } else if (e.data === "ratchet_start") {
        metronome.scheduleRatcheting(); 
      } else  {
        console.log("message: " + e.data);
      }
    };
    this.timerWorker.postMessage({ interval: this.lookahead });
  };

}

function clamp (v, min, max) { return v < min ? min : v > max ? max : v }