'use strict'


const MidiClock = require('./midiclock')

function Midi() {
  this.index = 0
  this.devices = []
  this.stack = []
  this.clock = new MidiClock(seeq)

  this.start = function () {
    console.info('Starting Midi..')
    this.setup()
    this.clock.start()
  }

  this.clear = function () {
    this.stack = []
  }

  this.run = function () {
    for (const id in this.stack) {
      this.set(this.stack[id], this.device())
    }
  }

  // this.noteOn = function () {
  //   for (const id in this.stack) {
  //     this.set(this.stack[id], this.device())
  //   }
  // }

  // this.noteOff = function(){
  //   for (const id in this.stack) {
  //     this.setOff(this.stack[id], this.device())
  //   }
  // }

  // Midi

  this.send = function ({ channel, octave, note, velocity, length }) {
    let noteNumber = []
    let convertedNote 
    // if( note.length > 1){
    //   note.forEach( item => {
    //     convertedNote = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'].indexOf( item )
    //     noteNumber.push(convertedNote)
    //   })
    // } else {
    //   noteNumber = 0
    // }

    console.log("channel", channel)

    convertedNote = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'].indexOf( note )

    let msg = Object.assign({}, { channel, octave, note: convertedNote, velocity, length })
    this.stack.push(msg)
  }

  this.set = function (data = this.stack, device) {
    const channel = convertChannel(data['channel'])
    const note = convertNote(data['octave'], data['note'])
    const velocity = data['velocity']
    const length = window.performance.now() + convertLength(data['length'], seeq.seq.bpm)

    if (!device) { console.warn('No midi device!'); return }
    device.send([channel[0], note, velocity]) 
    device.send([channel[1], note, velocity], length)
    // this.handleNoteOn(device.send([channel[0], note, velocity]))
  }

  // this.setOff = function (data = this.stack, device) {
  //   const channel = convertChannel(data['channel'])
  //   const note = convertNote(data['octave'], data['note'])
  //   const velocity = data['velocity']
  //   const length = window.performance.now() + convertLength(data['length'], seeq.seq.bpm)

  //   if (!device) { console.warn('No midi device!'); return }
  //   device.send([channel[1], note, velocity]) 
  //   // this.handleNoteOff(device.send([channel[1], note, velocity]) )
  // }
  
  // this.handleNoteOn = function( cb ){
  //   cb()
  //   console.log("note on >>>>")
  // }

  // this.handleNoteOff = function(cb){
  //   cb()
  //   console.log("note off >>>>")
  // }

  this.select = function (id) {
    if (!this.devices[id]) { return }
    this.index = parseInt(id)
    // this.update()
    console.log(`Midi Device: ${this.device().name}`)
    return this.device()
  }

  this.device = function () {
    return this.devices[this.index]
  }

  this.list = function () {
    return this.devices
  }

  this.next = function () {
    this.select((this.index + 1) % this.devices.length)
  }

  // Setup

  this.setup = function () {
    if (!navigator.requestMIDIAccess) { return }
    navigator.requestMIDIAccess({ sysex: false }).then(this.access, (err) => {
      console.warn('No Midi', err)
    })
  }

  this.access = function (midiAccess) {
    const iter = midiAccess.outputs.values()
    for (let i = iter.next(); i && !i.done; i = iter.next()) {
      seeq.midi.devices.push(i.value)
    }
    seeq.midi.select(0)
  }

  this.toString = function () {
    return this.devices.length > 0 ? `${this.devices[this.index].name}` : 'No Midi'
  }

  function convertChannel(id) {
    return [0x90 + id, 0x80 + id]
  }

  function convertNote(octave, note) {
    return 24 + (octave * 12) + note // 60 = C3
  }

  function convertLength(val, bpm) {
    // [ 1 = (1/16) ] ~> 
    // [ 8 = (8/16) or half bar ] ~> 
    // [ 16 = (16/16) or full bar. ]
    // return (60000 / bpm) * (val / 16)
    if (!bpm) {
      bpm = 120
    }
    return (60000 / bpm) * (val / 16)
  }

  function clamp(v, min, max) { return v < min ? min : v > max ? max : v }
}

module.exports = Midi
