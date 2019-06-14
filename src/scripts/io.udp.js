'use strict'

const dgram = require('dgram')

function UDP(app) {
  this.stack = []
  this.port = null
  this.options = { default: 49161 }

  this.start = function () {
    console.info('UDP Starting..')
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

  this.send = function (msg) {
    this.stack.push(msg)
  }

  this.play = function (data) {
    this.server.send(Buffer.from(`${data}`), this.port, app.io.ip, (err) => {
      if (err) { console.warn(err) }
    })
  }

  this.select = function (port = this.options.default) {
    if (parseInt(port) === this.port) { console.warn('UDP', 'Already selected'); return }
    if (isNaN(port) || port < 1000) { console.warn('UDP', 'Unavailable port'); return }
    console.info('UDP', `Selected port: ${port}`)
    this.port = parseInt(port)
    // this.update()
  }

  // this.update = function () {
  //   app.controller.clearCat('default', 'UDP')
  //   for (const id in this.options) {
  //     app.controller.add('default', 'UDP', `${id.charAt(0).toUpperCase() + id.substr(1)}(${this.options[id]}) ${this.port === this.options[id] ? ' — Active' : ''}`, () => { app.io.udp.select(this.options[id]) }, '')
  //   }
  //   app.controller.commit()
  // }

  this.server = dgram.createSocket('udp4')
  this.listener = dgram.createSocket('udp4')

  // Input

  this.listener.on('message', (msg, rinfo) => {
    // app.commander.trigger(`${msg}`, false)
  })

  this.listener.on('listening', () => {
    const address = this.listener.address()
    console.log(`UDP Listening: ${address.address}:${address.port}`)
  })

  this.listener.on('error', (err) => {
    console.warn(`Server error:\n ${err.stack}`)
    this.listener.close()
  })


  // Ableton Connection.
  socket.on('beat', function (data) {
    const { beat, bpm } = data

    // set clock source from Ableton.
    if (beat % 4 == 0 && bpm != app.clock().getBpm()) {
      app.clock().setBpm(bpm)
    }

    if (beat % 4 == 0 && !app.isPlaying && app.isLinkToggle) {
      app.play()
      app.metronome.play()
    }
  });

  this.listener.bind(49160)
}


module.exports = UDP