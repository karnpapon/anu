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
    canvas.cursor.init()
    canvas.cursor.initCursor()
    canvas.resize()
  }

}


module.exports = Source