'use strict'

function StepCursor(terminal) {
  this.steps = [ { x: 0, y: 0, i: 0 } ]

  this.isTrigger = function (x, y) {
    return terminal.p.some(pos => pos.x === x && pos.y === y)
  }

  this.add = function(){
    terminal.stepcounter.counter.push({ x:0 ,y: 0, counter: 0, i: terminal.globalIdx})
    this.steps.push({ x: 0, y:0, i: terminal.globalIdx})
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

  this.trigger = function (step) {
    if (this.isTrigger(step.x, step.y)) {
      const b = terminal.cursor.getBlockByIndex(terminal.cursor.active)
      b.forEach(block => {
        terminal.drawSprite(block.x, block.y, "-", 2)
      })
    }
  }


  function display(str, f, max) { return str.length < max ? str : str.slice(f % str.length) + str.substr(0, f % str.length) }
 
}


module.exports = StepCursor