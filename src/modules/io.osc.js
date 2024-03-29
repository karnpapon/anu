'use strict'

// osc module is located at /src-tauri/src/lib/osc.rs
function Osc (app) {
  const { invoke } = window.__TAURI__;
  
  this.stack = []
  this.port = null
  this.isPlayed = false
  this.currentMsg = null // for ratcheting note

  // for preventing re-triggering (note latching) when noteRatio is not 1, 
  // eg. noteRatio = 4, will cause re-triggering 4 times since it's based-on clock's `tick` 
  // and master clock ratio is 1:16
  this.notelength = 1 
  this.noteRatio = 1
  
  this.start = function () {
    console.info('OSC', 'Start..')
  }

  this.clear = function () {
    this.stack = []
    this.currentMsg = null
  }

  this.run = function () {
    for (const id in this.stack) {
      const item = this.stack[id]
      if (this.isPlayed === false) { this.trigger(item) }
    }
	
    this.notelength--
    this.notelength = ((this.notelength % this.noteRatio) + this.noteRatio) % this.noteRatio
    if(this.notelength === 0) { this.isPlayed = false }
  }

  this.push = function (path, msg, length, isRatcheting) {
    if (!this.isPlayed){
      this.notelength = length
      this.noteRatio = length
      this.stack.push({ path, msg, isRatcheting })
    }
  }
  
  this.trigger = function (item) {
    if(!item.isRatcheting) { this.isPlayed = true }
    if(!item.msg) { console.warn('OSC', 'Empty message'); return }
    if(!item.isRatcheting) { this.sendOsc(item.path, item.msg) }
    else { this.currentMsg = { path: item.path, msg: item.msg } }
  }

  this.sendCurrentMsg = function(){
    if (this.currentMsg !== null) {
      this.sendOsc(this.currentMsg.path, this.currentMsg.msg)
    }
  }
  
  this.sendOsc = function(path, args) {
    invoke("plugin:osc|send", { rpc: { path, args } })
    .then(() => { if (client.displayer.errorMsgElem.innerText !== "") { client.displayer.setDisplayerErrMsg("") } } )
    .catch((error) =>  { client.displayer.setDisplayerErrMsg(error); });
  }
}