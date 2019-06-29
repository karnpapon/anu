'use strict'

function StepCursor(canvas) {

  const { getRandomInt } = require('./lib/utils')

  this.steps = [ { x: 0, y: 0, i: 0 } ]
  this.duration = 0.25;
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
    canvas.stepcounter.counter.push({ x:0 ,y: 0, counter: 0, i: canvas.cursor.active})
    this.steps.push({ x: 0, y:0, i: canvas.cursor.active})
  }

  this.remove = function(){
    canvas.stepcounter.counter.pop({ x:0 ,y: 0, counter: 0})
    this.steps.pop()
  }

  this.erase = function(){
    this.steps.forEach( ( step,i,arr ) => { if(step.i !== this.active){ this.steps.splice(i,1)} } )
  }

  this.run = function () {
    let self = this
    this.steps.forEach( ( step, idx ) => {
      if (!canvas.clock.isPaused) {
        step.x = canvas.stepcounter.counter[idx].x
        step.y = canvas.stepcounter.counter[idx].y
        self.trigger(step)
      }
      canvas.drawSprite( step.x, step.y,canvas.seequencer.glyphAt(step.x, step.y),10)
    })
  }

  this.animate = function(time,el){

    var opacity = 100 * (this.opacityStep/this.opacitySteps);
    if(this.opacityStep >= this.opacitySteps-1){ opacity = 100; }

    const bgrect = { 
      x: el.x * canvas.scale * canvas.tile.w,
      y: el.y * canvas.scale * canvas.tile.h,
      w: el.w * canvas.scale * canvas.tile.w,
      h: el.h * canvas.scale * canvas.tile.h
    }

    // let block = canvas.cursor.getBlockByIndex(el.i)

    // block.forEach( c => {
    //   let g = canvas.seequencer.glyphAt(c.x, c.y)
    //   if(canvas.isCursor(c.x,c.y)){
    //     // start
       
    //   } else {
    //     canvas.drawSprite(c.x, c.y, g, 7)
    //   }
    // })

    canvas.context.globalAlpha = ( (100 - opacity)/100 );
    canvas.context.fillStyle = canvas.theme.active.b_med
    canvas.context.fillRect(bgrect.x, bgrect.y, bgrect.w, bgrect.h)
    
    // end
    canvas.context.globalAlpha = (opacity) / 100;
    canvas.context.fillStyle = canvas.theme.active.background
    canvas.context.fillRect(bgrect.x, bgrect.y, bgrect.w, bgrect.h)

    canvas.context.strokeStyle = canvas.theme.active.background
    canvas.context.strokeRect(bgrect.x, bgrect.y, bgrect.w, bgrect.h)
    canvas.drawSprite(el.x, el.y, "*", 0)
    
    
    // reset
    canvas.context.globalAlpha=1.00;

    // return if all steps have been played
    if(++this.opacityStep >= this.opacitySteps){return;}

    requestAnimationFrame(function(timestamp){ 
      canvas.stepcursor.animate(timestamp, el)
    })
  }

  this.trigger = function (step) {
    // this.offset =  Math.random() * 14.5
    if (this.isTrigger(step.x, step.y)) {
      this.oscOut()
      canvas.cursor.cursors.forEach( value => {
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