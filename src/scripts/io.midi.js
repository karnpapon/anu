'use strict'

/* global client */

// since tauri have no requestMidiAccess (in window.navigator) API.
// we need to manually implement from backend (see src-tauri/src/lib/midi.rs)
function Midi(app) {
  const { invoke } = window.__TAURI__;
  this.index = 0
  this.devices = []
  this.stack = []
  this.targetDevice = ""
  this.isClock = false
  this.ticks = []

  this.start = async function () {
    console.info('Setting up Midi..')
    await this.setup()
  }

  this.clear = function () {
    this.stack = this.stack.filter((item) => { return item })
  }

  this.run = function () {
    for (const id in this.stack) {
      const item = this.stack[id]
      if (item.isPlayed === false) {
        this.press(item)
      }
      if (item.length < 1) {
        this.release(item, id)
      } else {
        item.length--
      }
    }
  }

  this.silence = function () {
    for (const item of this.stack) {
      this.release(item)
    }
  }

  this.press = function (item) {
    if (!item) { return }
    this.trigger(item, true)
    item.isPlayed = true
  }

  this.release = function (item, id) {
    if (!item) { return }
    this.trigger(item, false)
    delete this.stack[id]
  }

  this.trigger = function (item, down) {
    if (!this.outputDevice()) { console.warn('MIDI', 'No midi output!'); return }
    const n = convertNote(item.octave, item.note)
    const channel = !isNaN(item.channel) ? parseInt(item.channel) : 0

    if (!n) { return }

    const c = down === true ? 0x90 + channel : 0x80 + channel
    const v = parseInt((item.velocity / 16) * 127)

    if (!n || c === 127) { return }

    invoke('plugin:midi|send_midi_out', { msg: [c, n, v] });
  }

  this.push = function ({ channel, octave, note, velocity, length }) {
    let convertedNote = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'].indexOf( note )
    let msg = Object.assign({}, { channel, octave, note: convertedNote, velocity, length, isPlayed: false })
    this.stack.push(msg)
  }

  this.allNotesOff = function () {
    if (!this.outputDevice()) { return }
    console.log('MIDI', 'All Notes Off')
    for (let chan = 0; chan < 16; chan++) {
      invoke('plugin:midi|send_midi_out', { msg: [0xB0 + chan, 123, 0] });
    }
  }

  this.outputDevice = function () {
    return this.targetDevice
  }

  this.list = async function () {
    return await invoke('plugin:midi|list_midi_connections')
  }

  this.setup = async function () {
    await invoke('plugin:midi|setup_midi_connection_list')
    this.targetDevice = await invoke('plugin:midi|setup_midi_out');
    client.console.midiInfo.innerText = this.targetDevice 
  }

  this.toString = function () {
    return this.devices.length > 0 ? `${this.devices[this.index].name}` : 'No Midi'
  }

  // https://ccrma.stanford.edu/~craig/articles/linuxmidi/misc/essenmidi.html
  this.sendClockStart = function () {
    if (!this.outputDevice()) { return }
    this.isClock = true
    // 0xFA = Start (Sys Realtime)
    invoke('plugin:midi|send_midi_out', { msg: [0xFA] });
    console.log('MIDI', 'MIDI Start Sent')
  }

  this.sendClockStop = function () {
    if (!this.outputDevice()) { return }
    this.isClock = false
    // 0xFC = Stop (Sys Realtime)
    invoke('plugin:midi|send_midi_out', { msg: [0xFC] });
    console.log('MIDI', 'MIDI Stop Sent')
  }

  this.sendClock = function () {
    if (!this.outputDevice()) { return }
    if (this.isClock !== true) { return }

    const bpm = canvas.clock.speed.value
    const frameTime = (60000 / bpm) / 4
    const frameFrag = frameTime / 6

    for (let id = 0; id < 6; id++) {
      if (this.ticks[id]) { clearTimeout(this.ticks[id]) }
      this.ticks[id] = setTimeout(() => { 
        // 0xF8 = Timing Clock (Sys Realtime)
        invoke('plugin:midi|send_midi_out', { msg: [0xF8] });
      }, parseInt(id) * frameFrag)
    }
  }

  function convertNote(octave, note) {
    return 24 + (octave * 12) + note // 60 = C3
  }

  // function convertLength(val, bpm) {
  //   // [ 1 = (1/16) ] ~> 
  //   // [ 8 = (8/16) or half bar ] ~> 
  //   // [ 16 = (16/16) or full bar. ]
  //   // return (60000 / bpm) * (val / 16)
  //   if (!bpm) {
  //     bpm = 120
  //   }
  //   return (60000 / bpm) * (val / 16)
  // }

  // function clamp(v, min, max) { return v < min ? min : v > max ? max : v }
}

