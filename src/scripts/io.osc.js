// 'use strict'

/* global OSC */

function Osc (app) {
  const isEven = (x) => { return (x%2)==0; }
  const isOdd = (x) => { return !isEven(x); }

  this.stack = []
  this.socket = new OSC() // osc-js
  this.port = null

  // TODO make this configurable.
  this.options = { 
    default: 49162, 
    tidalCycles: 6010, 
    superCollider: 57120, 
    sonicPi: 4559 
  }

  this.start = function () {
    if (!this.socket) { console.warn('OSC', 'Could not setting up.'); return }
    console.info('OSC', 'Setting Up..')
    this.setup()
    // this.select()
  }

  this.clear = function () {
    this.stack = []
  }

  this.run = function () {
    for (const item of this.stack) {
      this.play(item)
    }
  }

  this.close = function(){
    if(this.socket){
      this.socket.close()
    }
  }

  this.push = function (path, msg) {
    this.stack.push({ path, msg })
  }
  
  this.play = function ({ path, msg }) {
    if (!this.socket) { console.warn('OSC', 'Unavailable socket'); return }
    if (!msg) { console.warn('OSC', 'Empty message'); return }
    const oscMsg = new OSC.Message(path, msg)
    this.socket.send(oscMsg)
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
    // this.setup()
  }

  // setup will be enabled when click osc button.
  this.setup = function () {
    if (!this.port) { return }
    if (this.socket.status() === OSC.IS_CONNECTING) { this.socket.close() }
    this.socket.open(); // connect to osc bridge(pkg-scripts/index.js) default port 8080.
    console.info('OSC', 'Started client at :' + this.port)
  }
}