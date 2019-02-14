'use strict'

function Sequencer(id){

  this.currentIndex = 0
  this.target
  this.id = id

  this.textSelectHighlight = ""
  this.paragraphCursorPosition = 0
  this.textBuffers = ""
  this.output = ""
  this.outputLoop = ""
  this.isCursorActived = false
  this.timer = ""
  this.bpm = 120
  this.counter = 0
  this.isSync = false
  this.clock =  100

  this.refresh = function(){
    seeq.seq.textBuffers = seeq.fetchDataSection.text.textContent; 
  }

  this.setWithChunk = function(){
    this.output1 = seeq.fetchDataSection.text.textContent.substr(0, this.paragraphCursorPosition)
    this.output2 = `<span id=${this.id} class=\"current-active\">` + seeq.fetchDataSection.text.textContent.substr(this.paragraphCursorPosition, 1) + "</span>"
    this.output3 = seeq.fetchDataSection.text.innerHTML.substr(this.paragraphCursorPosition + 1) 

    this.combinedChunk = this.output1 + this.output2 + this.output3
  }

  this.set = function(){
    this.output = seeq.fetchDataSection.text.textContent.substr(0, this.paragraphCursorPosition) +
		`<span id=${this.id} class=\"current-active\">` +
      seeq.fetchDataSection.text.textContent.substr(this.paragraphCursorPosition, 1) +
		"</span>" +
      seeq.fetchDataSection.text.textContent.substr(this.paragraphCursorPosition+1)  ;

    seeq.fetchDataSection.updateWithCursor(this.output)
    this.isCursorActived = true
    this.setCounterDisplay()
  }


  this.setMultiLoop = function(){
    // this.textBuffers = seeq.fetchDataSection.text.innerHTML;
    this.output = seeq.fetchDataSection.text.innerHTML.substr(0, this.paragraphCursorPosition) +
      `<span id=${this.id} class=\"current-active\">` +
      seeq.fetchDataSection.text.innerHTML.substr(this.paragraphCursorPosition, 1) +
      "</span>" +
      seeq.fetchDataSection.text.innerHTML.substr(this.paragraphCursorPosition + 1);

    seeq.fetchDataSection.updateWithCursor(this.output)
    this.isCursorActived = true
    // this.setCounterDisplay()
  }

  // connect with Ableton Link.
  this.connect = function(data){
    const { beat, bpm } = data
    this.bpm = bpm
    var CLOCK_DIVIDER = 2
    var MS_PER_BEAT = 1000 * 60 / bpm
    var CONVERTED_BPM = MS_PER_BEAT / CLOCK_DIVIDER
    this.clock = CONVERTED_BPM
  }

  this.setCounterDisplay = function(){
    seeq.currentNumber.innerHTML = this.paragraphCursorPosition
  }

  this.setTotalLenghtCounterDisplay = function(){
    seeq.totalNumber.innerHTML = seeq.fetchDataSection.text.innerText.length
  }

  this.selectedTextArea = function(){
    this.paragraphCursorPosition = seeq.matchedSelectPosition
  }

  this.setSelectLoopRange = function(){
    // limited sequence within select range.
    if( seeq.isSelectDrag){
      if( this.paragraphCursorPosition > seeq.selectAreaLength - 1){
        this.paragraphCursorPosition = seeq.matchedSelectPosition
      } else if (seeq.isReverse && this.paragraphCursorPosition < seeq.matchedSelectPosition){
        this.paragraphCursorPosition = seeq.selectAreaLength - 1
      }
    } 
  }

  this.getRandomInt = function(min, max) {
    var min = Math.ceil(min);
    var max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  this.increment = function(){
    // var length = seeq.fetchDataSection.text.innerText.length
    // // boundary.
    // if( this.paragraphCursorPosition > length-1){
    //   this.paragraphCursorPosition = 0
    //   this.refresh()
    //   this.set() 
    // } else if ( seeq.isReverse && this.paragraphCursorPosition <= 0){
    //   this.paragraphCursorPosition = length - 1
    //   this.refresh()
    //   this.set() 
    // }

    // this.counting()
    // this.setSelectLoopRange()
    // this.refresh()
    this.run() 
    // this.trigger()
  }

  this.counting = function(){
    // increment | decrement.
    if(!this.isSync) { return }
    seeq.isReverse ? 
    this.paragraphCursorPosition -= 1 : 
    this.paragraphCursorPosition += 1
  }

  this.countIn = function( beat ){
    if (this.counter != beat ){ this.isSync = true }
    this.counter = beat
  }

  this.trigger = function(){
    if( seeq.searchValue !== ""){
      if(seeq.matchedPosition.indexOf(this.paragraphCursorPosition) !== (-1) && seeq.matchedPosition){
        seeq.appWrapper.classList.add("trigger")
        seeq.sendOsc()
        this.midiTrigger()
      }
      setTimeout(() => {
        seeq.appWrapper.classList.remove("trigger")
      }, 50);
    }
  }

  this.midiTrigger = function(){
    seeq.midi.send(0, 4, this.getRandomInt(0, 6), 100, 7)
    seeq.midi.run()
    seeq.midi.clear()
  }

  this.run = function(){
    var self = this
    // this.timer = setTimeout( function(){
        this.paragraphCursorPosition  += 1  //for debugging.
        // self.refresh()
        self.set()
        // self.increment() //enable this when wanted to run auto.
    // }, this.clock)
  }

  this.stop = function(){
    clearTimeout(this.timer)
    this.paragraphCursorPosition = 0
    this.refresh()
    this.set()
    this.isSync = false
  }
  
}

module.exports = Sequencer