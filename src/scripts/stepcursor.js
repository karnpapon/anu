'use strict'

function StepCursor(canvas) {

  this.steps = [ { x: 0, y: 0, i: 0 } ]
  this.duration = 0.125;
  this.opacitySteps = parseInt(60*this.duration);
  this.opacityStep = 0;
  this.offset
  this.osc = {
    path: 'play2',
    // msg: `s dr n ${getRandomInt(0,22)}`
  }

  this.reset = function(){
    this.steps = [{ x: 0, y: 0, i: 0 }]
    this.duration = 0.25;
    this.opacitySteps = parseInt(60 * this.duration);
    this.opacityStep = 0;
    this.offset
    this.osc = {
      path: 'play2',
      // msg: `s dr n ${getRandomInt(0,22)}`
    }
  }

  this.isTrigger = function (x, y) {
    return canvas.p.some(pos => pos.x === x && pos.y === y)
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

  this.animate = function(time,el){
   
    var opacity 
    opacity = 100 * (this.opacityStep/this.opacitySteps * 0.25);
    if(this.opacityStep >= this.opacitySteps-1){ opacity = 100; }
    canvas.context.globalAlpha = ( (100 - opacity)/100 );

    const bgrect = { 
      x: el.x * canvas.scale * canvas.tile.w,
      y: el.y * canvas.scale * canvas.tile.h,
      w: el.w * canvas.scale * canvas.tile.w,
      h: el.h * canvas.scale * canvas.tile.h
    }

    let target  = canvas.cursor.getSelectionArea(el)
    target.forEach( item => {
      const fgrect = { 
        x: (item.x + 0.5) * canvas.tile.w * canvas.scale, 
        y: (item.y + 1) * canvas.tile.h * canvas.scale, 
      }
      if(!canvas.isMatchedChar(item.x,item.y)){
        canvas.context.fillStyle = canvas.theme.active.background
        canvas.context.fillText(".", fgrect.x, fgrect.y)
      } else {
        canvas.context.fillStyle = canvas.theme.active.b_med
        canvas.context.fillRect(bgrect.x, bgrect.y, bgrect.w, bgrect.h)
      }
      
    })
    
    // end
    canvas.context.globalAlpha = (opacity) / 100;
    canvas.context.fillStyle = canvas.theme.active.background
    canvas.context.fillRect(bgrect.x, bgrect.y, bgrect.w, bgrect.h)
    canvas.context.strokeRect(bgrect.x, bgrect.y, bgrect.w, bgrect.h)
    // reset
    canvas.context.globalAlpha=1.00;

    // return if all steps have been played
    if(++this.opacityStep >= this.opacitySteps){return;}

    requestAnimationFrame(function(timestamp){ 
      canvas.stepcursor.animate(timestamp, el)
    })
  }

  this.trigger = function (step) {
    if (this.isTrigger(step.x, step.y)) {
      this.oscOut(step)
      canvas.cursor.cursors.forEach( value => {
        if( value.i === step.i ){
          this.opacityStep = 0;
          this.animate(null, value)
        }
      })
     
    }
  }

  this.oscOut = function(step){
    let target = canvas.cursor.cursors.filter( cs => cs.i === step.i )
    seeq.io.osc.send('/' + target[0].msg.OSC.path, target[0].msg.OSC.msg )
    seeq.io.run()
    seeq.io.clear()
  }
}


module.exports = StepCursor