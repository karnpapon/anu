'use strict'

function Source (canvas) {
  this.path = null
  this.queue = []

  this.start = function () {
    this.new()
  }

  this.new = function () {
    this.path = null
    this.queue = []
    canvas.seequencer.reset()
    canvas.marker.init()
    canvas.marker.initCursor()
    canvas.resize()
  }

}