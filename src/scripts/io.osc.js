// 'use strict'

/* global OSC */

// osc module is located at /src-tauri/src/lib/osc.rs
function Osc (app) {
  const isEven = (x) => { return (x%2)==0; }
  const isOdd = (x) => { return !isEven(x); }
  const { invoke } = window.__TAURI__;

  this.stack = []
  this.port = null

  this.start = function () {
    console.info('OSC', 'Start..')
  }

  this.clear = function () {
    this.stack = []
  }

  this.run = function () {
    for (const item of this.stack) {
      this.play(item)
    }
  }

  this.push = function (path, msg) {
    this.stack.push({ path, msg })
  }
  
  this.play = function ({ path, msg }) {
    if (!msg) { console.warn('OSC', 'Empty message'); return }
    this.sendOsc(path, msg)
  }

  this.sendOsc = function(path, args) {
    invoke("plugin:osc|send", { rpc: { path, args } });
  }
}