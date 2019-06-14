'use strict'

class Cursor {
  constructor() {
    this.position = 0,
    this.isCursorOffsetReverse = false,
    this.isMuted = false,
    this.isRetrigger = false,
    this.up = 0,
    this.down = 0,
    this.note = ["C"],
    this.length = 16,
    this.velocity = 100,
    this.octave = "3",
    this.counter = 0,
    this.channel = 0,
    this.reverse = false
  }

  retrieveCursor() {
    let reset = [{
      position: 0,
      isCursorOffsetReverse: false,
      isMuted: false,
      isRetrigger: false,
      up: 0,
      down: 0,
      note: ["C"],
      length: 16,
      velocity: 100,
      octave: "3",
      counter: 0,
      channel: 0,
      reverse: false
    }]
    return reset
  }

  addSequencer = function () {
  this.cursor.push({
    position: this.startPos,
    isCursorOffsetReverse: false,
    isMuted: false,
    isRetrigger: false,
    up: 0,
    down: 0,
    note: ["C"],
    length: 16,
    velocity: 100,
    octave: "3",
    counter: 0,
    channel: 0,
    reverse: false
  })
  this.sortingIndex()
}
}

module.exports = Cursor