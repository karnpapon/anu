'use strict'

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
    // return canvas.p.some(pos => pos.x === x && pos.y === y)
  }

  this.add = function(){
    let cursor = canvas.cursor.cursors[ canvas.cursor.active ]
    canvas.stepcounter.counter.push({ x: cursor.x ,y: cursor.y , counter: 0, i: cursor.i})
    this.steps.push({ x: 0, y:0, i: cursor.i})
  }

  this.remove = function(){
    canvas.stepcounter.counter.pop({ x:0 ,y: 0, counter: 0})
    this.steps.pop()
  }

  this.run = function () {
    this.steps.forEach( ( step, idx ) => {
      if (!canvas.clock.isPaused) {
        step.x = canvas.stepcounter.counter[idx].x
        step.y = canvas.stepcounter.counter[idx].y
      }
      canvas.drawSprite( step.x, step.y,this.isTrigger(step.x,step.y)? '*':canvas.seequencer.glyphAt(step.x, step.y),10)
    })
  }

  this.triggerFX = function(time,el){

    let target  = canvas.cursor.getSelectionArea(el)
    target.forEach( item => {
      let g = canvas.seequencer.glyphAt(item.x, item.y)
      if(!canvas.isMatchedChar(item.x,item.y) && !canvas.isCursor(item.x,item.y)){
        // canvas.context.font = `${canvas.tile.h * 0.75 * canvas.scale}px input_mono_thin` 
        canvas.drawSprite(item.x, item.y, g, 0)
      }
    })
  }

  this.trigger = function () {
    let i
    let value 

    this.steps.forEach( ( step, idx ) => {

      if (!canvas.clock.isPaused) {
        canvas.cursor.cursors.forEach( ( c, index) => {
          c.matched.forEach( ( _c, _idx ) => {
            if(_c.x === step.x && _c.y === step.y && c.i === step.i){
              i=_idx
              this.msgOut(step, i)
              value = canvas.cursor.cursors[index]
              canvas.drawSprite(step.x, step.y, '＊', 2)
              this.triggerFX(null, value)
            } 
          })
        })
      }
    })
  }

  this.findAndTrigger = function(){
    this.steps.forEach( step => {
      canvas.isMatchedChar( step.x,step.y)
    }) 
  }

  this.msgOut = function(step, i){
    let target = canvas.cursor.cursors.filter( cs => cs.i === step.i )
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
      seeq.io.osc.send('/' + target[0].msg.OSC.path, formattedMsg[midiIndex] )
    }

    if(seeq.console.isUDPToggled){
      seeq.io.udp.send( target[0].msg.UDP[midiIndex])
    }

    seeq.io.midi.send({ 
      channel: parseInt(channel) ,
      octave: octave[midiIndex], 
      note: note[midiIndex],
      velocity: velocity[veloIndex], 
      length: notelength[lenIndex] 
    })

    seeq.io.run()
    seeq.io.clear()
  }
}


module.exports = StepCursor