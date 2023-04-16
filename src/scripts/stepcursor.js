'use strict'

/* global client */

function StepCursor(canvas) {

  this.steps = [ { x: 0, y: 0, i: 0 } ]

  this.reset = function(){
    this.steps = [{ x: 0, y: 0, i: 0 }]
  }

  // this.isTrigger = function (x, y) {
  //   return canvas.p.some(pos => pos.x === x && pos.y === y)
  // }

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

  // this.triggerFX = function(time,el){
  //   let target  = canvas.marker.getSelectionArea(el)
  //   target.forEach( item => {
  //     let g = canvas.seequencer.glyphAt(item.x, item.y)
  //     if(!canvas.isMatchedChar(item.x,item.y) && !canvas.isMarker(item.x,item.y)){
  //       canvas.drawSprite(item.x, item.y, g, 0)
  //     }
  //   })
  // }

  function shouldPlay(item1,item2, isUnMuted) {
    return item1.x === item2.x && item1.y === item2.y && isUnMuted
  }

  this.trigger = function () {
    let value 
    this.steps.forEach( ( step ) => {
      if (!canvas.clock.isPaused) {
        canvas.marker.markers.forEach( ( marker, index) => {
          marker.matched.forEach( ( _c, matchedIdx ) => {
            if(shouldPlay(_c,step, !marker["control"]["muted"])){
              msgOut(step, matchedIdx)
              value = canvas.marker.markers[index]
              canvas.drawSprite(step.x, step.y, BANG_GLYPH, 2)
              // this.triggerFX(null, value)
            } 
          })
        })
      }
    })
  }

  function msgOut(step, i){
    let target = canvas.marker.markers.filter( cs => cs.i === step.i )
    const {
      channel,
      note,
      notelength,
      octave,
      velocity
    } = target[0].msg.MIDI

    const { formattedMsg } = target[0].msg.OSC
   
    let midiIndex = i % note.length
    let veloIndex = i % velocity.length
    let lenIndex = i % notelength.length

    if(client.console.isOSCToggled){
       // TODO: dynamic index only for OSC msg.
      canvas.io.osc.push('/' + target[0].msg.OSC.path, formattedMsg[midiIndex] )
    }

    if(client.console.isUDPToggled){
      canvas.io.udp.send( target[0].msg.UDP[midiIndex])
    }

    canvas.io.midi.push({ 
      channel: parseInt(channel) ,
      octave: octave[midiIndex], 
      note: note[midiIndex],
      velocity: velocity[veloIndex], 
      length: notelength[lenIndex]
    })

    canvas.io.run()
    canvas.io.clear()
  }
}