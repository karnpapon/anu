'use strict'

function IO(app) {
  this.ip = '127.0.0.1'
  this.midi = new Midi(app)
  this.osc = new Osc(app)
  // this.udp = new UDP(app)
  const { invoke } = window.__TAURI__;

  this.start = function () {
    this.clear()

    // const navigationType = window.performance.getEntriesByType('navigation')[0];
    // invoke("get_osc_menu_state")
    // if (navigationType === "reload") {
    //   console.info("window.performance works fine on this browser", navigationType);
    // }

    this.midi.start()
    this.osc.start()
    // this.udp.start()
  }

  this.clear = function () {
    this.midi.clear()
    this.osc.clear()
    // this.udp.clear()
  }

  this.run = function () {
    this.midi.run()
    this.osc.run()
    // this.udp.run()
  }

  this.length = function () {
    return this.midi.stack.length + this.osc.stack.length
    // return this.midi.stack.length + this.udp.stack.length + this.osc.stack.length
  }

  this.setIp = function (addr = '127.0.0.1') {
    if (validateIP(addr) !== true) { console.warn('IO', 'Invalid IP'); return }
    this.ip = addr
    console.log('IO', 'Set target IP to ' + this.ip)
  }

  function validateIP(addr) { return !!(/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(addr)) }
}
