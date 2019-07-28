'use strict'

function Cursor(canvas) {
  this.mode = 0
  this.block = []
  this.active = 0
  this.cursors = [{ 
    x: 0, y: 0, w: 1, h:1, i: 0, 
    n: `cursor-name-${this.active}`,
    isOverlap: false,
    matched: [],
    msg: {
      MIDI: { 
        note: ["C", "E", "G"], 
        notelength: [3,4,5], 
        velocity: [9,10,11], 
        octave: [2,3,4], 
        channel: 0 
      },
      UDP: [],
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
  }

  this.scale = function (x, y) {
    let active = this.cursors[this.active] 
    if (isNaN(x) || isNaN(y)) { return }
    active.w = clamp(active.w + parseInt(x), 1, canvas.seequencer.w - active.x)
    active.h = clamp(active.h - parseInt(y), 1, canvas.seequencer.h - active.y)
    seeq.console.cursorLength.innerText = `${canvas.cursor.getStepLength()}`
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
        MIDI: { 
          note: ["C", "E", "G"], 
          notelength: [3,4,5], 
          velocity: [9,10,11], 
          octave: [2,3,4], 
          channel: 0 
        },
        UDP: [],
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

  this.getOverlapPosition = function(){
    let block = this.getBlock()
    var result = Object.values(block.reduce((c, v) => {
      let k = v.x + '-' + v.y;
      c[k] = c[k] || [];
      c[k].push(v);
      return c;
    }, {})).reduce((c, v) => v.length > 1 ? c.concat(v) : c, []);
    return result
  }

  this.setOSCmsg  = function(){
    this.cursors[this.active].msg.OSC = seeq.displayer.oscConf
  }

  this.setMIDImsg  = function(){
    let active = this.cursors[this.active]
    let midiMsg = {
      note: [], 
      notelength: [], 
      velocity: [], 
      octave: [], 
      channel: "",
    }
    let noteAndOct = [], len = "", vel = ""
    let noteOnly = []
    let octOnly = []

    let { 
      note, 
      notelength, 
      velocity, 
      channel
    } = seeq.displayer.midiConf

    // handle separately eval msg.
    note = note === ""?   seeq.displayer.getPairedNoteAndOct(active):note
    notelength = notelength ===""? active.msg.MIDI.notelength.join():notelength
    velocity = velocity === ""? active.msg.MIDI.velocity.join():velocity
    channel = channel === ""? active.msg.MIDI.channel:channel > 15?  active.msg.MIDI.channel:channel

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

    this.setUDPmsg(midiMsg)
    this.cursors[this.active].msg.MIDI = midiMsg
  }

  this.setUDPmsg = function(msg){
    this.cursors[this.active].msg.UDP = []
    let convertTarget = JSON.parse(JSON.stringify(msg));
    let udpNote = []
    let udpLength = []
    let udpVelocity = []
    let udpMsg = []
    let convertedChan = seeq.getUdpValue(parseInt(convertTarget.channel))

    for (var i = 0; i < msg.note.length; i++) {
      udpLength.push(seeq.getUdpValue(parseInt(convertTarget.notelength[i % msg.note.length])))
      udpNote.push(seeq.getUdpNote(convertTarget.note[i]))
      udpVelocity.push(seeq.getUDPvalFrom127(parseInt(convertTarget.velocity[i % msg.note.length])))
    }

    for(var i = 0; i< msg.note.length; i++){
      udpMsg.push(`${convertedChan}${convertTarget.octave[i]}${udpNote[i]}${udpVelocity[i]}${udpLength[i]}` )
    }

    this.cursors[this.active].msg.UDP = udpMsg
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
        MIDI: { 
          note: ["C", "E", "G"], 
          notelength: [3,4,5], 
          velocity: [9,10,11], 
          octave: [2,3,4], 
          channel: 0 },
        UDP: [],
        OSC:  { path: 'play2', msg: "s [amencutup] n [12,6,9]" }
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

  this.getStepLength = function(){
    return `${this.cursors[this.active].w}, ${this.cursors[this.active].h}`
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