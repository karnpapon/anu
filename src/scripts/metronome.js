"use strict";

// implementation based on https://github.com/cwilso/metronome.
function Metronome(canvas) {
  this.audioContext = null;
  this.unlocked = false;
  this.isPlaying = false; // Are we currently playing?
  this.startTime; // The start time of the entire sequence.
  this.current16thNote; // What note is currently last scheduled?
  this.tempo = 120.0; // tempo (in beats per minute)
  this.lookahead = 25.0; // How frequently to call scheduling function(in milliseconds)

  // How far ahead to schedule audio (sec)
  // This is calculated from lookahead, and overlaps
  // with next interval (in case the timer is late)
  this.scheduleAheadTime = 0.1; 

  this.nextNoteTime = 0.0; // when the next note is due.
  this.noteResolution = 0; // 0 == 16th, 1 == 8th, 2 == quarter note
  this.noteLength = 0.05; // length of "beep" (in seconds)
  // this.canvas; // the canvas element
  // this.canvasContext; // canvasContext is the canvas' context 2D
  this.last16thNoteDrawn = -1; // the last "box" we drew on the screen
  this.notesInQueue = []; // the notes that have been put into the web audio, and may or may not have played yet. {note, time}
  this.timerWorker = null; // The Web Worker used to fire timer messages

  this.nextNote = function () {
    // Advance current note and time by a 16th note...
    var secondsPerBeat = 60.0 / this.tempo; // Notice this picks up the CURRENT tempo value to calculate beat length.
    this.nextNoteTime += 0.25 * secondsPerBeat; // Add beat length to last beat time

    this.current16thNote++; // Advance the beat number, wrap to zero
    if (this.current16thNote == 16) {
      this.current16thNote = 0;
    }
  };

  this.scheduleNote = function (beatNumber, time) {
    // push the note on the queue, even if we're not playing.
    // for displaying tick.
    this.notesInQueue.push({ note: beatNumber, time: time });

    // if ( (this.noteResolution==1) && (beatNumber%2))
    //     return; // we're not playing non-8th 16th notes
    // if ( (this.noteResolution==2) && (beatNumber%4))
    //     return; // we're not playing non-quarter 8th notes

    // create an oscillator
    var osc = this.audioContext.createOscillator();
    osc.connect(this.audioContext.destination);

    if (beatNumber % 16 === 0)
      // beat 0 == high pitch
      osc.frequency.value = 880.0;
    else if (beatNumber % 4 === 0)
      // quarter notes = medium pitch
      osc.frequency.value = 440.0;
    // other 16th notes = low pitch
    else osc.frequency.value = 220.0;

    osc.start(time);
    osc.stop(time + this.noteLength);
  };

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
    
    canvas.isPaused = !canvas.isPaused;
    
    if (canvas.isPaused) {
      this.current16thNote = 0;
      this.nextNoteTime = this.audioContext.currentTime;
      metronome.timerWorker.postMessage("start");
    } else {
      metronome.timerWorker.postMessage("stop");
    }
  };

  this.draw = function () {
    let currentNote = metronome.last16thNoteDrawn;
    if (metronome.audioContext) {
      const currentTime = metronome.audioContext.currentTime;
      while (
        metronome.notesInQueue.length &&
        metronome.notesInQueue[0].time < currentTime
      ) {
        currentNote = metronome.notesInQueue[0].note;
        metronome.notesInQueue.splice(0, 1); // remove note from queue
      }
      if (metronome.last16thNoteDrawn != currentNote) {
        for (var i = 0; i < 16; i++) {
          if(currentNote == i){
            // if(currentNote % 4 === 0){
              console.log("16th beat")
              canvas.run()
            // }
          }
        }
        metronome.last16thNoteDrawn = currentNote;
      }
    }

    window.requestAnimationFrame(metronome.draw);
  };

  function loadWebWorker(worker) {
    const code = worker.toString();
    const blob = new Blob([code]);
    return new Worker(window.URL.createObjectURL(blob));
  }

  this.init = function () {
    window.requestAnimationFrame(this.draw);
    const workerScript = `
      var timerID=null;
      var interval=100;
      onmessage = (e) => { 
        if (e.data=="start") {
            console.log("MetronomeWorker::starting");
            timerID=setInterval(function(){postMessage("tick");},interval)
          }
        else if (e.data.interval) {
          console.log("MetronomeWorker::setting interval");
          interval=e.data.interval;
          if (timerID) {
            clearInterval(timerID);
            timerID=setInterval(function(){postMessage("tick");},interval)
          }
        }
        else if (e.data=="stop") {
          console.log("MetronomeWorker::stopping");
          clearInterval(timerID);
          timerID=null;
        }
      }
    `
    this.timerWorker = loadWebWorker(workerScript)
    this.timerWorker.onmessage = function (e) {
      if (e.data == "tick") {
        metronome.scheduler();
      } else {
        console.log("message: " + e.data);
      }
    };
    this.timerWorker.postMessage({ interval: this.lookahead });
  };
}