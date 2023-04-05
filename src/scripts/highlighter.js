'use strict'

/* global seeq */

function Highlighter(canvas) {

  this.mode = 0
  this.block = []
  this.active = 0
  this.highlighters = []
  this.mouseFrom = null

  this.minX = 0
  this.maxX = 0
  this.minY = 0
  this.maxY = 0

  this.start = () => {
    canvas.el.onmousedown = this.onMouseDown
    canvas.el.onmouseup = this.onMouseUp
    canvas.el.onmousemove = this.onMouseMove
  }

  this.init = function(){
    this.mode = 0
    this.block = []
    this.active = 0
    this.highlighters = []
  }

  this.initCursor = function(){
    this.highlighters.push(this.getNewHighlighter())
  }

  this.getNewHighlighter = function(){
    let newCursor = { 
      x: 0, y: 0, w: 8, h:1, i: canvas.globalIdx, 
      n: `highlighter-name-${canvas.globalIdx}`,
      overlapAreas: new Map(),
      overlapIndex: new Set(),
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
        OSC:  { path: 'play2', msg: "s [amencutup] n [12,6,9]", formattedMsg:"" },
      }
    }

    return newCursor
  }

  this.reset = function () {
    this.init()
    this.initCursor()
    this.move(0, 0)
  }

  this.select = function (x = this.highlighters[this.active].x, y = this.highlighters[this.active].y, w = this.highlighters[this.active].w, h = this.highlighters[this.active].h) {
    if (isNaN(x) || isNaN(y) || isNaN(w) || isNaN(h)) { return }
    const rect = { 
      x: clamp(parseInt(x), 0, canvas.seequencer.w - 1), 
      y: clamp(parseInt(y), 0, canvas.seequencer.h - 1), 
      w: clamp(parseInt(w), 0, canvas.seequencer.w - 1), 
      h: clamp(parseInt(h), 0, canvas.seequencer.h - 1) 
    }

    if ( this.highlighters[this.active].x === rect.x && 
      this.highlighters[this.active].y === rect.y && 
      this.highlighters[this.active].w === rect.w && 
      this.highlighters[this.active].h === rect.h) {
      return
    }

    this.highlighters[this.active].x = rect.x
    this.highlighters[this.active].y = rect.y
    this.highlighters[this.active].w = rect.w
    this.highlighters[this.active].h = rect.h
    this.calculateBounds()
    this.findOverlapArea(rect)
    seeq.console.cursorPosition.innerText = `${canvas.highlighter.getActivePosition()}`
    seeq.console.highlightLength.innerText = (w >= 0 && h >= 0) ? `${this.getStepLength()}` : "1,1"
    canvas.update()
  }

  this.calculateBounds = () => {
    const c = this.highlighters[this.active]
    this.minX = c.x < c.x + c.w ? c.x : c.x + c.w
    this.minY = c.y < c.y + c.h ? c.y : c.y + c.h
    this.maxX = c.x > c.x + c.w ? c.x : c.x + c.w
    this.maxY = c.y > c.y + c.h ? c.y : c.y + c.h
  }

  this.findOverlapArea = function(r2){
    if (this.highlighters.length < 1) return 

    // clear overlapAreas, firstly refresh(clear) current active one.
    // then remove any overlapAreas related to current active one. 
    this.highlighters[this.active].overlapAreas.clear()
    this.highlighters.filter(hl => hl.overlapIndex.has(this.active)).forEach(hl => {
      hl.overlapAreas.forEach((value,key) => {
        if (value.i === this.active) { 
          hl.overlapAreas.delete(key)
        } 
      })
    })

    this.highlighters.filter(h => h.i !== this.active).forEach(r1 => {
      const x = Math.max(r1.x, r2.x);
      const y = Math.max(r1.y, r2.y);
      const xx = Math.min(r1.x + r1.w, r2.x + r2.w);
      const yy = Math.min(r1.y + r1.h, r2.y + r2.h);
      if (xx-x > 0 && yy-y > 0 ) {
        // this.highlighters[r1.i].overlapAreas.clear()
        this.highlighters[this.active].overlapIndex.clear()
        for (let i=x,ii=xx-x;ii>=1;ii--){
          for (let j=y,jj=yy-y;jj>=1;jj--){
            this.highlighters[this.active].overlapAreas.set(`${i+ii-1}:${j+jj-1}`, {x: i+ii-1, y: j+jj-1, i: r1.i })
            this.highlighters[this.active].overlapIndex.add(r1.i)
            this.highlighters[r1.i].overlapIndex.add(this.active)
          }
        }
      } 
    })
  }

  // this.clearAllHighlights = function(){
  //   this.highlighters.forEach(h=> h.overlapAreas.clear())
  // }

  // this.clearAllOverlapIndexes = function(){
  //   this.highlighters.forEach(h=> h.overlapIndex.clear())
  // }

  this.onMouseDown = (e) => {
    if (canvas.guide) { canvas.toggleGuide(false)}
    const pos = this.mousePick(e.clientX, e.clientY)
    this.select(pos.x, pos.y, 0, 0)
    this.mouseFrom = pos
  }

  this.onMouseMove = (e) => {
    if (!this.mouseFrom) { return }
    const pos = this.mousePick(e.clientX, e.clientY)
    this.select(this.mouseFrom.x, this.mouseFrom.y, pos.x - this.mouseFrom.x + 1, pos.y - this.mouseFrom.y + 1)
  }

  this.onMouseUp = (e) => {
    if (this.mouseFrom) {
      const pos = this.mousePick(e.clientX, e.clientY)
      this.select(this.mouseFrom.x, this.mouseFrom.y, pos.x - this.mouseFrom.x + 1, pos.y - this.mouseFrom.y + 1)
    }
    this.mouseFrom = null
  }

  this.mousePick = (x, y, w = canvas.tile.w, h = canvas.tile.h) => {
    const rect = canvas.el.getBoundingClientRect();
    return { x: parseInt(((x - rect.left)) / w) , y: parseInt(((y - rect.top )) / h) }
  }

  this.move = (x, y) => {
    this.select(this.highlighters[this.active].x + parseInt(x), this.highlighters[this.active].y - parseInt(y))
  }

  this.switch = function(index = 0){
    this.active = index
  }

  this.add = function(){
    this.highlighters.push(this.getNewHighlighter()) 
  }

  this.moveTo = (x, y) => {
    this.select(x, y)
  }

  this.scale = (w, h) => {
    this.select(
      this.highlighters[this.active].x, 
      this.highlighters[this.active].y, 
      this.highlighters[this.active].w + parseInt(w), 
      this.highlighters[this.active].h - parseInt(h)
    )
  }

  this.scaleTo = (w, h) => {
    this.select(this.highlighters[this.active].x, this.highlighters[this.active].y, w, h)
  }

  this.selected = (x, y, w = 0, h = 0) => {
    return x >= this.minX && x <= this.maxX && y >= this.minY && y <= this.maxY
  }
  
  this.setOSCmsg  = function(){
    let active = this.getActiveCursor()
    let { path, msg } = seeq.displayer.oscConf
    let oscMsg = { path: "", msg: ""}
    let fmtMsg = []
    var osc_msg
    
    path = path === ""? active.msg.OSC.path:path
    msg = msg === ""? active.msg.OSC.msg:msg

    var fmt = canvas.io.osc.formatter(msg)
    let len = fmt[1].length
  
    // TODO: dynamic index based on each sound/number length.
    for(var i=0; i<fmt[3].length; i++){
      osc_msg = `${fmt[0]} ${fmt[1][i % len ]} ${fmt[2]} ${fmt[3][i]}`
      fmtMsg.push(osc_msg)
    }
    
    oscMsg.path = path
    oscMsg.msg = msg
    oscMsg.formattedMsg = fmtMsg

    console.log("oscMsg", oscMsg)
    
    this.highlighters[this.active].msg.OSC = oscMsg
    
  }

  this.setMIDImsg  = function(){
    let active = this.getActiveCursor()
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

    // this.setUDPmsg(midiMsg)
    this.highlighters[this.active].msg.MIDI = midiMsg

    console.log("midiMsg", midiMsg)
  }

  this.setUDPmsg = function(msg){
    this.highlighters[this.active].msg.UDP = []
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

    this.highlighters[this.active].msg.UDP = udpMsg
  }

  this.setCursorName = function(){
    this.highlighters[this.active].n = seeq.displayer.renameInput 
  }

  this.read = function () {
    let active = this.highlighters[this.active] 
    return canvas.seequencer.glyphAt(active.x, active.y)
  }

  this.write = function (g) {
    let active = this.highlighters[this.active]
    if (canvas.seequencer.write(active.x, active.y, g) && this.mode === 1) {
      this.move(1, 0)
    }
  }

  this.erase = function(){
    let filteredCursor, filterStep, filterStepCounter
    filteredCursor = this.highlighters.filter( ( cs ) => cs.i !== this.highlighters[ this.active ].i)
    if( canvas.stepcursor.steps[this.active]){
      filterStep = canvas.stepcursor.steps.filter( ( step ) => step.i !== canvas.stepcursor.steps[ this.active ].i)
      filterStepCounter = canvas.stepcounter.counter.filter( ( c ) => c.i !== canvas.stepcounter.counter[ this.active ].i)
      canvas.stepcursor.steps = filterStep
      canvas.stepcounter.counter = filterStepCounter
    }
    this.highlighters = filteredCursor
    this.active = 0
  }

  this.setMatchedPos = function(item){
    let b = this.getBlock()
    b.forEach(_item => {
      if( _item.x === item.x && _item.y === item.y){
        this.highlighters[_item.i].matched.some( m => m.x === item.x && m.y === item.y)? 
        ""
        :
        this.highlighters[_item.i].matched.push(item)
      } 
    })
  }

  this.getActiveCursor = function(){
    return this.highlighters[this.active]
  }

  this.clearMatchedPos = function(){
    this.highlighters.forEach( c => {
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
    return `(${this.highlighters[this.active].x},${this.highlighters[this.active].y})`
  }

  this.getStepLength = function(){
    return `${this.highlighters[this.active].w}, ${this.highlighters[this.active].h}`
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
    this.highlighters.forEach( ( cs ) => {
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