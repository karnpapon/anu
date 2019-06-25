function StepCounter(terminal){
  this.isSelected = false
  this.counter = [{ x: 0, y: 0, counter: 0, i: 0}]

  this.run = function () {
    this.setCounter()
  }
  
  this.setCounter = function(){
    let self = this
    this.counter.forEach( c => {
        self.increment(c)
    })
  }

  this.increment = function (c) {
    let activeCursor = terminal.cursor.cursors[terminal.cursor.active]
    if (!this.isSelected) {
      if (c.x % terminal.seequencer.w === 0 && c.x !== 0) {
        c.x = 0
        c.y++
      } else {
        c.x++
      }
    } else { // range cursor.
      if (
        c.x > (activeCursor.x + activeCursor.w - 2) || 
        c.y > (activeCursor.y + activeCursor.h) || 
        activeCursor.x > c.x || 
        activeCursor.y > c.y
      ) {
        c.x = activeCursor.x
        c.y = activeCursor.h > 1 ? activeCursor.y + c.counter % activeCursor.h : activeCursor.y
        c.counter++
      } else {
        c.x++
      }
    }
  }

  this.range = function () {
    terminal.cursor.cursors.forEach( cs => {
      terminal.seequencer.resetFrameToRange(cs)
    })
  }
    
  function clamp(v, min, max) { return v < min ? min : v > max ? max : v }
}
  
  
module.exports =StepCounter  