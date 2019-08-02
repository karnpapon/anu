'use strict'

function Source (canvas) {
  const fs = require('fs')
  const path = require('path')
  const { dialog, app } = require('electron').remote

  this.path = null
  this.queue = []

  this.start = function () {
    // this.increment()
    this.new()
  }

  this.new = function () {
    this.path = null
    this.queue = []
    canvas.seequencer.reset()
    canvas.resize()
    // canvas.history.reset()
    canvas.cursor.reset(true)
    // canvas.clock.play()
  }

  this.run = function () {
    // if (!this.queue || this.queue.length < canvas.seequencer.f || !this.queue[canvas.seequencer.f]) { return }
    // canvas.commander.trigger(this.queue[canvas.seequencer.f])
  }
}


module.exports = Source