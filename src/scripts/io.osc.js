'use strict'

const osc = require('node-osc')

function Osc (app) {
  this.stack = []
  this.port = null

  const { isOdd } = require('./lib/utils')

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
    // console.log("this.stack", msg)
    const oscMsg = new osc.Message(path)
    oscMsg.append(msg.split(" "))
    this.client.send(oscMsg, (err) => {
      if (err) { console.warn(err) }
    })
  }

  this.formatter = function( msg ){
    var noBracket = msg.replace(/[\])}[{(]/g, ''); 
    var splitted = noBracket.split(" ")
    var formatted = []
    
    splitted.forEach(( item, index ) => {
      if (isOdd(index)) {
        formatted.push(item.split(",") )
      } else {
        formatted.push(item)
      }
    })
    return formatted
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