'use strict'

function Sequencer(){

  this.currentIndex = 0
  this.target
  this.textSelectHighlight = ""
  this.textBuffers = ""
  this.output = ""
  this.outputLoop = ""
  this.isCursorActived = false
  this.timer = ""
  this.bpm = 120
  this.counter = 0
  this.isSync = false
  this.clock =  100
  this.offset = 0

  // this.set = function(){
  //   let offset = 0
  //   seeq.paragraphCursorPosition.forEach((cursor) => {
  //     this.output = seeq.fetchDataSection.text.innerHTML.substr(0, cursor + offset) +
  //     `<span class=\"current-active\">` +
  //       seeq.fetchDataSection.text.innerHTML.substr(cursor + offset, 1) +
  //     "</span>" +
  //     seeq.fetchDataSection.text.innerHTML.substr(cursor+1+offset)  ;
  //     seeq.fetchDataSection.text.innerHTML = this.output
  //   })
  //   offset += 37
  // }

  this.set = function () {
    seeq.paragraphCursorPosition.forEach((cursor, index) => {
      if (index == 0) {
        this.outputType = seeq.fetchDataSection.text.textContent
      } else {
        this.outputType = seeq.fetchDataSection.text.innerHTML
      }

      this.output = this.outputType.substr(0, cursor) + 
      `<span class=\"current-active\">` + 
      this.outputType.substr(cursor, 1) + 
      "</span>" + 
      this.outputType.substr(cursor + 1)

      seeq.fetchDataSection.text.innerHTML = this.output
      this.isCursorActived = true
      this.setCounterDisplay()
    })
  }


  // connect with Ableton Link.
  this.connect = function(data){
    const { beat, bpm } = data
    this.bpm = bpm
    var CLOCK_DIVIDER = 6
    var MS_PER_BEAT = 1000 * 60 / bpm
    var CONVERTED_BPM = MS_PER_BEAT / CLOCK_DIVIDER
    this.clock = CONVERTED_BPM
  }

  this.setCounterDisplay = function(){
    seeq.currentNumber.innerHTML = "--"
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

    var length = seeq.fetchDataSection.text.innerText.length
    // boundary.
    seeq.paragraphCursorPosition.forEach( cursor => {
      if( cursor > length-1){
        cursor = 0
        this.set() 
      } else if ( seeq.isReverse && cursor <= 0){
        cursor = length - 1
        this.set() 
      }
    })

    this.counting()
    // self.setSelectLoopRange()
    // self.refresh()
    this.run() 
    this.trigger()
    // this.set()
  }

  this.counting = function(){
    var inc = []
    // increment | decrement.
    if(!this.isSync) { return }
    if(seeq.isReverse){
      inc = seeq.paragraphCursorPosition.map(pos => pos - 1)
    } else {
    inc = seeq.paragraphCursorPosition.map(pos => pos + 1) 
    } 
    seeq.paragraphCursorPosition = inc
  }

  this.countIn = function( beat ){
    if (this.counter != beat ){ this.isSync = true }
    this.counter = beat
  }

  this.trigger = function(){
    if( seeq.searchValue !== ""){
      seeq.paragraphCursorPosition.forEach( ( cursor, index ) => {
        if(index == 0){
          if(seeq.matchedPosition.indexOf(cursor) !== (-1) && seeq.matchedPosition){
            seeq.appWrapper.classList.add("trigger")
            seeq.sendOsc()
            this.midiTrigger()
          }
        } else {
          var offsetPosition = seeq.matchedPosition.map( pos => pos + 36)
          if (offsetPosition.indexOf(cursor) !== (-1) && offsetPosition) {
            seeq.appWrapper.classList.add("trigger")
            seeq.sendOsc()
            this.midiTrigger()
          } 
        }
        setTimeout(() => {
          seeq.appWrapper.classList.remove("trigger")
        }, 50);
      })
    }
  }

  this.midiTrigger = function(){
    seeq.midi.send(0, 4, this.getRandomInt(0, 6), 100, 7)
    seeq.midi.run()
    seeq.midi.clear()
  }

  this.run = function(){
    var self = this
    this.timer = setTimeout( function(){
      // seeq.paragraphCursorPosition  += 1  //for debugging.
      self.set()
      self.increment() //enable this when wanted to run auto.
    }, this.clock)
  }

  this.stop = function(){
    clearTimeout(this.timer)
    seeq.paragraphCursorPosition = [0]
    this.set()
    this.isSync = false
  }
  
}

module.exports = Sequencer