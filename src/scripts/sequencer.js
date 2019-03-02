'use strict'

function Sequencer(){

  this.currentIndex = 0
  this.target
  this.textSelectHighlight = ""
  this.textBuffers = ""
  this.output = ""
  this.outputLoop = ""
  this.isCursorActived = false
  this.timer = null
  this.bpm = 120
  this.counter = 0
  this.isSync = false
  this.clock =  100
  this.offset = 0
  this.targetHighlight
  this.isMuted = false
  this.syncFreeMode = false
  this.clockCounter = 0
  this.isClockSync = false
  this.triggerFreeModeClock = null

  this.set = function () {

    seeq.cursor.forEach((cursor, index) => {
      // clearTimeout(this.timer)
      var self = this
      var offsetCursor = 0
      if (index == 0) {
        this.outputType = seeq.data.text.innerText
        offsetCursor = 0
      } else {
        this.outputType = seeq.data.text.innerHTML
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
     
      seeq.data.text.innerHTML = this.output
      this.isCursorActived = true
      this.setCounterDisplay()
    })
   
  }


  // connect with Ableton Link.
  this.connect = function(data){
    const { beat, bpm } = data
    this.bpm = bpm
    // this.beat = beat
    var CLOCK_DIVIDER = 2
    var MS_PER_BEAT = 1000 * 60 / bpm
    var CONVERTED_BPM = MS_PER_BEAT / CLOCK_DIVIDER
    this.clock = CONVERTED_BPM
  }

  this.setCounterDisplay = function(){
    seeq.currentNumber.innerHTML = "--"
  }
  
  this.setTotalLenghtCounterDisplay = function(){
    seeq.totalNumber.innerHTML = seeq.data.text.innerText.length
  }

  this.selectedTextArea = function(){
    seeq.cursor.forEach( ( cursor, index, array ) => {
      array[index].position = seeq.matchedSelectPosition[index]
    })
  }

  this.setSelectLoopRange = function(){
    // limited sequence within select range.
    if( !seeq.isSelectDrag ) { return }
    seeq.cursor.forEach( ( cursor, index, array ) => {
      if( cursor.position > seeq.selectAreaLength[index] - 1){
        array[index].position = seeq.matchedSelectPosition[index]
      } else if ( cursor.position < seeq.matchedSelectPosition[index]){
        array[index].position  = seeq.selectAreaLength[index] - 1
      }
    })
  }

  this.getRandomInt = function(min, max) {
    var min = Math.ceil(min);
    var max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  this.increment = function(){

    var length = seeq.data.text.innerText.length
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
    // increment | decrement.
    // if(!this.isSync) { return }
    let offset = 1
    if(seeq.isReverse){
      seeq.cursor.forEach(target => target.position -= 1)
    } else {
      seeq.cursor.forEach(( target, index, arr ) => { 
        if( target.reverse){
          target.position -= 1 
        } else {
          target.position += 1 
        }
      }) 
    } 
  }

  this.countIn = function( beat ){
    if (this.counter != beat ){ this.isSync = true }
    this.counter = beat
  }

  this.trigger = function(){

    let cursorAmount = seeq.cursor.length

    if( seeq.searchValue !== ""){

      if(seeq.isSelectDrag){
        seeq.cursor.forEach((cursor, index, array) => {
          if (!cursor.isMuted) {

            // trigger letters.
            if (seeq.matchedPositionLength == 1) {
              if (seeq.matchedPosition.indexOf(cursor.position) !== (-1)) {
                seeq.sendOsc()
                this.midiNoteOn(index + 1, undefined, undefined, undefined)
                seeq.getHighlight[index].classList.add("selection-trigger")
              } else {
                seeq.getHighlight[index].classList.remove("selection-trigger")
              }
            }

            // trigger words.
            else if (seeq.matchedPositionLength > 1) {
              if (seeq.matchedPosition.indexOf(cursor.position) !== (-1)) {
                seeq.sendOsc()
                this.midiNoteOn(index + 1)
                seeq.getHighlight[index].classList.add("selection-trigger")
              } else {
                if (seeq.matchedPositionWithLength.indexOf(cursor.position) == (-1)) {
                  seeq.getHighlight[index].classList.remove("selection-trigger")
                }
              }
            }
          }
        })
      } else {
        seeq.cursor.forEach((cursor, index, array) => {
          if (!cursor.isMuted) {

            // trigger letters.
            if (seeq.matchedPositionLength == 1) {
              if (seeq.matchedPosition.indexOf(cursor.position) !== (-1)) {
                seeq.sendOsc()
                this.midiNoteOn(index + 1, undefined, undefined, undefined)
                seeq.data.el.classList.add("trigger")
              }
              else {
                if( seeq.data.el.classList.contains('trigger')){
                  seeq.data.el.classList.remove("trigger")
                  // seeq.el.classList.remove("trigger") 
                }
              }
            }

            // trigger words.
            else if (seeq.matchedPositionLength > 1) {
              if (seeq.matchedPosition.indexOf(cursor.position) !== (-1)) {
                seeq.data.el.classList.add("trigger")
                seeq.sendOsc()
                this.midiNoteOn(index + 1)
              } else {
                if (seeq.matchedPositionWithLength.indexOf(cursor.position) == (-1)) {
                  seeq.data.el.classList.remove("trigger")
                  // this.midiNoteOff()
                }
              }
            }
          }
        })
      }
    }
  }

  this.trigger2 = function() {
    let clock = seeq.clock()
    this.midiNoteOn(0, 12, 16, this.getRandomInt(0, 6)) 
    seeq.el.classList.add("trigger-free-mode")
    setTimeout(() => {
      seeq.el.classList.remove("trigger-free-mode")
    }, clock.bpm);
  }


  this.triggerFreeMode = function(){

    let self = this
    let clock = seeq.clock()

      if( seeq.isFreeModeAutoPlay){
        this.midiNoteOn(0, 12 ,16, this.getRandomInt(0, 6))
        seeq.el.classList.add("trigger-free-mode")
        setTimeout(() => {
          seeq.el.classList.remove("trigger-free-mode") 
        }, clock.bpm);
      } else {
        return
      }
  }

  this.midiNoteOn = function(chan = 0, note = this.getRandomInt(0,6), noteLength = 7, oct = 4){
    seeq.midi.send({ channel: chan,octave: oct, note ,velocity: 100,length: noteLength })
    seeq.midi.run()
    seeq.midi.clear()
  }

  this.midiNoteOff = function(){
    seeq.midi.noteOff()
    seeq.midi.clear()
  }

  this.run = function(){
    let self = this
    this.timer = setTimeout( function(){
      // self.triggerFreeMode()
      self.increment()
    }, (60000 / seeq.clock().bpm) / 4 )
    
  }

  this.stop = function(){
    clearTimeout(this.timer)
    clearTimeout(this.triggerFreeModeClock)
    seeq.cursor = [{
      position: 0,
      isMuted: false,
      up: 0,
      down: 0
    }]
    seeq.data.el.classList.remove("trigger")
    // this.isSync = false
    seeq.isFreeModeAutoPlay = false
    this.clockCounter = 0
    seeq.selectAreaLength = []
    seeq.matchedSelectPosition = []
    seeq.searchValue = ""
    this.set()
  }
  
}

module.exports = Sequencer