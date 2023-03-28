// 'use strict'

function Osc (app) {

  const osc = new OSC()
  
  const isEven = (x) => { return (x%2)==0; }
  const isOdd = (x) => { return !isEven(x); }

  this.stack = []
  this.port = null

  // TODO make this configurable.
  this.options = { 
    default: 49162, 
    tidalCycles: 6010, 
    superCollider: 57120, 
    sonicPi: 4559 
  }

  this.start = function () {
    if (!osc) { console.warn('OSC', 'Could not start.'); return }
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
    console.log("send osc", path, msg)
    this.stack.push({ path, msg })
  }
  
  this.play = function ({ path, msg }) {
    // if (!this.client) { console.warn('OSC', 'Unavailable client'); return }
    // if (!msg) { console.warn('OSC', 'Empty message'); return }
    const oscMsg = new OSC.Message('/test/random', 1)
    console.log("oscMsg", oscMsg)
    // oscMsg.append(msg.split(" "))
    osc.send(oscMsg)
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
    // this.client = new osc.Client(app.io.ip, this.port);
    // osc.open({ port: this.port });
    osc.open();
    console.info('OSC', 'Started client at ' + app.io.ip + ':' + this.port)
  }
}