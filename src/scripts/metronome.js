function Metronome(){

    // implementation from https://github.com/cwilso/metronome.
    const Worker = require('./metronomeworker')
    this.audioContext = null;
    this.unlocked = false;
    this.isPlaying = false;      // Are we currently playing?
    this.startTime;              // The start time of the entire sequence.
    this.current16thNote;        // What note is currently last scheduled?
    this.tempo = 120.0;          // tempo (in beats per minute)
    this.lookahead = 25.0;       // How frequently to call scheduling function 
                                //(in milliseconds)
    this.scheduleAheadTime = 0.1;    // How far ahead to schedule audio (sec)
                                // This is calculated from lookahead, and overlaps 
                                // with next interval (in case the timer is late)
    this.nextNoteTime = 0.0;     // when the next note is due.
    this.noteResolution = 0;     // 0 == 16th, 1 == 8th, 2 == quarter note
    this.noteLength = 0.05;      // length of "beep" (in seconds)
    this.canvas                 // the canvas element
    this.canvasContext;          // canvasContext is the canvas' context 2D
    this.last16thNoteDrawn = -1; // the last "box" we drew on the screen
    this.notesInQueue = [];      // the notes that have been put into the web audio,
                                // and may or may not have played yet. {note, time}
    this.timerWorker = null;     // The Web Worker used to fire timer messages
    
    this.nextNote = function()  {
        // Advance current note and time by a 16th note...
        var secondsPerBeat = 60.0 / seeq.clock();    // Notice this picks up the CURRENT 
                                              // tempo value to calculate beat length.
        this.nextNoteTime += 0.25 * secondsPerBeat;    // Add beat length to last beat time
    
        this.current16thNote++;    // Advance the beat number, wrap to zero
        if (this.current16thNote == 16) {
            this.current16thNote = 0;
        }
    }
    
    this.scheduleNote = function( beatNumber, time ) {
      // push the note on the queue, even if we're not playing.
      // for displaying tick.
      this.notesInQueue.push( { note: beatNumber, time: time } );
  
      // if ( (this.noteResolution==1) && (beatNumber%2))
      //     return; // we're not playing non-8th 16th notes
      // if ( (this.noteResolution==2) && (beatNumber%4))
      //     return; // we're not playing non-quarter 8th notes
  
      // create an oscillator
      var osc = this.audioContext.createOscillator();
      let gain = this.audioContext.createGain();

      gain.gain.value = seeq.isBPMtoggle? 0.125:0

      osc.connect(gain);
      gain.connect(this.audioContext.destination);

      if (beatNumber % 16 === 0)    // beat 0 == high pitch
        osc.frequency.value = 880.0;
      else if (beatNumber % 4 === 0 )    // quarter notes = medium pitch
        osc.frequency.value = 440.0;
      else                        // other 16th notes = low pitch
        osc.frequency.value = 220.0;
  
      osc.start( time );
      osc.stop( time + this.noteLength );
    }
    
    this.scheduler = function() {
        // while there are notes that will need to play before the next interval, 
      // schedule them and advance the pointer.
      while (this.nextNoteTime < this.audioContext.currentTime + this.scheduleAheadTime ) {
        this.scheduleNote( this.current16thNote, this.nextNoteTime );
        this.nextNote();
      }
    }
    
    this.play = function() {
      if (!this.unlocked) {
        // play silent buffer to unlock the audio
        var buffer = this.audioContext.createBuffer(1, 1, 22050);
        var node = this.audioContext.createBufferSource();
        node.buffer = buffer;
        node.start(0);
        this.unlocked = true;
      }
  
      if (seeq.isPlaying) {
          this.current16thNote = 0;
          this.nextNoteTime = this.audioContext.currentTime;
          window.parent.postMessage("start", '*')
      } 
    }

    this.draw = function() {
      let self = seeq.metronome
      var currentNote = this.last16thNoteDrawn;
      var currentTime = seeq.metronome.audioContext.currentTime;
      while (self.notesInQueue.length && self.notesInQueue[0].time < currentTime) {
        currentNote = self.notesInQueue[0].note;
        self.notesInQueue.splice(0,1);   // remove note from queue
      }
  
      if (this.last16thNoteDrawn != currentNote) {
        seeq.seq.increment()
        // self.showBPM(this.last16thNoteDrawn)
        this.last16thNoteDrawn = currentNote;
      }
    
      window.requestAnimationFrame(seeq.metronome.draw);
    }

    this.showBPM = function(beat){
        if(beat % 4){
          seeq.bpmNumber.classList.remove("bpm-active") 
        } else {
          seeq.bpmNumber.classList.add("bpm-active")
        }
    }
    
    this.init = function(){
        this.audioContext = new AudioContext(); 
        
        // start the drawing loop.
        window.requestAnimationFrame(this.draw);    
    
        this.timerWorker = new Worker
    
        onmessage = function(e) {
            if (e.data == "tick") {
                seeq.metronome.scheduler();
            } else { console.log("message: " + e.data)}
        }
        window.parent.postMessage({ "interval": this.lookahead }, '*')
    }
}



module.exports = Metronome