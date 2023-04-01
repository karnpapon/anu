/* global seeq */

function StepCounter(canvas) {
  this.isSelected = false
  this.counter = [{ x: 0, y: 0, counter: 0, i: 0, capture: false }]

  this.reset = function () {
    this.isSelected = false
    this.counter = [{ x: 0, y: 0, counter: 0, i: 0, capture: false }]
  }

  this.run = function () {
    this.runCounter()
  }

  this.runCounter = function () {
    let self = this
    this.counter.forEach(c => {
      self.increment(c)
    })
  }

  this.back = function (c){
    let rand
    c.x--
    if (!this.isSelected) {
      if (c.x < 0) {
        if (c.y === 0) {
          c.x = canvas.seequencer.w
          c.y = canvas.seequencer.h - 1
        } else {
          c.x = canvas.seequencer.w
          c.y--
        }
      }
    } else {
      canvas.cursor.cursors.forEach(value => {
        if (value.i === c.i) {
          c.isOverlap = canvas.isSelectionOverlap(c.x, c.y)
          if (!c.isOverlap) {
            if (c.x < value.x) {
              if (c.y === value.y) {
                c.x = value.x + value.w - 1
                c.y = value.y + value.h - 1
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

    return
  }

  this.forth = function(c){
    let rand
    c.x++
    if (!this.isSelected) {
      if (c.x > canvas.seequencer.w) {
        if (c.y === canvas.seequencer.h - 1) {
          c.y = 0
          c.x = 0
        } else {
          c.x = 0
          c.y++
        }
      }
      // c.capture = false;
    } else {
      canvas.cursor.cursors.forEach(value => {
        if (value.i === canvas.cursor.active) {
          c.isOverlap = canvas.isSelectionOverlap(c.x, c.y)
          if (!c.isOverlap) {
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
            c.x = rand < value.x || rand > value.x + value.w - 1 ? c.x++ : rand
          }
          // c.i = canvas.cursor.active
          // c.capture = true
        }
      })
    }
  }

  this.increment = function (c) {
    if (seeq.console.isReverse) { return this.back(c) }
    this.forth(c)
  }

  this.range = function () {
    canvas.cursor.cursors.forEach(cs => {
      canvas.seequencer.resetFrameToRange(cs)
    })
    // canvas.seequencer.resetFrameToRange(canvas.cursor.cursors[canvas.cursor.active])
  }

  function clamp(v, min, max) { return v < min ? min : v > max ? max : v }
}
