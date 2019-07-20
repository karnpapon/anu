'use strict'

function Cursor(canvas) {
  this.mode = 0
  this.block = []
  this.active = 0
  this.cursors = [{ 
    x: 0, y: 0, w: 1, h:1, i: 0, 
    n: `cursor-name-${this.active}`,
    matched: [],
    msg: {
      MIDI: { note: [], notelength: [], velocity: [], octave: [], channel: "" },
      UDP: ["D3C"],
      OSC:  { path: 'play2', msg: "" }
    }
  }]

  this.move = function (x, y) {
    let active = this.cursors[this.active]
    if (isNaN(x) || isNaN(y)) { return }
    active.x = clamp(active.x + parseInt(x), 0, canvas.seequencer.w - 1)
    active.y = clamp(active.y - parseInt(y), 0, canvas.seequencer.h - 1)
    seeq.console.cursorPosition.innerText = `${canvas.cursor.getActivePosition()}`
    canvas.update()
    console.log("matched", this.cursors)
  }

  this.scale = function (x, y) {
    let active = this.cursors[this.active] 
    if (isNaN(x) || isNaN(y)) { return }
    active.w = clamp(active.w + parseInt(x), 1, canvas.seequencer.w - active.x)
    active.h = clamp(active.h - parseInt(y), 1, canvas.seequencer.h - active.y)
    canvas.update()
  }

  this.switch = function(index = 0){
    this.active = index
  }

  this.add = function(){
    this.cursors.push({ 
      x: 0, y: 0, w: 10, h:1, i: canvas.globalIdx, 
      n: `cursor-name-${canvas.globalIdx}`,
      matched: [],
      msg: {
        MIDI: { note: [], notelength: [], velocity: [], octave: [], channel: "" },
        UDP: ["D3C"],
        OSC:  { path: 'play2', msg: "" }
      }
    }) 
  }

  this.moveTo = function (x, y) {
    let active = this.cursors[this.active]  
    if (isNaN(x) || isNaN(y)) { return }
    active.x = clamp(parseInt(x), 0, canvas.seequencer.w - 1)
    active.y = clamp(parseInt(y), 0, canvas.seequencer.h - 1)
    canvas.update()
  }
  
  this.scaleTo = function (w, h) {
    let active = this.cursors[this.active] 
    if (isNaN(w) || isNaN(h)) { return }
    active.w = clamp(parseInt(w), 1, canvas.seequencer.w - 1)
    active.h = clamp(parseInt(h), 1, canvas.seequencer.h - 1)
    canvas.update()
  }

  this.setOSCmsg  = function(){
    this.cursors[this.active].msg.OSC = seeq.displayer.oscConf
  }

  this.setMIDImsg  = function(){
    let midiMsg = {
      note: [], 
      notelength: [], 
      velocity: [], 
      octave: [], 
      channel: "",
    }
    let noteAndOct = [], len = [], vel = []
    let noteOnly = []
    let octOnly = []

    const { 
      note, 
      notelength, 
      velocity, 
      channel
    } = seeq.displayer.midiConf

    noteAndOct = seeq.parser(note, 'note')
    len = seeq.parser(notelength, 'length')
    vel = seeq.parser(velocity, 'velocity') 

    noteAndOct.forEach(item => {
      noteOnly.push(item[0])
      octOnly.push(parseInt( item[1] ))
    })

    midiMsg.note = noteOnly
    midiMsg.octave = octOnly
    midiMsg.notelength = len 
    midiMsg.velocity = vel
    midiMsg.channel = channel
    
    this.cursors[this.active].msg.MIDI = midiMsg
  }

  this.setCursorName = function(){
    this.cursors[this.active].n = seeq.displayer.renameInput 
  }
  
  this.select = function (x = this.cursors[0].x, y = this.cursors[0].y, w = this.cursors[0].w, h = this.cursors[0].h) {
    this.moveTo(x, y)
    this.scaleTo(w, h)
    canvas.update()
  }

  this.init = function(){
    this.mode = 0
    this.block = []
    this.active = 0
    this.cursors = [{ 
      x: 0, y: 0, w: 1, h:1, i: 0, 
      n: `cursor-name-${this.active}`,
      matched: [],
      msg: {
        MIDI: { note: [], notelength: [], velocity: [], octave: [], channel: "" },
        UDP: ["D3C"],
        OSC:  { path: 'play2', msg: "bd" }
      }
    }]
  }

  this.reset = function () {
    this.init()
    this.move(0, 0)
  }

  this.read = function () {
    let active = this.cursors[this.active] 
    return canvas.seequencer.glyphAt(active.x, active.y)
  }

  this.write = function (g) {
    let active = this.cursors[this.active]
    if (canvas.seequencer.write(active.x, active.y, g) && this.mode === 1) {
      this.move(1, 0)
    }
  }

  this.erase = function(){
    let filteredCursor, filterStep, filterStepCounter
    filteredCursor = this.cursors.filter( ( cs ) => cs.i !== this.cursors[ this.active ].i)
    filterStep = canvas.stepcursor.steps.filter( ( step ) => step.i !== canvas.stepcursor.steps[ this.active ].i)
    filterStepCounter = canvas.stepcounter.counter.filter( ( c ) => c.i !== canvas.stepcounter.counter[ this.active ].i)
    this.cursors = filteredCursor
    canvas.stepcursor.steps = filterStep
    canvas.stepcounter.counter = filterStepCounter
    this.active = 0
  }

  this.setMatchedPos = function(item){
    let b = this.getBlock()
    b.forEach(_item => {
      if( _item.x === item.x && _item.y === item.y){
        this.cursors[_item.i].matched.some( m => m.x === item.x && m.y === item.y)? 
        ""
        :
        this.cursors[_item.i].matched.push(item)
      } else if (  _item.x !== item.x && _item.y !== item.y ) {
        this.cursors[_item.i].matched = []
      }
    })
  }

  this.clearMatchedPos = function(){
    this.cursors.forEach( c => {
      c.matched = []
    })
  }

  // Block
  this.getBlock = function (idx = undefined) {
    let rect = []
    rect = this.toRect()
    const block = []
    rect.forEach( r => {
      if( r.i === idx && idx ){
        for (let _y = r.y; _y < r.y + r.h; _y++) {
          for (let _x = r.x; _x < r.x + r.w; _x++) {
            block.push({x: _x, y: _y })
          }
        }
      } else {
        for (let _y = r.y; _y < r.y + r.h; _y++) {
          for (let _x = r.x; _x < r.x + r.w; _x++) {
            block.push({x: _x, y: _y, i:r.i })
          }
        }
      }
    })
    return block
  }

  this.getActivePosition = function(){
    return `(${this.cursors[this.active].x},${this.cursors[this.active].y})`
  }

  this.getSelectionArea = function(r){
    const area = []
    for (let _y = r.y; _y < r.y + r.h; _y++) {
      for (let _x = r.x; _x < r.x + r.w; _x++) {
        area.push({x: _x, y: _y })
      }
    } 
    return area
  }

  this.toRect = function () {
    let cursorArea = []
    this.cursors.forEach( ( cs ) => {
      cursorArea.push({ 
        x: cs.x, 
        y: cs.y, 
        w: cs.w, 
        h: cs.h,
        i: cs.i,
      })
    })

    return cursorArea
  }

  function sense (s) { return s === s.toUpperCase() && s.toLowerCase() !== s.toUpperCase() }
  function clamp (v, min, max) { return v < min ? min : v > max ? max : v }
}

module.exports = Cursor