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
    if (!this.isSelected) {
      if (c.x % terminal.seequencer.w === 0 && c.x !== 0) {
        c.x = 0
        if(c.y % terminal.seequencer.h === 0 && c.y !== 0){
          c.y = 0
        } else {
          c.y++
        }
      } 
    } else { // range cursor.
      terminal.cursor.cursors.forEach( value => {
        if( value.i === c.i){
          if (
            c.x > (value.x + value.w - 2) || 
            c.y > (value.y + value.h) || 
            value.x > c.x || 
            value.y > c.y
          ) {
            c.x = value.x - 1
            c.y = value.h > 1 ? value.y + c.counter % value.h : value.y
            c.counter++
          }
        }
      })
    }
    c.x++
  }

  this.range = function () {
    terminal.cursor.cursors.forEach( cs => {
      terminal.seequencer.resetFrameToRange(cs)
    })
  }
    
  function clamp(v, min, max) { return v < min ? min : v > max ? max : v }
}
  
  
module.exports =StepCounter  