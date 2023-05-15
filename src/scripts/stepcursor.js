'use strict'

/* global client */

function StepCursor(canvas) {

  this.steps = [ { x: 0, y: 0, i: 0 } ]

  this.reset = function(index = undefined){
    if (index) { this.steps[index] = { x: 0, y: 0, i: index }; return}
    this.steps = [{ x: 0, y: 0, i: 0 }]
  }

  this.add = function(index){
    let marker = canvas.marker.markers[index]
    canvas.stepcounter.counter.push({ x: marker.x ,y: marker.y , counter: 0, i: index, y_counter: 0})
    this.steps.push({ x: 0, y:0, i: marker.i})
  }

  // this.remove = function(){
  //   canvas.stepcounter.counter.pop({ x:0 ,y: 0, counter: 0})
  //   this.steps.pop()
  // }

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
        canvas.marker.markers.forEach( ( marker) => {
          if(shouldPlay(marker.matched.has(`${step.x}:${step.y}`), !marker["control"]["muted"])){
            msgOut(marker)
          } 
        })
      })
    }
  }

  function msgOut(marker){
    
    if(client.console.isOSCToggled){
      const { OSC } = marker.msg
      canvas.io.osc.push('/' + OSC.path, OSC.formattedMsg[OSC.counter % OSC.formattedMsg.length], marker["control"]["noteRatio"], marker["control"]["isRatcheting"] )
      OSC.counter += marker["control"]["reverse"]? -1 : 1
      OSC.counter = ((OSC.counter % OSC.formattedMsg.length) + OSC.formattedMsg.length) % OSC.formattedMsg.length
    }

    // if(client.console.isUDPToggled){
    //   canvas.io.udp.send(marker.msg.UDP[midiIndex])
    // }


    if(client.console.isMIDIOutToggled){
      const { MIDI } = marker.msg
      const { channel, note, notelength, octave, velocity } = MIDI

      let midiIndex = MIDI.counter % note.length
      let veloIndex = MIDI.counter % velocity.length
      let lenIndex = MIDI.counter % notelength.length

      canvas.io.midi.push({ 
        channel: parseInt(channel) ,
        octave: octave[midiIndex], 
        note: note[midiIndex],
        velocity: parseInt(velocity[veloIndex]), 
        length: parseInt(notelength[lenIndex])
      })

      MIDI.counter += marker["control"]["reverse"]? -1 : 1
      MIDI.counter = ((MIDI.counter % MIDI.note.length) + MIDI.note.length) % MIDI.note.length
    }
  }
}