'use strict'

/* global metronome, window, canvas, client */

// TODO: clean up unused since the clock is handled by metronome.js
function Clock(canvas) {
  this.bpm = 0
  this.callback = () => { }
  this.timer = null
  this.isPaused = true
  this.speed = { value: 120, target: 120 }

  this.setCallback = function(callback) {
    this.callback = callback
  }

  this.canSetBpm = function() {
    return true
  }

  this.getBpm = function(){
    return this.timer
  }

  this.run = function() {
    if (this.speed.target === this.speed.value) { return }
    this.set(this.speed.value + (this.speed.value < this.speed.target ? 1 : -1), null, true)
  }

  this.reset = function() {
    this.isPaused = true
    console.log('Clock', 'Stop')
    this.clearTimer()
    this.resetFrame()
    this.start()
  }

  this.togglePlay = function(msg = false) {
    if (this.isPaused === true) {
      this.play(msg)
    } else {
      this.stop()
    }
  }

  this.start = function() {
    this.setTimer(120)
    // this.play()
  }

  this.setSpeed = (value, target = null, setTimer = false) => {
    if (this.speed.value === value && this.speed.target === target && this.timer) { return }
    if (value) { this.speed.value = clamp(value, 60, 300) }
    if (target) { this.speed.target = clamp(target, 60, 300) }
    if (setTimer === true) { this.setTimer(this.speed.value) }
  }

  this.play = function (msg = false, midiStart = false) {
    console.log('Clock', 'Play')
    if (this.isPaused === false && !midiStart) { return }
    this.isPaused = false
    if (msg === true) { canvas.io.midi.sendClockStart() }
    this.setSpeed(this.speed.target, this.speed.target, true)
    metronome.play()
  }

  this.stop = function (msg = false) {
    console.log('Clock', 'Stop')
    if (this.isPaused === true) { return }
    this.isPaused = true
    if (msg === true || canvas.io.midi.isClock) { canvas.io.midi.sendClockStop() }
    this.clearTimer()
    canvas.io.midi.allNotesOff()
    canvas.io.midi.silence()
    metronome.stop()
  }

  this.set = function(value, target = null, setTimer = false) {
    if (value) { this.speed.value = clamp(value, 60, 300) }
    if (target) { this.speed.target = clamp(target, 60, 300) }
    if (setTimer === true) { this.setTimer(this.speed.value) }
    client.console.bpmNumber.innerText = this.speed.value
  }

  this.setTimer = function (bpm) {
    if (bpm < 60) { console.warn('Clock', 'Error ' + bpm); return }
    this.clearTimer()
    window.localStorage.setItem('bpm', bpm)
  }

  this.mod = function(mod = 0, animate = false) {
    if (animate === true) {
      this.set(null, this.speed.target + mod)
    } else {
      this.set(this.speed.value + mod, this.speed.value + mod, true)
      canvas.update()
    }
  }

  this.clearTimer = function() {
    if (this.timer) {
      this.timer.terminate()
    }
    this.timer = null
  }

  this.setFrame = function(f) {
    if (isNaN(f)) { return }
    canvas.seequencer.f = clamp(f, 0, 9999999)
  }

  this.resetFrame = function(){
    canvas.seequencer.f = 0
  }

  this.toString = function() {
    return `${this.bpm}`
  }

  function clamp (v, min, max) { return v < min ? min : v > max ? max : v }
}