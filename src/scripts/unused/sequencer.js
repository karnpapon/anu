'use strict'

function Sequencer(app){

  const { getRandomInt } = require('../lib/utils')

  this.output = ""
  this.beatRatio = '16th'

  this.set = function (highlighter, index) {

    // app.highlighter.forEach((highlighter, index) => {
      var offsetCursor = 0
      if (index == 0) {
        this.outputType = app.data.cursorText.innerText
        offsetCursor = 0
      } else {
        this.outputType = app.data.cursorText.innerHTML
        offsetCursor = 36 * index
      }

      let cursorPosition = highlighter.isCursorOffsetReverse? highlighter.position - 2:highlighter.position
      
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
     
      app.data.cursorText.innerHTML = this.output
    // })
   
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
    app.totalNumber.innerHTML = canvas.texts.length
  }

  this.selectedRangeStartIndex = function(){
    app.highlighter.forEach( ( highlighter, index, array ) => {
      array[index].position = app.matchedSelectPosition[index]
    })
  }

  this.setSelectionRange = function(highlighter, index, array){
    if( !app.isTextSelected ) { return }
      let cursorPosition, offsetReverseCursor

      // reversed position compensation.
      if( highlighter.isCursorOffsetReverse){
        cursorPosition = highlighter.position - 2
        offsetReverseCursor = 2
      } else {
        cursorPosition = highlighter.position
        offsetReverseCursor = 0
      }

      if( cursorPosition > app.selectedRangeLength[index] - 1){
        array[index].position = app.matchedSelectPosition[index]
      } else if ( cursorPosition < app.matchedSelectPosition[index]){
        array[index].position  = app.selectedRangeLength[index] - 1 +  offsetReverseCursor
      }
  }

  this.run = function(){
    app.highlighter.forEach((highlighter, index, array) => {
      if( !app.isTextSelected ) { 
        this.setGlobalCursorWrap(highlighter, index, array)
      }
      this.set(highlighter, index) 
      this.counting(highlighter)
      this.trigger(highlighter, index, array)
      this.setSelectionRange(highlighter, index, array)

    })
  }

  this.setGlobalCursorWrap = function(highlighter, index, array){
    var length = app.data.cursorText.innerText.length
      if (highlighter.position > length - 1) {
        array[index].position = 0
      } else if (app.isReverse && highlighter.position < 0) {
        array[index].position = length - 1
      }
  }

  this.counting = function(target){
    // increment | decrement.
    let offset = 1
    if(app.isReverse){
      target.position -= 1
    } else {
        if (target.isRetrigger) {
          target.position += 0
        } 
        else if( target.reverse){
          target.position -= 1 
        } else {
          target.position += 1 
        }
    } 
  }

  this.trigger = function(highlighter, index, array){

    if( app.searchValue !== ""){
      if(app.isTextSelected){
        if (!highlighter.isMuted) {
          // trigger letters.
          if (app.matchedPositionLength == 1) {
            if (app.matchedPosition.indexOf(highlighter.position) !== (-1)) {
              this.outputMsg(highlighter)
              this.addTriggerClass(index)
              highlighter.note.length > 1? highlighter.counter++:highlighter.counter
            } else {
              this.removeTriggerClass(index)
            }
          }

          // trigger words.
          else if (app.matchedPositionLength > 1) {
            if (app.matchedPosition.indexOf(highlighter.position) !== (-1)) {
              this.outputMsg(highlighter)
              this.addTriggerClass(index)
            } else {
              if (app.matchedPositionWithLength.indexOf(highlighter.position) == (-1)) {
                app.getHighlight[index].classList.remove("selection-trigger")
                app.info.classList.remove("trigger")
              }
            }
          }
        }
      } else {
          // trigger letters.
          if (app.matchedPositionLength == 1) {
            if (app.matchedPosition.indexOf(highlighter.position) !== (-1)) {
              this.outputMsg(highlighter)
              this.addTriggerClass()
            }
            else {
              if( app.info.classList.contains('trigger')){
                app.info.classList.remove("trigger")
              }
            }
          }

          // trigger words.
          else if (app.matchedPositionLength > 1) {
            if (app.matchedPosition.indexOf(highlighter.position) !== (-1)) {
              this.outputMsg(highlighter)
              this.addTriggerClass()
            } else {
              // if (app.matchedPositionWithLength.indexOf(highlighter.position) == (-1)) {
              //   app.data.el.classList.remove("trigger")
              // }
            }
          }
      }
    }
  }

  this.getCursorIndex = function(highlighter){
    let reverseCounter, counterIndex
    if (highlighter.reverse) {
      reverseCounter = (highlighter.note.length - 1) - highlighter.counter
      if (reverseCounter < 0) { // reset reversed counter.
        reverseCounter = highlighter.note.length - 1
        highlighter.counter = 0
      }
      counterIndex = reverseCounter
    } else {
      highlighter.counter % highlighter.note.length == 0 ? highlighter.counter = 0 : highlighter.counter
      counterIndex = highlighter.counter
    }

    return counterIndex
  }

  this.outputMsg =  function(highlighter){
    let i = this.getCursorIndex(highlighter)
    this.midiNoteOn(
      highlighter.channel, 
      highlighter.octave[i], 
      highlighter.note[i], 
      highlighter.velocity[i], 
      highlighter.notelength[i]
    )
    app.isOSCToggled ? app.io.osc.push('/' + highlighter.OSC.path, highlighter.OSC.msg):() => {}
    app.isUDPToggled ? this.udpSend(highlighter.UDP[i]):()=> {}
    app.io.run()
    app.io.clear()
    // app.textBaffleFX()
  }


  this.addTriggerClass = function(targetIndex){
    app.info.classList.add("trigger")
    app.isTextSelected? app.getHighlight[targetIndex].classList.add("selection-trigger"):() =>{}
  }

  this.removeTriggerClass = function(targetIndex){
    app.isTextSelected? app.getHighlight[targetIndex].classList.remove("selection-trigger"): () => {}
    app.info.classList.remove("trigger")
  }

  this.triggerOnClick = function() {
    let clock = app.clock()
    let i, index
    let {
      note,
      notelength,
      velocity,
      octave,
      channel, 
      counter,
      UDP
    } = app.triggerCursor
   
    if( octave.length > 1){
      i = octave.length
      // offset index when click `nextBtn` to start from 0 not 1.
      let offsetCounter = counter - 1
      index = offsetCounter % i
    } else {
      index = 0
    }
    
    this.midiNoteOn(channel, octave[index], note[index], velocity, notelength) 
    this.udpSend(UDP) 
    app.el.classList.add("trigger-free-mode")
    setTimeout(() => {
      app.el.classList.remove("trigger-free-mode")
    }, clock.bpm);
  }

  this.udpSend = function(msg){
    app.io.udp.send(msg)
  }


  this.midiNoteOn = function(channel = 0, octave = 4, note = getRandomInt(0,11),velocity = 100, length = 7){
    app.io.midi.send({ channel ,octave, note ,velocity ,length })
  }

  this.stop = function(){
    app.highlighter = app.retrieveCursor()
    app.data.el.classList.remove("trigger")
    app.selectedRangeLength = []
    app.matchedSelectPosition = []
    app.searchValue = ""
    app.isTextSelected = false

    if (app.isLinkToggle){
      window.parent.postMessage("stop", '*')
    }
  }

  this.nudged = function(){
    if(app.isTextSelected){
      this.resetSelectedRange()
    } else {
      app.highlighter = app.retrieveCursor()
    }
    
    app.data.el.classList.remove("trigger")
    // this.set(app.highlighter, 0)
    if (app.isLinkToggle) {
      window.parent.postMessage("stop", '*')
    }
  }

  this.resetSelectedRange = function(){
    app.highlighter.forEach((highlighter, index, array) => { 
      array[index].position = app.matchedSelectPosition[index]
    })
  }
}

module.exports = Sequencer