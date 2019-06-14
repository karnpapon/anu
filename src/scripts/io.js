'use strict'

const Midi = require('./io.midi')
const Udp = require('./io.udp')
// const Osc = require('./io.osc')

function IO(app) {
  this.ip = '127.0.0.1'
  this.midi = new Midi(app)
  this.udp = new Udp(app)
  // this.osc = new Osc(app)

  this.start = function () {
    this.midi.start()
    this.udp.start()
    // this.osc.start()
    this.clear()
  }

  this.clear = function () {
    this.midi.clear()
    this.udp.clear()
    // this.osc.clear()
  }

  this.run = function () {
    this.midi.run()
    this.udp.run()
    // this.osc.run()
  }

  this.length = function () {
    // return this.midi.stack.length + this.udp.stack.length + this.osc.stack.length
    return this.midi.stack.length + this.udp.stack.length
  }

  this.setIp = function (addr = '127.0.0.1') {
    if (validateIP(addr) !== true) { console.warn('IO', 'Invalid IP'); return }
    this.ip = addr
    console.log('IO', 'Set target IP to ' + this.ip)
    // this.osc.setup()
  }

  function validateIP(addr) { return !!(/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(addr)) }
}

module.exports = IO
