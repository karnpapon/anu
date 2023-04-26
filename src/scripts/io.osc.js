// 'use strict'

/* global OSC */

// osc module is located at /src-tauri/src/lib/osc.rs
function Osc (app) {
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
      this.trigger(item)
    }
  }

  this.push = function (path, msg) {
    this.stack.push({ path, msg })
  }
  
  this.trigger = function ({ path, msg }) {
    if (!msg) { console.warn('OSC', 'Empty message'); return }
    this.sendOsc(path, msg)
  }
  
  this.sendOsc = function(path, args) {
    invoke("plugin:osc|send", { rpc: { path, args } })
    .then(() => { if (client.displayer.errorMsgElem.innerText !== "") { client.displayer.setDisplayerErrMsg("") } } )
    .catch((error) =>  { client.displayer.setDisplayerErrMsg(error); });
  }
}