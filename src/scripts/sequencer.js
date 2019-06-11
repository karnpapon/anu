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
  this.isClockSync = false
  this.triggerFreeModeClock = null
  this.beatRatio = 4

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

      let cursorPosition = cursor.isCursorOffsetReverse? cursor.position - 2:cursor.position
      
      // handle negative index to behave correctly.
      if( cursorPosition < 0 ){
        this.output = this.outputType.substr(0) + 
        `<span class=\"current-active\">` + 
        this.outputType.substr(cursorPosition, 1) + 
        "</span>" + 
        this.outputType.substr(0,0)
      } else {
        this.output = this.outputType.substr(0, cursorPosition + offsetCursor) +
        `<span class=\"current-active\">` +
          this.outputType.substr(cursorPosition + offsetCursor , 1) +
        "</span>" +
        this.outputType.substr(cursorPosition + 1 + offsetCursor) 
      }
     
      seeq.data.text.innerHTML = this.output
      // this.isCursorActived = true
    })
   
  }

  this.setBPMdisplay = function(  ){
    seeq.bpmNumber.innerHTML =  seeq.clock().bpm
  }

  this.setCounterDisplay = function(){
    seeq.currentNumber.innerHTML = this.beatRatio
  }

  // this.setCPUUsageDisplay = function(v){
  //   let trimmedData = v.toFixed(2)
  //   seeq.cpuUsage.innerHTML = trimmedData + " " + "%"
  // }
  
  this.setTotalLenghtCounterDisplay = function(){
    seeq.totalNumber.innerHTML = seeq.data.text.innerText.length
  }

  this.selectedRangeStartIndex = function(){
    seeq.cursor.forEach( ( cursor, index, array ) => {
      array[index].position = seeq.matchedSelectPosition[index]
    })
  }

  this.setSelectionRange = function(){
    // limited sequence within select range.
    if( !seeq.isTextSelected ) { return }
    seeq.cursor.forEach( ( cursor, index, array ) => {
      let cursorPosition, offsetReverseCursor
      // reversed position compensation.
      if( cursor.isCursorOffsetReverse){
        cursorPosition = cursor.position - 2
        offsetReverseCursor = 2
      } else {
        cursorPosition = cursor.position
        offsetReverseCursor = 0
      }

      if( cursorPosition > seeq.selectedRangeLength[index] - 1){
        array[index].position = seeq.matchedSelectPosition[index]
      } else if ( cursorPosition < seeq.matchedSelectPosition[index]){
        array[index].position  = seeq.selectedRangeLength[index] - 1 +  offsetReverseCursor
      }
    })
  }

  this.getRandomInt = function(min, max) {
    var min = Math.ceil(min);
    var max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  this.run = function(){
    if( !seeq.isTextSelected ) { 
     this.setGlobalCursorWrap()
    }
    this.set() 
    this.counting()
    this.trigger()
    this.setSelectionRange()
  }

  this.setGlobalCursorWrap = function(){
    var length = seeq.data.text.innerText.length
    seeq.cursor.forEach((cursor, index, array) => {
      if (cursor.position > length - 1) {
        array[index].position = 0
      } else if (seeq.isReverse && cursor.position < 0) {
        array[index].position = length - 1
      }
    })
  }

  this.counting = function(){
    // increment | decrement.
    let offset = 1
    if(seeq.isReverse){
      seeq.cursor.forEach(target => target.position -= 1)
    } else {
      seeq.cursor.forEach(( target, index, arr ) => { 
        if (target.isRetrigger) {
          target.position += 0
        } 
        else if( target.reverse){
          target.position -= 1 
        } else {
          target.position += 1 
        }
      }) 
    } 
  }

  this.trigger = function(){

    let reverseCounter
    let counterIndex
    if( seeq.searchValue !== ""){
      if(seeq.isTextSelected){
        seeq.cursor.forEach((cursor, index, array) => {
          if (!cursor.isMuted) {
            // trigger letters.
            if (seeq.matchedPositionLength == 1) {
              if (seeq.matchedPosition.indexOf(cursor.position) !== (-1)) {
                if( cursor.reverse){
                  reverseCounter = ( cursor.note.length - 1 ) - cursor.counter
                  if( reverseCounter < 0) { // reset reversed counter.
                    reverseCounter = cursor.note.length - 1
                    cursor.counter = 0
                  }
                  counterIndex = reverseCounter
                } else {
                  cursor.counter % cursor.note.length == 0? cursor.counter = 0:cursor.counter
                  counterIndex = cursor.counter
                }
                // seeq.sendOsc()
                this.midiNoteOn(cursor.channel, cursor.octave[counterIndex], cursor.note[counterIndex], cursor.velocity, cursor.length)
                seeq.getHighlight[index].classList.add("selection-trigger")
                cursor.note.length > 1? cursor.counter++:cursor.counter
              } else {
                seeq.getHighlight[index].classList.remove("selection-trigger")
              }
            }

            // trigger words.
            else if (seeq.matchedPositionLength > 1) {
              if (seeq.matchedPosition.indexOf(cursor.position) !== (-1)) {
                // seeq.sendOsc()
                this.midiNoteOn(index)
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
                // seeq.sendOsc()
                this.midiNoteOn(index, undefined, undefined, undefined)
                seeq.data.el.classList.add("trigger")
              }
              else {
                if( seeq.data.el.classList.contains('trigger')){
                  seeq.data.el.classList.remove("trigger")
                }
              }
            }

            // trigger words.
            else if (seeq.matchedPositionLength > 1) {
              if (seeq.matchedPosition.indexOf(cursor.position) !== (-1)) {
                seeq.data.el.classList.add("trigger")
                // seeq.sendOsc()
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

  this.triggerOnClick = function() {
    let clock = seeq.clock()
    let i, index
    let {
      note,
      length,
      velocity,
      octave,
      channel, 
      counter,
    } = seeq.triggerCursor
   
    if( octave.length > 1){
      i = octave.length
      // offset index when click `nextBtn` to start from 0 not 1.
      let offsetCounter = counter - 1
      index = offsetCounter % i
    } else {
      index = 0
    }
    
    this.midiNoteOn(channel, octave[index], note[index], velocity, length) 
    seeq.el.classList.add("trigger-free-mode")
    setTimeout(() => {
      seeq.el.classList.remove("trigger-free-mode")
    }, clock.bpm);
  }


  // this.triggerFreeMode = function(){

  //   let self = this
  //   let clock = seeq.clock()

  //     if( seeq.isFreeModeAutoPlay){
  //       this.midiNoteOn(0, 12 ,16, this.getRandomInt(0, 6))
  //       seeq.el.classList.add("trigger-free-mode")
  //       setTimeout(() => {
  //         seeq.el.classList.remove("trigger-free-mode") 
  //       }, clock.bpm);
  //     } else {
  //       return
  //     }
  // }

  this.midiNoteOn = function(channel = 0, octave = 4, note = this.getRandomInt(0,11),velocity = 100, length = 7){
    seeq.midi.send({ channel ,octave, note ,velocity ,length })
    seeq.midi.run()
    seeq.midi.clear()
  }

  this.midiNoteOff = function(){
    seeq.midi.noteOff()
    seeq.midi.clear()
  }

  this.stop = function(){
    clearTimeout(this.timer)
    // clearTimeout(this.triggerFreeModeClock)
    seeq.cursor = seeq.reset()
    seeq.resetInfoBar()
    seeq.data.el.classList.remove("trigger")
    // this.isSync = false
    seeq.isFreeModeAutoPlay = false
    seeq.selectedRangeLength = []
    seeq.matchedSelectPosition = []
    seeq.searchValue = ""
    seeq.isTextSelected = false
    this.set()
    window.parent.postMessage("stop", '*')
  }

  this.nudged = function(){
    clearTimeout(this.timer)
    this.resetSelectedRange()
    seeq.resetInfoBar()
    seeq.data.el.classList.remove("trigger")
    this.set()
    window.parent.postMessage("stop", '*') 
  }

  this.resetSelectedRange = function(){
    seeq.cursor.forEach((cursor, index, array) => { 
      array[index].position = seeq.matchedSelectPosition[index]
    })
  }
  
}

module.exports = Sequencer