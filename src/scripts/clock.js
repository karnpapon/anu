'use strict'

class Clock {
  constructor(bpm, callback) {
    this.bpm = 0
    this.callback = () => { }
    this.timer = null
    this.running = false
    this.setBpm(bpm)
    this.isPaused = true

    this.speed = { value: 120, target: 120 }
  }

  setCallback(callback) {
    this.callback = callback
  }

  canSetBpm() {
    return true
  }

  getBpm() {
    return this.bpm
  }

  setBpm(bpm) {
    this.bpm = bpm
    this.reset()
  }

  run() {
    if (this.speed.target === this.speed.value) { return }
    this.set(this.speed.value + (this.speed.value < this.speed.target ? 1 : -1), null, true)
  }

  reset() {
    if (this.timer) {
      clearInterval(this.timer)
    }

    if (this.running) {
      this.timer = setInterval(() => { this.callback() }, (60000 / this.bpm) / 4)
    }
  }

  setRunning(running) {
    this.running = running
    this.reset()
  }

  togglePlay() {
    if (this.isPaused === true) {
      this.play()
    } else {
      this.stop()
    }
  }

  start() {
    this.setRunning(true)
  }

  play() {
    if (!this.isPaused) { console.warn('Already playing'); return }
    console.log('Clock', 'Play')
    this.isPaused = false
    if (this.isPuppet) { return console.warn('External Midi control') }
    this.set(this.speed.target, this.speed.target, true)
  }

  set(value, target = null, setTimer = false) {
    if (value) { this.speed.value = this.clamp(value, 60, 300) }
    if (target) { this.speed.target = this.clamp(target, 60, 300) }
    if (setTimer === true) { this.setTimer(this.speed.value) }
  }

  setTimer(bpm) {
    console.log('Clock', 'New Timer ' + bpm + 'bpm')
    this.clearTimer()
    this.timer = new Worker('./scripts/timer.js')
    this.timer.postMessage((60000 / bpm) / 4)
    this.timer.onmessage = (event) => { terminal.run() }
  }

  clearTimer() {
    if (this.timer) {
      this.timer.terminate()
    }
    this.timer = null
  }

  stop() {
    this.setRunning(false)
  }

  toString() {
    return `${this.bpm}`
  }

  clamp (v, min, max) { return v < min ? min : v > max ? max : v }
}

module.exports = Clock