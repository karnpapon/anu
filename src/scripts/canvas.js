'use strict'

const library = {
  "Spacebar": { "info": "play/pause" },
  "Cmd-Arrow": { "info": "leap cursor" },
  "ShiftArrow": { "info": "increse/decrese cursor range" },
  "ShiftArrowCmd": { "info": "jump increse/decrese cursor range" },

  "Cmd-n": { "info": "add new cursor" },
  "Cmd-Return": { "info": "toggle snap step to cursor range" },
  "Cmd-Backspace": { "info": "delete selected cursor" },
  "Cmd-e": { "info": "rename cursor" },
  "Cmd-f": { "info": "focus only cursor(s)" },
  "Option-e": { "info": "show current selected cursor name" },
  "Option-Tab": { "info": "change selected cursors" },
  "Shift-Plus": { "info": "add new step into selected cursor" },

  "Cmd-GreaterThan": { "info": "increse BPM" },
  "Cmd-LessThan": { "info": "decrese BPM" },

  "Cmd-m": { "info": "set midi msg" },

  "h": { "info": "show helps window"}
}


function Canvas () {

  this.seequencer = new Seequencer(this)
  this.cursor = new Cursor(this)
  this.source = new Source(this)
  this.commander = new Commander(this)
  this.clock = new Clock(this)
  this.io = new IO(this)
  this.stepcursor = new StepCursor(this)
  this.stepcounter = new StepCounter(this)

  this.texts = ""

  // Themes
  this.theme = new Theme({ 
    background: '#000000',
    f_high: '#FFFFFF',  
    f_med: '#e6e6e6', 
    f_low: '#40A021',  
    f_inv: '#6C00FF', 
    b_high: '#eeeeee', 
    b_med: '#3EFB00',  
    b_low: '#00FFD4', 
    b_inv: '#69DA44'  
  })

  this.el = document.createElement('canvas')
  this.context = this.el.getContext('2d')

  // Settings
  this.p = []
  this.block = []
  this.bufferPos = []
  this.prevRegExInput = ""
  this.grid = { w: 8, h: 8 }
  this.tile = {
    w: +localStorage.getItem('tilew') || 8,
    h: +localStorage.getItem('tileh') || 16
  }
  this.scale = window.devicePixelRatio
  this.hardmode = true
  this.guide = false
  this.isShowMarked = true
  this.globalIdx = 0

  this.install = function (host) {
    host.appendChild(this.el)
    this.theme.install(host)
    this.resize()
  }

  this.start = function () {
    this.io.start()
    this.source.start()
    this.clock.start()
    this.cursor.start()
    
    this.reset()
    this.writeData()
    this.modZoom()
    this.update()
    this.el.className = 'ready'
    this.toggleGuide()
    this.resize()
  }

  this.run = function () {
    this.io.clear()
    this.clock.run()
    this.seequencer.run()
    this.stepcounter.run()
    this.io.run()
    this.update()
    this.stepcursor.trigger()
  }
  
  this.update = function () {
    if (document.hidden === true) { return }
    this.clear()
    this.drawProgram()
    this.stepcursor.run()
    this.match()
    this.drawStroke(this.cursor.toRect())
    this.drawGuide()
  }

  this.reset = function () {
    this.resize()
    this.globalIdx = 0 
    this.seequencer.reset()
    this.theme.reset()
    this.cursor.reset()
    this.stepcounter.reset()
    this.stepcursor.reset()
  }

  this.setGrid = function (w, h) {
    this.grid.w = w
    this.grid.h = h
    this.update()
  }

  this.writeData = function (data = 'please give some input value and hit return' ) {
    this.texts = data
    let position = this.cursor.cursors[this.cursor.active]
    for (var i = 0; i < this.texts.length; i++) {
      this.cursor.write(this.texts.charAt(i))
      position.x++
      if (position.x % this.seequencer.w === 0) {
        position.x = 0
        position.y++
      }
    }
  }

  this.match = function () {
    if(this.p.length > 0){
      this.cursor.clearMatchedPos() 
      this.p.forEach((item, i) => {
        let g = this.seequencer.glyphAt(item.x, item.y)
        if (this.seequencer.inBlock(item.x, item.y)) {
          this.cursor.setMatchedPos(item)
          this.drawSprite(item.x, item.y, g, 2) // marked within cursor block.
        } else {
          this.drawSprite(item.x, item.y, g, this.isShowMarked? 0:5)
        }
      })
    } else {
      this.cursor.clearMatchedPos() 
    }
  }

  this.toggleShowMarks = function(){
    this.isShowMarked = !this.isShowMarked
  }

  this.toggleGuide = (force = null) => {
    const display = force !== null ? force : this.guide !== true
    if (display === this.guide) { return }
    this.guide = display
    this.update()
  }

  this.eraseSelectionCursor = function(){
    this.cursor.erase()
    this.commander.resetSwitchCounter()
  }

  this.isCursor = function (x, y) {
    return this.cursor.cursors.some( cs => x === cs.x && y === cs.y)
  }

  this.isCurrentCursor = function(x,y){
    return this.cursor.cursors.some( cs => x === cs.x && y === cs.y && cs.i === this.cursor.cursors[ this.cursor.active ].i)
  }

  this.getCurrentCursor = function(){
    return this.cursor.cursors.filter( cs => cs.i === this.cursor.cursors[ this.cursor.active ].i)
  }

  this.isSelection = function (x, y) {
    return !!( this.cursor.cursors.some( cs => x >= cs.x && x < cs.x + cs.w && y >= cs.y && y < cs.y + cs.h )  )
  }

  this.isSelectionOverlap = function(x,y){
    this.bufferPos = this.cursor.getOverlapPosition()
    return this.bufferPos.some( b => b.x === x && b.y === y)
  }

  this.isMarker = function (x, y) {
    return x % this.grid.w === 0 && y % this.grid.h === 0
  }

  this.isMatchedChar = function(x,y){
    return this.p.some( matched => matched.x === x && matched.y === y)
  }

  this.isSelectionTrigged = function(x,y){
    return this.getCurrentCursor()
  }

  this.isEdge = function (x, y) {
    return x === 0 || y === 0 || x === this.seequencer.w - 1 || y === this.seequencer.h - 1
  }

  this.isSelectionAtEdge = function(cursor){
    return ( cursor.x + cursor.w ) - 1  === this.seequencer.w - 1 || ( cursor.y + cursor.h ) - 1  === this.seequencer.h - 1
  }

  this.isSelectionAtEdgeRight = function(cursor){
    return ( cursor.x + cursor.w ) - 1  === this.seequencer.w - 1 
  }

  this.isSelectionAtEdgeBottom = function(cursor){
    return ( cursor.y + cursor.h ) - 1  === this.seequencer.h - 1
  }

  // Interface
  this.makeStyle = function (x, y) {
    let f = this.seequencer.f
    if(this.isCursor(x,y)) { return this.isCurrentCursor(x,y)? 10:1 }
    if (this.isSelection(x, y)) { return this.isSelectionOverlap(x,y)? 1:6 }
    return 9
  }

  this.makeTheme = function (type) {
    // match.
    if (type === 0) { return { bg: this.theme.active.b_med, fg: this.theme.active.background } }
    // _
    if (type === 1) { return { bg: this.theme.active.f_low, fg: this.theme.active.b_inv  } }
    // _
    if (type === 2) { return { bg: '#4B4B4B', fg: this.theme.active.b_med } }
    // step cursor
    if (type === 3) { return { bg: this.theme.active.b_low, fg: this.theme.active.f_high } }
    // cursor
    if (type === 4) { return { bg: this.theme.active.f_med, fg: this.theme.active.f_low } }
    // Mark Step inverse.
    if (type === 5) { return { bg: '#B4B4B4', fg: this.theme.active.background } }
    // cursor selection scope.
    if (type === 6) { return { fg: this.theme.active.f_low, bg: this.theme.active.b_med } }
    // current cursor.
    if (type === 7) { return { fg: this.theme.active.background} }
    // Block select.
    if (type === 8) { return { bg: this.theme.active.b_med, fg: this.theme.active.f_low } }
    // Black.
    if (type === 10) { return { bg: this.theme.active.background, fg: this.theme.active.f_high } }
    // Guide
    if (type === 11) { return { bg: "#F0F0F0", fg: this.theme.active.background } }
    // Guide
    if (type === 12) { return { bg: "#dfdfdf", fg:this.theme.active.background } }
    // Default
    return { fg: this.theme.active.background }
  }

  // Canvas

  this.clear = function () {
    this.context.clearRect(0, 0, this.el.width, this.el.height)
  }

  this.clearMarksPos = function(){
    this.p = []
  }

  this.drawProgram = function () {
    for (let y = 0; y < this.seequencer.h ; y++) {
      for (let x = 0; x < this.seequencer.w; x++) {
        const g = this.seequencer.glyphAt(x, y)
        const style = this.makeStyle(x, y)
        const glyph = g !== '.' ? g : this.isCursor(x, y) ? (this.clock.isPaused ? 'x' : '>') : this.isMarker(x, y) ? '+' : g
        this.drawSprite(x, y, glyph, style)
      }
    }
  }

  this.drawStroke = function(rects){
    rects.forEach( rect => {
      const r = {
        x: rect.x * this.scale * this.tile.w,
        y: rect.y * this.scale * this.tile.h,
        w: rect.w * this.scale * this.tile.w,
        h: rect.h * this.scale * this.tile.h
      }
      this.context.lineWidth = 1;
      this.context.strokeStyle = this.theme.active.background
      this.context.strokeRect(r.x + 1, r.y + 1, r.w, r.h)
    })
  }

  this.drawGuide = () => {
    if (this.guide !== true) { return }
    const operators = Object.keys(library).filter((val) => { return isNaN(val) })
    for (const id in operators) {
      const key = operators[id]
      const oper = library[key]
      const text = oper.info
      const frame = this.seequencer.h - 4
      const x = (Math.floor(parseInt(id) / frame) * 32) + 2
      const y = (parseInt(id) % frame) + 5
      const text_line_length = text.length + key.length
      this.write(`${' '.repeat(1)}${key}:${' '.repeat(1)}`, x, y, 99, 11, "bold")
      this.write(`${' '.repeat(1)}${text}${' '.repeat(this.seequencer.w - text_line_length - 10)}`, x + key.length + 3, y, 99, 11)
    }
  }

  this.drawSprite = function (x, y, g, type, text_weight = "normal") {
    const theme = this.makeTheme(type)
    if (theme.bg) {
      const bgrect = { 
        x: x * this.tile.w * this.scale, 
        y: y * this.tile.h * this.scale, 
        w: this.tile.w * this.scale, 
        h: this.tile.h * this.scale 
      }
      this.context.fillStyle = theme.bg
      this.context.fillRect(bgrect.x, bgrect.y, bgrect.w, bgrect.h)
    }
    if (theme.fg) {
      const fgrect = { 
        x: (x + 0.5) * this.tile.w * this.scale, 
        y: (y + 1) * this.tile.h * this.scale, 
        w: this.tile.w * this.scale, 
        h: this.tile.h * this.scale 
      }
      this.context.fillStyle = theme.fg
      this.context.font = text_weight === "bold" ? `${this.tile.h * 0.75 * this.scale}px input_mono_bold` : `${this.tile.h * 0.75 * this.scale}px input_mono_regular` 
      this.context.fillText(g, fgrect.x, fgrect.y)
    }
  }

  this.modZoom = (mod = 0, reset = false) => {
    this.tile = {
      w: reset ? 8 : this.tile.w * (mod + 1),
      h: reset ? 16 : this.tile.h * (mod + 1),
      ws: Math.floor(this.tile.w * this.scale),
      hs: Math.floor(this.tile.h * this.scale)
    }
    localStorage.setItem('tilew', this.tile.w)
    localStorage.setItem('tileh', this.tile.h)
    this.resize()
  }


  this.write = function (text, offsetX, offsetY, limit = 50, type = 2, text_weight = "normal") {
    let x = 0
    while (x < text.length && x < limit - 1) {
      this.drawSprite(offsetX + x, offsetY, text.substr(x, 1), type, text_weight)
      x += 1
    }
  }

  this.resize = function () {
    const ww = document.getElementsByClassName("content")[0];
    const size = { w: ww.clientWidth, h: ww.clientHeight}
    const tiles = { w: Math.ceil(( size.w) / this.tile.w  ), h: Math.ceil(( size.h) / this.tile.h  ) }
    const bounds = this.seequencer.bounds();

    if (tiles.w < bounds.w + 1) { tiles.w = bounds.w + 1 }
    if (tiles.h < bounds.h + 1) { tiles.h = bounds.h + 1 }

    this.crop(tiles.w, tiles.h)

    // Keep cursor in bounds
    // if (this.cursor.cursors[this.cursor.active].x >= tiles.w) { this.cursor.cursors[this.cursor.active].x = tiles.w - 1 }
    // if (this.cursor.cursors[this.cursor.active].y >= tiles.h) { this.cursor.cursors[this.cursor.active].y = tiles.h - 1 }

    const w = this.tile.ws * this.seequencer.w
    const h = (this.tile.hs + (this.tile.hs / 5)) * this.seequencer.h 

    // if (w === this.el.width && h === this.el.height) { return }

    this.el.width = w
    this.el.height = h
    this.el.style.width = `${Math.ceil(this.tile.w * this.seequencer.w)}px`
    this.el.style.height = `${Math.floor((this.tile.h + (this.tile.h / 5)) * this.seequencer.h)}px`

    this.context.textBaseline = 'bottom'
    this.context.textAlign = 'center'
    this.context.font = `${this.tile.h * 0.75 * this.scale}px input_mono_regular` 
    this.update()
  }

  this.crop = function (w, h) {
    let block = `${this.seequencer}`

    if (h > this.seequencer.h) {
      block = `${block}${`\n${'.'.repeat(this.seequencer.w)}`.repeat(h - this.seequencer.h )}`
    } else if (h < this.seequencer.h) {
      block = `${block}`.split(/\r?\n/).slice(0, (h - this.seequencer.h)).join('\n').trim()
    }
    
    if (w > this.seequencer.w) {
      block = `${block}`.split(/\r?\n/).map((val) => { return val + ('.').repeat((w - this.seequencer.w)) }).join('\n').trim()
    } else if (w < this.seequencer.w) {
      block = `${block}`.split(/\r?\n/).map((val) => { return val.substr(0, val.length + (w - this.seequencer.w)) }).join('\n').trim()
    }
    this.seequencer.load(w, h, block, this.seequencer.f)
  }


  window.onresize = (e) => {
    this.resize()
  }

  // Helpers

  function display (str, f, max) { return str.length < max ? str : str.slice(f % str.length) + str.substr(0, f % str.length) }
  function clamp (v, min, max) { return v < min ? min : v > max ? max : v }
}
