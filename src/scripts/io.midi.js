'use strict'

// since tauri have no requestMidiAccess (in window.navigator) API.
// we need to manually implement from backend (see src-tauri/src/lib/midi.rs)
function Midi(app) {
  // const MidiClock = require('./midiclock')
  this.index = 0
  this.devices = []
  this.stack = []
  this.targetDevice = ""
  // this.clock = new MidiClock(seeq)

  this.start = async function () {
    console.info('Starting Midi..')
    await this.setup()
    // this.clock.start()
  }

  this.clear = function () {
    this.stack = []
  }

  this.run = function () {
    for (const id in this.stack) {
      this.set(this.stack[id], this.device())
    }
  }

  this.send = function ({ channel, octave, note, velocity, length }) {
    let noteNumber = []
    let convertedNote 
    convertedNote = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'].indexOf( note )
    
    let msg = Object.assign({}, { channel, octave, note: convertedNote, velocity, length })
    this.stack.push(msg)
  }

  this.set = function (data = this.stack, device) {
    const { invoke } = window.__TAURI__;
    // const channel = convertChannel(data['channel'])
    const note = convertNote(data['octave'], data['note'])
    const velocity = data['velocity'] > 127 || data['velocity'] < 0 ? 60: data['velocity']
    const length = window.performance.now() + convertLength(data['length'], canvas.clock.speed.value)

    if (!device) { console.warn('No midi device!'); return }
    console.log("send", [data['channel'], note, velocity])
    invoke('send_midi_out', { msg: [data['channel'], note, velocity], length });
  }

  this.device = function () {
    return this.targetDevice
  }

  this.list = async function () {
    return await invoke('list_midi_connections')
  }

  this.setup = async function () {
    const { invoke } = window.__TAURI__;
    await invoke('init_midi');
    await invoke('setup_midi_connection_list')
    this.targetDevice = await invoke('setup_midi_out');
    app.console.midiInfo.innerText = this.targetDevice 
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

