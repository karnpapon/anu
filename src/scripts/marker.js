'use strict'

/* global client */

function Marker(canvas) {

  this.mode = 0
  this.block = []
  this.active = 0
  this.markers = []
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
    this.markers = []
    this.initCursor()
  }

  this.initCursor = function(){
    this.markers.push(this.getNewMarker())
  }

  this.getNewMarker = function(){
    let newCursor = { 
      x: 0, y: 0, w: 8, h:1, i: canvas.globalIdx, 
      n: `marker-name-${canvas.globalIdx}`,
      overlapAreas: new Map(),
      overlapIndex: new Set(),
      matched: new Set(),
      control: {
        muted: false, 
        reverse: false,
        noteRatio: 1
      },
      msg: {
        MIDI: { 
          note: ["C", "E", "G"], 
          notelength: [3,4,5], 
          velocity: [9,10,11], 
          octave: [2,3,4], 
          channel: 0 
        },
        UDP: [],
        OSC: { path: '', msg: [], counter: 0 },
      }
    }

    return newCursor
  }

  this.reset = function () {
    this.init()
    this.move(0, 0)
  }

  this.select = function (x = this.markers[this.active].x, y = this.markers[this.active].y, w = this.markers[this.active].w, h = this.markers[this.active].h) {
    const currentMarker = this.currentMarker();
    if (isNaN(x) || isNaN(y) || isNaN(w) || isNaN(h)) { return }
    const rect = { 
      x: clamp(parseInt(x), 0, canvas.seequencer.w - 1), 
      y: clamp(parseInt(y), 0, canvas.seequencer.h - 1), 
      w: clamp(parseInt(w), 1, canvas.seequencer.w - 1), 
      h: clamp(parseInt(h), 1, canvas.seequencer.h - 1) 
    }

    if ( currentMarker.x === rect.x && 
      currentMarker.y === rect.y && 
      currentMarker.w === rect.w && 
      currentMarker.h === rect.h) {
      return
    }

    currentMarker.x = rect.x
    currentMarker.y = rect.y
    currentMarker.w = rect.w
    currentMarker.h = rect.h
    this.calculateBounds()
    this.findOverlapArea(rect)
    client.console.cursorPosition.innerText = `${canvas.marker.getActivePosition()}`
    client.console.highlightLength.innerText = (w >= 0 && h >= 0) ? `${this.getStepLength()}` : "1,1"
    canvas.update()
  }

  this.calculateBounds = () => {
    const c = this.markers[this.active]
    this.minX = (c.x < c.x + c.w ? c.x : c.x + c.w) 
    this.minY = (c.y < c.y + c.h ? c.y : c.y + c.h)
    this.maxX = (c.x > c.x + c.w ? c.x : c.x + c.w) - 1
    this.maxY = (c.y > c.y + c.h ? c.y : c.y + c.h) - 1
  }

  this.findOverlapArea = function(r2){
    if (this.markers.length < 2) return 
    
    // console.log("this.markers", this.markers)
    // clear overlapAreas, firstly refresh(clear) current active one.
    // then remove any overlapAreas related to current active one. 
    this.markers[this.active].overlapAreas.clear()
    this.markers[this.active].overlapIndex.clear()
    this.markers.filter(item => item.overlapIndex.has(this.active)).forEach(item => {
      item.overlapAreas.forEach((value,key) => {
        if (value.i === this.active || value.i === item.i) { 
          item.overlapAreas.delete(key)
          item.overlapIndex.delete(key)
        } 
      })

      if (!item.overlapAreas.size) { item.overlapIndex.clear()}
    })

    this.markers.filter(item => item.i !== this.active).forEach(r1 => {
      const x = Math.max(r1.x, r2.x);
      const y = Math.max(r1.y, r2.y);
      const xx = Math.min(r1.x + r1.w, r2.x + r2.w);
      const yy = Math.min(r1.y + r1.h, r2.y + r2.h);
      if (xx-x > 0 && yy-y > 0 ) {
        
        for (let i=x,ii=xx-x;ii>=1;ii--){
          for (let j=y,jj=yy-y;jj>=1;jj--){
            this.markers[this.active].overlapAreas.set(`${i+ii-1}:${j+jj-1}:${r1.i}`, {x: i+ii-1, y: j+jj-1, i: r1.i })
            this.markers[this.active].overlapIndex.add(r1.i)
            this.markers[r1.i].overlapAreas.set(`${i+ii-1}:${j+jj-1}:${this.active}`, {x: i+ii-1, y: j+jj-1, i: this.active })
            this.markers[r1.i].overlapIndex.add(this.active)
          }
        }
      } 
    })
  }

  this.onMouseDown = (e) => {
    if (canvas.guide) { canvas.toggleGuide(false)}
    const pos = this.mousePick(e.clientX, e.clientY)
    this.select(pos.x, pos.y, 1, 1)
    this.mouseFrom = pos
  }

  this.currentMarker = () => {
    return this.markers[this.active]
  }

  this.onMouseMove = (e) => {
    if (!this.mouseFrom) { return }
    const pos = this.mousePick(e.clientX, e.clientY)
    this.select(this.mouseFrom.x, this.mouseFrom.y, pos.x - this.mouseFrom.x + 1, pos.y - this.mouseFrom.y + 1)
  }

  this.onMouseUp = (e) => {
    this.mouseFrom = null
  }

  this.mousePick = (x, y, w = canvas.tile.w, h = canvas.tile.h) => {
    const rect = canvas.el.getBoundingClientRect();
    return { x: parseInt(((x - rect.left)) / w) , y: parseInt(((y - rect.top )) / h) }
  }

  this.move = (x, y) => {
    this.select(this.markers[this.active].x + parseInt(x), this.markers[this.active].y - parseInt(y))
  }

  this.switch = function(index = 0){
    this.active = index
  }

  this.add = function(){
    this.markers.push(this.getNewMarker()) 
  }

  this.moveTo = (x, y) => {
    this.select(x, y)
  }

  this.modNoteRatio = function(mod = 0) {
    this.setNoteRatio(this.markers[this.active]["control"]["noteRatio"] + mod)
    // canvas.stepcounter.resetTarget(this.active)
    // canvas.stepcursor.reset(this.active)
  }

  this.setNoteRatio = function(value) {
    if (value) {this.markers[this.active]["control"]["noteRatio"] = clamp(value, 1, 16) }
    client.console.currentNumber.innerText = `${this.markers[this.active]["control"]["noteRatio"]}:16`
  }

  this.scale = (w, h) => {
    this.select(
      this.markers[this.active].x, 
      this.markers[this.active].y, 
      this.markers[this.active].w + parseInt(w), 
      this.markers[this.active].h - parseInt(h)
    )
  }

  this.scaleTo = (w, h) => {
    this.select(this.markers[this.active].x, this.markers[this.active].y, w, h)
  }

  this.selected = (x, y) => {
    return x >= this.minX && x <= this.maxX && y >= this.minY && y <= this.maxY
  }
  
  this.setOSCmsg  = function(){
    let active = this.getActiveCursor()
    let { path, msg } = client.displayer.oscConf
    let msgArr = msg.split('|')
    path = Utils.get(client, "displayer.oscConf.path", active.msg.OSC.path)
    msg = Utils.get(client, "displayer.oscConf.msg", active.msg.OSC.msg)
    this.markers[this.active].msg.OSC = { path, msg: msgArr, counter: this.markers[this.active].msg.OSC.counter }
    // console.log("oscMsg: ", this.markers[this.active].msg.OSC)
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
    } = client.displayer.midiConf

    // handle separately eval msg.
    note = note === ""?   client.displayer.getPairedNoteAndOct(active):note
    notelength = notelength ===""? active.msg.MIDI.notelength.join():notelength
    velocity = velocity === ""? active.msg.MIDI.velocity.join():velocity
    channel = channel === ""? active.msg.MIDI.channel:channel > 15?  active.msg.MIDI.channel:channel

    noteAndOct = client.parser(note, 'note')
    len = client.parser(notelength, 'length')
    vel = client.parser(velocity, 'velocity') 

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
    this.markers[this.active].msg.MIDI = midiMsg

    console.log("midiMsg", midiMsg)
  }

  this.setUDPmsg = function(msg){
    this.markers[this.active].msg.UDP = []
    let convertTarget = JSON.parse(JSON.stringify(msg));
    let udpNote = []
    let udpLength = []
    let udpVelocity = []
    let udpMsg = []
    let convertedChan = client.getUdpValue(parseInt(convertTarget.channel))

    for (var i = 0; i < msg.note.length; i++) {
      udpLength.push(client.getUdpValue(parseInt(convertTarget.notelength[i % msg.note.length])))
      udpNote.push(client.getUdpNote(convertTarget.note[i]))
      udpVelocity.push(client.getUDPvalFrom127(parseInt(convertTarget.velocity[i % msg.note.length])))
    }

    for(var i = 0; i< msg.note.length; i++){
      udpMsg.push(`${convertedChan}${convertTarget.octave[i]}${udpNote[i]}${udpVelocity[i]}${udpLength[i]}` )
    }

    this.markers[this.active].msg.UDP = udpMsg
  }

  this.setCursorName = function(){
    this.markers[this.active].n = client.displayer.renameInput 
  }

  this.read = function () {
    let active = this.markers[this.active] 
    return canvas.seequencer.glyphAt(active.x, active.y)
  }

  this.write = function (g) {
    let active = this.markers[this.active]
    if (canvas.seequencer.write(active.x, active.y, g) && this.mode === 1) {
      this.move(1, 0)
    }
  }

  this.erase = function(){
    let filteredCursor, filterStep, filterStepCounter
    filteredCursor = this.markers.filter( ( cs ) => cs.i !== this.markers[ this.active ].i)
    if( canvas.stepcursor.steps[this.active]){
      filterStep = canvas.stepcursor.steps.filter( ( step ) => step.i !== canvas.stepcursor.steps[ this.active ].i)
      filterStepCounter = canvas.stepcounter.counter.filter( ( c ) => c.i !== canvas.stepcounter.counter[ this.active ].i)
      canvas.stepcursor.steps = filterStep
      canvas.stepcounter.counter = filterStepCounter
    }
    this.markers = filteredCursor
    this.active = 0
  }

  this.getActiveCursor = function(){
    return this.markers[this.active]
  }

  this.clearMatchedPos = function(){
    this.markers.forEach( c => {
      c.matched.clear()
    })
  }

  this.getActivePosition = function(){
    return `(${this.markers[this.active].x},${this.markers[this.active].y})`
  }

  this.getStepLength = function(){
    return `${this.markers[this.active].w}, ${this.markers[this.active].h}`
  }

  this.toRect = function () {
    let cursorArea = []
    this.markers.forEach( ( cs ) => {
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

  function clamp (v, min, max) { return v < min ? min : v > max ? max : v }

}

