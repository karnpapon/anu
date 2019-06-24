'use strict'

function StepCursor(terminal) {
  // Settings
  this.p = []
  this.prevRegExInput = ""
  this.isStepRun = false
  this.isSelected = false
  this.stepCursor = [ { x: 0, y: 0, counter: 0 } ]
 

  this.isTrigger = function (x, y) {
    return terminal.p.some(pos => pos.x === x && pos.y === y)
  }

  this.add = function(){
    this.stepCursor.push({ x: 0, y:0, counter: 0})
  }

  this.remove = function(){
    this.stepCursor.pop()
  }

  // Canvas
  this.run = function () {
    let self = this
    this.stepCursor.forEach( c => {
      self.isStepRun = !terminal.clock.isPaused
      if (self.isStepRun) {
        !terminal.clock.isPaused? self.stepCursorBoundary(c):""
        terminal.drawSprite( c.x, c.y,terminal.seequencer.glyphAt(c.x, c.y),10)
        self.trigger(c)
      }
    })
  }

  this.trigger = function (c) {
    if (this.isTrigger(c.x, c.y)) {
      const b = terminal.cursor.getBlock()
      b.forEach(block => {
        terminal.drawSprite(block.x, block.y, "", 10)
      })
    }
  }

  this.stepCursorBoundary = function (c) {
    let activeCursor = terminal.cursor.cursors[terminal.cursor.active]
    // global cursor
    if (!this.isSelected) {
      if (c.x % terminal.seequencer.w === 0 && c.x !== 0) {
        c.x = 0
        c.y++
      } else {
        c.x++
      }
    } else { // range cursor.
      if (c.x > (activeCursor.x + activeCursor.w - 2) || c.y > (activeCursor.y + activeCursor.h) || activeCursor.x > c.x || activeCursor.y > c.y) {
        c.x = activeCursor.x
        c.y = activeCursor.h > 1 ? activeCursor.y + c.counter % activeCursor.h : activeCursor.y
        c.counter++
      } else {
        c.x++
      }
    }
  }

  this.stepCursorBoundaryRange = function () {
    let activeCursor = terminal.cursor.cursors[terminal.cursor.active]
    terminal.seequencer.resetFrameToRange(activeCursor)
    this.stepCursor.x = activeCursor.x - 1
    this.stepCursor.y = activeCursor.y
  }


  function display(str, f, max) { return str.length < max ? str : str.slice(f % str.length) + str.substr(0, f % str.length) }
  function clamp(v, min, max) { return v < min ? min : v > max ? max : v }
}


module.exports = StepCursor