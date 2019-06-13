'use strict'

function Sequencer(app){

  this.output = ""
  this.beatRatio = '16th'

  this.set = function () {

    app.cursor.forEach((cursor, index) => {
      var self = this
      var offsetCursor = 0
      if (index == 0) {
        this.outputType = app.data.text.innerText
        offsetCursor = 0
      } else {
        this.outputType = app.data.text.innerHTML
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
     
      app.data.text.innerHTML = this.output
      // this.isCursorActived = true
    })
   
  }

  this.setBPMdisplay = function(  ){
    app.bpmNumber.innerHTML =  app.clock().bpm
  }

  this.setCounterDisplay = function(){
    app.currentNumber.innerHTML = this.beatRatio
  }

  // this.setCPUUsageDisplay = function(v){
  //   let trimmedData = v.toFixed(2)
  //   app.cpuUsage.innerHTML = trimmedData + " " + "%"
  // }
  
  this.setTotalLenghtCounterDisplay = function(){
    app.totalNumber.innerHTML = app.data.text.innerText.length
  }

  this.selectedRangeStartIndex = function(){
    app.cursor.forEach( ( cursor, index, array ) => {
      array[index].position = app.matchedSelectPosition[index]
    })
  }

  this.setSelectionRange = function(){
    // limited sequence within select range.
    if( !app.isTextSelected ) { return }
    app.cursor.forEach( ( cursor, index, array ) => {
      let cursorPosition, offsetReverseCursor
      // reversed position compensation.
      if( cursor.isCursorOffsetReverse){
        cursorPosition = cursor.position - 2
        offsetReverseCursor = 2
      } else {
        cursorPosition = cursor.position
        offsetReverseCursor = 0
      }

      if( cursorPosition > app.selectedRangeLength[index] - 1){
        array[index].position = app.matchedSelectPosition[index]
      } else if ( cursorPosition < app.matchedSelectPosition[index]){
        array[index].position  = app.selectedRangeLength[index] - 1 +  offsetReverseCursor
      }
    })
  }

  this.getRandomInt = function(min, max) {
    var min = Math.ceil(min);
    var max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  this.run = function(){
    if( !app.isTextSelected ) { 
     this.setGlobalCursorWrap()
    }
    this.set() 
    this.counting()
    this.trigger()
    this.setSelectionRange()
  }

  this.setGlobalCursorWrap = function(){
    var length = app.data.text.innerText.length
    app.cursor.forEach((cursor, index, array) => {
      if (cursor.position > length - 1) {
        array[index].position = 0
      } else if (app.isReverse && cursor.position < 0) {
        array[index].position = length - 1
      }
    })
  }

  this.counting = function(){
    // increment | decrement.
    let offset = 1
    if(app.isReverse){
      app.cursor.forEach(target => target.position -= 1)
    } else {
      app.cursor.forEach(( target, index, arr ) => { 
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
    if( app.searchValue !== ""){
      if(app.isTextSelected){
        app.cursor.forEach((cursor, index, array) => {
          if (!cursor.isMuted) {
            // trigger letters.
            if (app.matchedPositionLength == 1) {
              if (app.matchedPosition.indexOf(cursor.position) !== (-1)) {
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
                // app.sendOsc()
                this.midiNoteOn(cursor.channel, cursor.octave[counterIndex], cursor.note[counterIndex], cursor.velocity, cursor.length)
                app.textBaffleFX()
                app.getHighlight[index].classList.add("selection-trigger")
                cursor.note.length > 1? cursor.counter++:cursor.counter
              } else {
                app.getHighlight[index].classList.remove("selection-trigger")
              }
            }

            // trigger words.
            else if (app.matchedPositionLength > 1) {
              if (app.matchedPosition.indexOf(cursor.position) !== (-1)) {
                // app.sendOsc()
                this.midiNoteOn(index)
                app.textBaffleFX()
                app.getHighlight[index].classList.add("selection-trigger")
              } else {
                if (app.matchedPositionWithLength.indexOf(cursor.position) == (-1)) {
                  app.getHighlight[index].classList.remove("selection-trigger")
                }
              }
            }
          }
        })
      } else {
        app.cursor.forEach((cursor, index, array) => {
          // trigger letters.
          if (app.matchedPositionLength == 1) {
            if (app.matchedPosition.indexOf(cursor.position) !== (-1)) {
              // app.sendOsc()
              this.midiNoteOn(0)
              app.textBaffleFX()
              app.info.classList.add("trigger")
            }
            else {
              if( app.info.classList.contains('trigger')){
                app.info.classList.remove("trigger")
              }
            }
          }

          // trigger words.
          else if (app.matchedPositionLength > 1) {
            if (app.matchedPosition.indexOf(cursor.position) !== (-1)) {
              // app.sendOsc()
              this.midiNoteOn(0)
              app.textBaffleFX()
              app.info.classList.add("trigger")
            } else {
              // if (app.matchedPositionWithLength.indexOf(cursor.position) == (-1)) {
              //   app.data.el.classList.remove("trigger")
              //   // this.midiNoteOff()
              // }
            }
          }
        })
      }
    }
  }

  this.triggerOnClick = function() {
    let clock = app.clock()
    let i, index
    let {
      note,
      length,
      velocity,
      octave,
      channel, 
      counter,
    } = app.triggerCursor
   
    if( octave.length > 1){
      i = octave.length
      // offset index when click `nextBtn` to start from 0 not 1.
      let offsetCounter = counter - 1
      index = offsetCounter % i
    } else {
      index = 0
    }
    
    this.midiNoteOn(channel, octave[index], note[index], velocity, length) 
    app.el.classList.add("trigger-free-mode")
    setTimeout(() => {
      app.el.classList.remove("trigger-free-mode")
    }, clock.bpm);
  }


  this.midiNoteOn = function(channel = 0, octave = 4, note = this.getRandomInt(0,11),velocity = 100, length = 7){
    app.midi.send({ channel ,octave, note ,velocity ,length })
    app.midi.run()
    app.midi.clear()
  }

  this.midiNoteOff = function(){
    app.midi.noteOff()
    app.midi.clear()
  }

  this.stop = function(){
    app.cursor = app.reset()
    // app.resetInfoBar()
    app.data.el.classList.remove("trigger")
    app.selectedRangeLength = []
    app.matchedSelectPosition = []
    app.searchValue = ""
    app.isTextSelected = false
    this.set()
    window.parent.postMessage("stop", '*')
  }

  this.nudged = function(){
    if(app.isTextSelected){
      this.resetSelectedRange()
    } else {
      app.cursor = app.reset()
    }
    
    // app.resetInfoBar()
    app.data.el.classList.remove("trigger")
    this.set()
    window.parent.postMessage("stop", '*') 
  }

  this.resetSelectedRange = function(){
    app.cursor.forEach((cursor, index, array) => { 
      array[index].position = app.matchedSelectPosition[index]
    })
  }
  
}

module.exports = Sequencer