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
  this.targetHighlight
  this.isMuted = false

  this.set = function () {
  
    seeq.cursor.forEach((cursor, index) => {
      var offsetCursor = 0
      if (index == 0) {
        this.outputType = seeq.fetchDataSection.text.innerText
        offsetCursor = 0
      } else {
        this.outputType = seeq.fetchDataSection.text.innerHTML
        offsetCursor = 36 * index
      }

      // handle negative index to behave correctly.
      if( cursor.position < 0 ){
        this.output = this.outputType.substr(0) + 
        `<span class=\"current-active\">` + 
        this.outputType.substr(cursor.position, 1) + 
        "</span>" + 
        this.outputType.substr(0,0)
      } else {
        this.output = this.outputType.substr(0, cursor.position + offsetCursor) +
        `<span class=\"current-active\">` +
          this.outputType.substr(cursor.position + offsetCursor , 1) +
        "</span>" +
        this.outputType.substr(cursor.position + 1 + offsetCursor) 
      }

      seeq.fetchDataSection.text.innerHTML = this.output
      this.isCursorActived = true
      this.setCounterDisplay()
    })
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
    seeq.currentNumber.innerHTML = "--"
  }
  
  this.setTotalLenghtCounterDisplay = function(){
    seeq.totalNumber.innerHTML = seeq.fetchDataSection.text.innerText.length
  }

  this.selectedTextArea = function(){
    seeq.cursor.forEach( ( cursor, index, array ) => {
      array[index].position = seeq.matchedSelectPosition[index]
    })
  }

  this.setSelectLoopRange = function(){
    // limited sequence within select range.
    if( seeq.isSelectDrag){
      seeq.cursor.forEach( ( cursor, index, array ) => {
        if( cursor.position > seeq.selectAreaLength[index] - 1){
          array[index].position = seeq.matchedSelectPosition[index]
        } else if (seeq.isReverse && cursor.position < seeq.matchedSelectPosition[index]){
          array[index].position  = seeq.selectAreaLength[index] - 1
        }
      })
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
    seeq.cursor.forEach( ( cursor, index, array ) => {
      if( cursor.position > length-1){
        array[index].position = 0
      } else if ( seeq.isReverse && cursor.position < 0){
        array[index].position = length - 1
      }
      this.set() 
    })

    this.counting()
    this.setSelectLoopRange()
    this.run() 
    this.trigger()
  }

  this.counting = function(){
    var inc = []
    // increment | decrement.
    if(!this.isSync) { return }
    if(seeq.isReverse){
      seeq.cursor.forEach(target => target.position -= 1)
    } else {
      seeq.cursor.forEach(target => target.position += 1) 
    } 
    // seeq.cursor = inc
    // console.log("cursor with props = ", seeq.cursor)
  }

  this.countIn = function( beat ){
    if (this.counter != beat ){ this.isSync = true }
    this.counter = beat
  }

  this.trigger = function(){
    if( seeq.searchValue !== ""){
      seeq.cursor.forEach( ( cursor, index ) => {
        if( !cursor.isMuted ){
          if(seeq.matchedPosition.indexOf(cursor.position) !== (-1) && seeq.matchedPosition){
            seeq.appWrapper.classList.add("trigger")
            seeq.sendOsc()
            this.midiTrigger(index)
          } 
          setTimeout(() => {
            seeq.appWrapper.classList.remove("trigger")
          }, 50);
        }
      })
    }
  }

  this.midiTrigger = function(chan = 0){
    seeq.midi.send(chan, 4, this.getRandomInt(0, 6), 100, 7)
    seeq.midi.run()
    seeq.midi.clear()
  }

  this.run = function(){
    var self = this
    this.timer = setTimeout( function(){
      // seeq.cursor  += 1  //for debugging.
      self.set()
      self.increment() //enable this when wanted to run auto.
    }, this.clock)
  }

  this.stop = function(){
    clearTimeout(this.timer)
    seeq.cursor = [{
      position: 0,
      isMuted: false
    }]
    this.isSync = false
    seeq.selectAreaLength = []
    seeq.matchedSelectPosition = []
    this.set()
  }
  
}

module.exports = Sequencer