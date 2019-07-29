function StepCounter(canvas){
  this.isSelected = false
  this.counter = [{ x: 0, y: 0, counter: 0, i: 0}]

  this.reset = function(){
    this.isSelected = false
    this.counter = [{ x: 0, y: 0, counter: 0, i: 0 }] 
  }

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
    let rand
    if( !seeq.console.isReverse){
      c.x++
      if (!this.isSelected) {
        if (c.x > canvas.seequencer.w) {
          if(c.y === canvas.seequencer.h - 1){
            c.y = 0
            c.x = 0
          } else {
            c.x = 0
            c.y++
          }
        } 
      } else { 
        canvas.cursor.cursors.forEach( value => {
          if( value.i === c.i){
            c.isOverlap = canvas.isSelectionOverlap(c.x, c.y)? true:false
            if(!c.isOverlap){
              if (
                c.x > (value.x + value.w - 1) || 
                c.y > (value.y + value.h) || 
                value.x > c.x || 
                value.y > c.y
              ) {
                c.x = value.x 
                c.y = value.h > 1 ? value.y + c.counter % value.h : value.y
                c.counter++
              }
            } else {
              rand = canvas.bufferPos[Math.floor(Math.random() * canvas.bufferPos.length)].x
              c.x = rand < value.x || rand > value.x + value.w - 1 ? c.x++:rand
            }

          }
        })
      }
    } 
    else {
      c.x--
      if (!this.isSelected) {
        if (c.x < 0) {
          if(c.y === 0){
            c.x = canvas.seequencer.w
            c.y = canvas.seequencer.h - 1
          } else {
            c.x = canvas.seequencer.w
            c.y--
          }
        }
      } else { 
        canvas.cursor.cursors.forEach( value => {
          if( value.i === c.i){
            c.isOverlap = canvas.isSelectionOverlap(c.x, c.y) ? true : false
            if (!c.isOverlap) {
              if (c.x < value.x) {
                if(c.y === value.y){
                  c.x = value.x + value.w - 1
                  c.y =  value.y + value.h - 1
                } else {
                  c.x = value.x + value.w - 1
                  c.y--
                }
              } 
            } else {
              rand = canvas.bufferPos[Math.floor(Math.random() * canvas.bufferPos.length)].x
              c.x = rand < value.x || rand > value.x + value.w - 1 ? c.x-- : rand
            }
          }
        })
      }
    }
  }

  this.range = function () {
    canvas.cursor.cursors.forEach( cs => {
      canvas.seequencer.resetFrameToRange(cs)
    })
  }
    
  function clamp(v, min, max) { return v < min ? min : v > max ? max : v }
}
  
  
module.exports =StepCounter  