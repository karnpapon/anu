'use strict'

/* global client */

function StepCursor(canvas) {

  this.steps = [ { x: 0, y: 0, i: 0 } ]

  this.reset = function(index = undefined){
    if (index) { this.steps[index] = { x: 0, y: 0, i: index }; return}
    this.steps = [{ x: 0, y: 0, i: 0 }]
  }

  this.add = function(){
    let marker = canvas.marker.markers[ canvas.marker.active ]
    canvas.stepcounter.counter.push({ x: marker.x ,y: marker.y , counter: 0, i: canvas.marker.active, y_counter: 0})
    this.steps.push({ x: 0, y:0, i: marker.i})
  }

  this.remove = function(){
    canvas.stepcounter.counter.pop({ x:0 ,y: 0, counter: 0})
    this.steps.pop()
  }

  this.draw = function () {
    this.steps.forEach( ( step, idx ) => {
      if (!canvas.clock.isPaused) {
        step.x = canvas.stepcounter.counter[idx].x
        step.y = canvas.stepcounter.counter[idx].y
      }
      canvas.drawSprite( step.x, step.y,canvas.seequencer.glyphAt(step.x, step.y),10)
    })
  }

  function shouldPlay(isMarkerContainStep, isUnMuted) {
    return isMarkerContainStep && isUnMuted
  }

  this.trigger = function () {
    if (!canvas.clock.isPaused) {
    this.steps.forEach( ( step ) => {
        canvas.marker.markers.forEach( ( marker, index) => {
          if(shouldPlay(marker.matched.has(`${step.x}:${step.y}`), !marker["control"]["muted"])){
            msgOut(marker, index)
            canvas.drawSprite(step.x, step.y, BANG_GLYPH, 2)
          } 
        })
      })
    }
  }

  function msgOut(marker, i){
    const {
      channel,
      note,
      notelength,
      octave,
      velocity
    } = marker.msg.MIDI
   
    let midiIndex = i % note.length
    let veloIndex = i % velocity.length
    let lenIndex = i % notelength.length

    
    if(client.console.isOSCToggled){
      const { OSC } = marker.msg
      canvas.io.osc.push('/' + OSC.path, OSC.formattedMsg[OSC.counter % OSC.formattedMsg.length] )
      OSC.counter += marker["control"]["reverse"]? -1 : 1
      OSC.counter = ((OSC.counter % OSC.formattedMsg.length) + OSC.formattedMsg.length) % OSC.formattedMsg.length
    }

    if(client.console.isUDPToggled){
      canvas.io.udp.send(marker.msg.UDP[midiIndex])
    }

    // canvas.io.midi.push({ 
    //   channel: parseInt(channel) ,
    //   octave: octave[midiIndex], 
    //   note: note[midiIndex],
    //   velocity: velocity[veloIndex], 
    //   length: notelength[lenIndex]
    // })

    canvas.io.run()
    canvas.io.clear()
  }
}