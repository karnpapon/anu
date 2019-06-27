'use strict'

function StepCursor(terminal) {

  const { getRandomInt } = require('./utils')

  this.steps = [ { x: 0, y: 0, i: 0 } ]

  this.duration = 0.25;
  this.opacitySteps = parseInt(60*this.duration);
  this.opacityStep = 0;
  this.offset
  this.osc = {
    path: 'play2',
    // msg: `s dr n ${getRandomInt(0,22)}`
  }

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

    var opacity = 100 * (this.opacityStep/this.opacitySteps);
    if(this.opacityStep >= this.opacitySteps-1){ opacity = 100; }

    const bgrect = { 
      x: el.x * terminal.scale * terminal.tile.w,
      y: el.y * terminal.scale * terminal.tile.h,
      w: el.w * terminal.scale * terminal.tile.w,
      h: el.h * terminal.scale * terminal.tile.h
    }

    // let block = terminal.cursor.getBlockByIndex(el.i)

    // block.forEach( c => {
    //   let g = terminal.seequencer.glyphAt(c.x, c.y)
    //   if(terminal.isCursor(c.x,c.y)){
    //     // start
       
    //   } else {
    //     terminal.drawSprite(c.x, c.y, g, 7)
    //   }
    // })

    terminal.context.globalAlpha = ( (100 - opacity)/100 );
    terminal.context.fillStyle = terminal.theme.active.b_med
    terminal.context.fillRect(bgrect.x, bgrect.y, bgrect.w, bgrect.h)
    
    // end
    terminal.context.globalAlpha = (opacity) / 100;
    terminal.context.fillStyle = terminal.theme.active.background
    terminal.context.fillRect(bgrect.x, bgrect.y, bgrect.w, bgrect.h)

    terminal.context.strokeStyle = terminal.theme.active.background
    terminal.context.strokeRect(bgrect.x, bgrect.y, bgrect.w, bgrect.h)
    terminal.drawSprite(el.x, el.y, "*", 0)
    
    
    // reset
    terminal.context.globalAlpha=1.00;

    // return if all steps have been played
    if(++this.opacityStep >= this.opacitySteps){return;}

    requestAnimationFrame(function(timestamp){ 
      terminal.stepcursor.animate(timestamp, el)
    })
  }

  this.trigger = function (step) {
    // this.offset =  Math.random() * 14.5
    if (this.isTrigger(step.x, step.y)) {
      this.oscOut()
      terminal.cursor.cursors.forEach( value => {
        if( value.i === step.i){
          this.opacityStep = 0;
          this.animate(null, value)
        }
      })
    }
  }

  this.oscOut = function(){
    seeq.io.osc.send('/' + this.osc.path, `s amencutup n ${getRandomInt(0,32)}` )
    seeq.io.run()
    seeq.io.clear()
  }

  function display(str, f, max) { return str.length < max ? str : str.slice(f % str.length) + str.substr(0, f % str.length) }
 
}


module.exports = StepCursor