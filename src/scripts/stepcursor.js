'use strict'

function StepCursor(terminal) {
  this.steps = [ { x: 0, y: 0, i: 0 } ]

  var duration = 0.25;
  var opacitySteps = parseInt(60*duration);
  var opacityStep = 0;

  this.isTrigger = function (x, y) {
    return terminal.p.some(pos => pos.x === x && pos.y === y)
  }

  this.add = function(){
    terminal.stepcounter.counter.push({ x:0 ,y: 0, counter: 0, i: terminal.cursor.active})
    this.steps.push({ x: 0, y:0, i: terminal.cursor.active})
  }

  this.remove = function(){
    terminal.stepcounter.counter.pop({ x:0 ,y: 0, counter: 0})
    this.steps.pop()
  }

  this.run = function () {
    let self = this
    this.steps.forEach( ( step, idx ) => {
      if (!terminal.clock.isPaused) {
        step.x = terminal.stepcounter.counter[idx].x
        step.y = terminal.stepcounter.counter[idx].y
        self.trigger(step)
      }
      terminal.drawSprite( step.x, step.y,terminal.seequencer.glyphAt(step.x, step.y),10)
    })
  }

  this.animate = function(time,el){

    var opacity=100*(opacityStep/opacitySteps);
    if(opacityStep >= opacitySteps-1){ opacity = 100; }

    const bgrect = { 
      x: el.x * terminal.scale * terminal.tile.w,
      y: el.y * terminal.scale * terminal.tile.h,
      w: el.w * terminal.scale * terminal.tile.w,
      h: el.h * terminal.scale * terminal.tile.h
    }

    // start
    terminal.context.globalAlpha = (100 - opacity)/100;
    terminal.context.fillStyle = terminal.theme.active.b_med
    terminal.context.fillRect(bgrect.x, bgrect.y, bgrect.w, bgrect.h)
    
    // end
    terminal.context.globalAlpha = (opacity) / 100;
    terminal.context.fillStyle = terminal.theme.active.background
    terminal.context.fillRect(bgrect.x, bgrect.y, bgrect.w, bgrect.h)

    terminal.context.strokeStyle = terminal.theme.active.background
    terminal.context.strokeRect(bgrect.x, bgrect.y, bgrect.w, bgrect.h)

    terminal.context.fillStyle = terminal.theme.active.f_high 
    terminal.drawSprite(el.x, el.y, "*", 0)
    // reset
    terminal.context.globalAlpha=1.00;

    // return if all steps have been played
    if(++opacityStep >= opacitySteps){return;}

    requestAnimationFrame(function(timestamp){ 
      terminal.stepcursor.animate(timestamp, el)
    })
  }

  this.trigger = function (step) {
    if (this.isTrigger(step.x, step.y)) {
      terminal.cursor.cursors.forEach( value => {
        if( value.i === step.i){
          opacityStep = 0;
          this.animate(null, value)
        }
      })
    }
  }

  function display(str, f, max) { return str.length < max ? str : str.slice(f % str.length) + str.substr(0, f % str.length) }
 
}


module.exports = StepCursor