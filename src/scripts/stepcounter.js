'use strict'

/* global seeq */

function StepCounter(canvas) {
  this.isSelected = false
  this.counter = [{ x: 0, y: 0, y_counter: 0, i: null }]

  this.reset = function () {
    this.isSelected = false
    this.counter = [{ x: 0, y: 0, y_counter: 0, i: null }]
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
      canvas.highlighter.highlighters.forEach(value => {
        if (value.i === c.i) {
          c.isOverlap = canvas.isOverlapArea(c.x, c.y)
          if (!c.isOverlap) {
            if( c.x < (value.x) || c.y < (value.y)) {
              c.x = value.x + value.w - 1
              c.y = value.h > 1 ? value.y + c.y_counter % value.h : value.y
              c.y_counter++
              c.y_counter = c.y_counter % value.h
            }
          } else {
            rand = getRandomValue(canvas.highlighter.highlighters[canvas.highlighter.active].overlapAreas)
            if(rand && 'x' in rand) {
              c.x = rand.x < value.x || rand.x > value.x + value.w - 1 ? c.x-- : rand.x
            }
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
    } else {
      canvas.highlighter.highlighters.forEach(value => {
        if (value.i === c.i) {
          c.isOverlap = canvas.isOverlapArea(c.x, c.y)
          if (!c.isOverlap) {
            if (
              c.x > (value.x + value.w - 1) ||
              c.y > (value.y + value.h) ||
              value.x > c.x ||
              value.y > c.y
            ) {
              c.x = value.x
              c.y = value.h > 1 ? value.y + c.y_counter % value.h : value.y
              c.y_counter++
              c.y_counter = c.y_counter % value.h // wrapped to height since there's no needs to count up more than highlighter height.
            }
          } else {
            for (let ii of value.overlapIndex) {
              rand = getRandomValue(canvas.highlighter.highlighters[ii].overlapAreas)
              if(rand && 'x' in rand) {
                c.x = rand.x < value.x || rand.x > value.x + value.w - 1 ? c.x++ : rand.x
              }
            }

          }
        } 
      })
    }
  }

  this.increment = function (c) {
    if (seeq.console.isReverse) { return this.back(c) }
    this.forth(c)
  }

  this.range = function () {
    // canvas.highlighter.highlighters.forEach(cs => {
    //   canvas.seequencer.resetFrameToRange(cs)
    // })
    // canvas.seequencer.resetFrameToRange(canvas.highlighter.highlighters[canvas.highlighter.active])
  }

  function getRandomValue(collection) {
    let keys = Array.from(collection.keys());
    return  collection.get(keys[Math.floor(Math.random() * keys.length)]);
  }

  function clamp(v, min, max) { return v < min ? min : v > max ? max : v }
}
