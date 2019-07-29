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
    let self = this
    this.steps.forEach( ( step, idx ) => {
      if (!canvas.clock.isPaused) {
        step.x = canvas.stepcounter.counter[idx].x
        step.y = canvas.stepcounter.counter[idx].y
        self.trigger(step)
      }
      canvas.drawSprite( step.x, step.y,this.isTrigger(step.x,step.y)? '*':canvas.seequencer.glyphAt(step.x, step.y),10)
    })
  }

  // this.animate2 = function(time, el){

  //   var opacity 
  //   opacity = 100 * (this.opacityStep/this.opacitySteps);
  //   if(this.opacityStep >= this.opacitySteps-1){ opacity = 100; }
  //   canvas.context.globalAlpha = ( (100 - opacity)/100 );

  //   const fgrect = { 
  //     x: (el.x + 0.5) * canvas.tile.w * canvas.scale, 
  //     y: (el.y + 1) * canvas.tile.h * canvas.scale, 
  //   } 

  //   // start.
  //   canvas.context.fillStyle = canvas.theme.active.background
  //   canvas.context.fillText(canvas.seequencer.glyphAt(el.x, el.y), fgrect.x, fgrect.y)

  //   // end.
  //   canvas.context.globalAlpha = (opacity) / 100;
  //   canvas.context.fillStyle = canvas.theme.active.background
  //   canvas.context.fillText(canvas.seequencer.glyphAt(el.x, el.y), fgrect.x, fgrect.y)

  //   // reset
  //   canvas.context.globalAlpha=1.00;

  //   // return if all steps have been played
  //   if(++this.opacityStep >= this.opacitySteps){return;}

  //   requestAnimationFrame(function(timestamp){ 
  //     canvas.stepcursor.animate2(timestamp, el)
  //   }) 

  // }

  this.animateSmooth = function(time,el){
   
    const bgrect = { 
      x: el.x * canvas.scale * canvas.tile.w,
      y: el.y * canvas.scale * canvas.tile.h,
      w: el.w * canvas.scale * canvas.tile.w,
      h: el.h * canvas.scale * canvas.tile.h
    }

    let target  = canvas.cursor.getSelectionArea(el)
    target.forEach( item => {
      let fgrect = { 
        x: (item.x + 0.5) * canvas.tile.w * canvas.scale, 
        y: (item.y + 1) * canvas.tile.h * canvas.scale, 
      }
      if(!canvas.isMatchedChar(item.x,item.y)){
        canvas.context.fillStyle = canvas.theme.active.background
        canvas.context.fillText(".", fgrect.x, fgrect.y)
      } else {
        canvas.context.fillStyle = canvas.theme.active.b_med
        canvas.context.fillRect(bgrect.x, bgrect.y, bgrect.w, bgrect.h)
        canvas.context.fillStyle = canvas.theme.active.f_high
        canvas.context.fillText("*", fgrect.x - 1, fgrect.y - 0.5)
      }
      
    })

    var opacity 
    opacity = 100 * (this.opacityStep/this.opacitySteps * 0.5);
    if(this.opacityStep >= this.opacitySteps-1){ opacity = 100; }
    canvas.context.globalAlpha = ( (100 - opacity)/100 );

    
    // end
    canvas.context.globalAlpha = (opacity) / 70;
    canvas.context.fillStyle = canvas.theme.active.background
    canvas.context.fillRect(bgrect.x, bgrect.y, bgrect.w, bgrect.h)
    canvas.context.strokeRect(bgrect.x, bgrect.y, bgrect.w, bgrect.h)
    // reset
    canvas.context.globalAlpha=1.00;

    // return if all steps have been played
    if(++this.opacityStep >= this.opacitySteps){return;}

    requestAnimationFrame(function(timestamp){ 
      canvas.stepcursor.animateSmooth(timestamp, el)
    })
  }

  this.animate = function(time,el){
   
    // const bgrect = { 
    //   x: el.x * canvas.scale * canvas.tile.w,
    //   y: el.y * canvas.scale * canvas.tile.h,
    //   w: el.w * canvas.scale * canvas.tile.w,
    //   h: el.h * canvas.scale * canvas.tile.h
    // }

    // canvas.context.fillStyle = canvas.theme.active.b_med
    // canvas.context.fillRect(bgrect.x, bgrect.y, bgrect.w, bgrect.h)
    

    // var opacity 
    // opacity = 100 * (this.opacityStep/this.opacitySteps);
    // if(this.opacityStep >= this.opacitySteps-1){ opacity = 100; }
    // canvas.context.globalAlpha = ( (100 - opacity)/100 );

    let target  = canvas.cursor.getSelectionArea(el)
    target.forEach( item => {
      let fgrect = { 
        x: (item.x + 0.5) * canvas.tile.w * canvas.scale, 
        y: (item.y + 1) * canvas.tile.h * canvas.scale, 
      }
      let g = canvas.seequencer.glyphAt(item.x, item.y)
      if(!canvas.isMatchedChar(item.x,item.y)){
        canvas.context.fillStyle = canvas.theme.active.background
        canvas.context.fillText(g, fgrect.x, fgrect.y)
      } 
      // else {
        // canvas.context.fillStyle = canvas.theme.active.background
        // canvas.context.fillRect(bgrect.x, bgrect.y, bgrect.w, bgrect.h)
        // canvas.context.fillStyle = canvas.theme.active.f_high
        // canvas.context.fillText("*", fgrect.x - 1, fgrect.y - 0.5)
      // }
      
    })

    
    // end
    // canvas.context.globalAlpha = (opacity) / 70;
    // canvas.context.fillStyle = canvas.theme.active.background
    // canvas.context.fillRect(bgrect.x, bgrect.y, bgrect.w, bgrect.h)
    // canvas.context.strokeRect(bgrect.x, bgrect.y, bgrect.w, bgrect.h)
    // reset
    // canvas.context.globalAlpha=1.00;

    // return if all steps have been played
    // if(++this.opacityStep >= this.opacitySteps){return;}

    // requestAnimationFrame(function(timestamp){ 
      // canvas.stepcursor.animate(timestamp, el)
    // })
  }

  this.trigger = function (step) {
    let i
    let value 

    canvas.cursor.cursors.forEach( ( c, index) => {
      c.matched.forEach( ( _c, _idx ) => {
        if(_c.x === step.x && _c.y === step.y && c.i === step.i){
          i=_idx
          this.msgOut(step, i)
          value = canvas.cursor.cursors[index]
          this.opacityStep = 0;
          this.animate(null, value)
        } 
      })
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