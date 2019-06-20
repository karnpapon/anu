'use strict'

const osc = require('node-osc')

function Osc (app) {
  this.stack = []
  this.port = null
  this.counter = 0

  // TODO make this configurable.
  this.options = { 
    default: 49162, 
    tidalCycles: 6010, 
    superCollider: 57120, 
    sonicPi: 4559 
  }

  this.start = function () {
    console.info('OSC', 'Starting..')
    this.setup()
    this.select()
  }

  this.clear = function () {
    this.stack = []
  }

  this.run = function () {
    for (const id in this.stack) {
      this.play(this.stack[id])
    }
  }

  this.send = function (path, msg) {
    this.stack.push({ path, msg })
  }

  this.play = function ({ path, msg }) {
    if (!this.client) { console.warn('OSC', 'Unavailable client'); return }
    if (!msg) { console.warn('OSC', 'Empty message'); return }
    const oscMsg = new osc.Message(path)
    var formattedMsg = this.formatter(msg)
    formattedMsg.forEach(( item, index ) => {
      Array.isArray(item) ?
      oscMsg.append(item[this.counter % item.length]):
      oscMsg.append(item)
    })
    this.counter++  // TODO: should reset after submit `send`
    this.client.send(oscMsg, (err) => {
      if (err) { console.warn(err) }
    })
  }

  this.formatter = function( msg ){
    var noBracketArr = msg.replace(/[\])}[{(]/g, ''); 
    var splittedArr = noBracketArr.split(" ")
    var formattedArr = []

    splittedArr.forEach(( item, index ) => {
      if (index == 1 || index == 3) {
        formattedArr.push(item.split(",") )
      } else {
        formattedArr.push(item)
      }
    })
    return formattedArr
  }

  this.select = function (port = this.options.superCollider) {
    if (parseInt(port) === this.port) { console.warn('OSC', 'Already selected'); return }
    if (isNaN(port) || port < 1000) { console.warn('OSC', 'Unavailable port'); return }
    console.info('OSC', `Selected port: ${port}`)
    this.port = parseInt(port)
    this.setup()
    // this.update()
  }

  this.setup = function () {
    if (!this.port) { return }
    if (this.client) { this.client.close() }
    this.client = new osc.Client(app.io.ip, this.port)
    console.info('OSC', 'Started client at ' + app.io.ip + ':' + this.port)
  }
}

module.exports = Osc