'use strict'

/* global seeq */

function StepCursor(canvas) {

  this.steps = [ { x: 0, y: 0, i: 0 } ]
  this.duration = 0.125;
  this.opacitySteps = parseInt(60*this.duration);
  this.opacityStep = 0;
  this.offset

  this.reset = function(){
    this.steps = [{ x: 0, y: 0, i: 0 }]
    this.duration = 0.25;
    this.opacitySteps = parseInt(60 * this.duration);
    this.opacityStep = 0;
    this.offset
  }

  this.isTrigger = function (x, y) {
    return canvas.p.some(pos => pos.x === x && pos.y === y)
  }

  this.add = function(){
    let highlighter = canvas.highlighter.highlighters[ canvas.highlighter.active ]
    canvas.stepcounter.counter.push({ x: highlighter.x ,y: highlighter.y , counter: 0, i: canvas.highlighter.active, y_counter: 0})
    this.steps.push({ x: 0, y:0, i: highlighter.i})
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

  this.triggerFX = function(time,el){
    let target  = canvas.highlighter.getSelectionArea(el)
    target.forEach( item => {
      let g = canvas.seequencer.glyphAt(item.x, item.y)
      if(!canvas.isMatchedChar(item.x,item.y) && !canvas.isHighlighter(item.x,item.y)){
        canvas.drawSprite(item.x, item.y, g, 0)
      }
    })
  }

  this.trigger = function () {
    let i
    let value 

    this.steps.forEach( ( step ) => {
      if (!canvas.clock.isPaused) {
        canvas.highlighter.highlighters.forEach( ( c, index) => {
          c.matched.forEach( ( _c, _idx ) => {
            if(_c.x === step.x && _c.y === step.y && c.i === step.i){
              i=_idx
              this.msgOut(step, i)
              value = canvas.highlighter.highlighters[index]
              canvas.drawSprite(step.x, step.y, '＊', 2)
              this.triggerFX(null, value)
            } 
          })
        })
      }
    })
  }

  this.msgOut = function(step, i){
    let target = canvas.highlighter.highlighters.filter( cs => cs.i === step.i )
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

    if(seeq.console.isOSCToggled){
       // TODO: dynamic index only for OSC msg.
      canvas.io.osc.push('/' + target[0].msg.OSC.path, formattedMsg[midiIndex] )
    }

    if(seeq.console.isUDPToggled){
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