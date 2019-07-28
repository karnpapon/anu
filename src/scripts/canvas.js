'use strict'

function Canvas () {

  const Theme = require('./lib/theme')
  const Seequencer = require('./seequencer')
  const Commander = require('./commander')
  const Cursor = require('./cursor')
  const Source = require('./source')
  const Clock = require('./clock')
  const StepCursor = require('./stepcursor')
  const StepCounter = require('./stepcounter')
  const IO = require('./io')

  this.seequencer = new Seequencer(this)
  this.cursor = new Cursor(this)
  this.source = new Source(this)
  this.commander = new Commander(this)
  this.clock = new Clock(this)
  this.stepcursor = new StepCursor(this)
  this.stepcounter = new StepCounter(this)

  this.texts = ""

  // Themes
  this.theme = new Theme({ 
    background: '#000000', //black
    f_high: '#FFFFFF',  //almost white
    f_med: '#e6e6e6', // grey
    f_low: '#40A021',  //black
    f_inv: '#6C00FF', // purple-ish
    b_high: '#eeeeee', //grey-white.
    b_med: '#3EFB00',  // green
    b_low: '#00FFD4', // grey-black
    b_inv: '#69DA44'  // selection
  })

  this.el = document.createElement('canvas')
  this.context = this.el.getContext('2d')

  // Settings
  this.p = []
  this.block = []
  this.bufferPos = []
  this.prevRegExInput = ""
  this.grid = { w: 8, h: 8 }
  this.tile = { w: 8, h: 16 }
  this.scale = window.devicePixelRatio
  this.hardmode = true
  this.guide = false
  this.globalIdx = 0

  this.install = function (host) {
    host.appendChild(this.el)
    this.theme.install(host)
  }

  this.start = function () {
    this.theme.start()
    this.source.start()
    this.clock.start()
    this.writeData()
    this.update()
    this.el.className = 'ready'
  }

  this.run = function () {
    this.clock.run()
    this.source.run()
    this.seequencer.run()
    this.stepcounter.run()
    this.update()
    this.stepcursor.run()
  }
  
  this.update = function () {
    if (document.hidden === true) { return }
    this.clear()
    this.drawProgram()
    this.match()
    // this.drawStroke(this.cursor)
  }

  this.reset = function () {
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

  this.writeData = function (data = 'please give some input value' ) {
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
          this.drawSprite(item.x, item.y, g, 0) // marked within cursor block.
          // const r = {
          //   x: item.x * this.scale * this.tile.w,
          //   y: item.y * this.scale * this.tile.h,
          //   w: 1 * this.scale * this.tile.w,
          //   h: 1 * this.scale * this.tile.h
          // }
          // this.context.lineWidth = 1;
          // this.context.strokeStyle = this.theme.active.background
          // this.context.strokeRect(r.x - 0.5, r.y - 0.5, r.w, r.h)
        } else {
          this.drawSprite(item.x, item.y, g, 0) //match marked green.
        }
      })
    } else {
      this.cursor.clearMatchedPos() 
    }
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

  this.makeGlyph = function (x, y) {
    let cursor = this.cursor.cursors
    const g = this.seequencer.glyphAt(x, y)
    if (g !== '.' ) { 
      if( this.isCursor(x,y)){return "*"} else {return g }
    }

    if (this.isCursor(x, y)) { return '*'}
    if (this.isMarker(x, y)) { return '+' }
    return g
  }

  this.makeStyle = function (x, y, glyph, selection) {
    let f = this.seequencer.f
    if(this.isCursor(x,y)) {
      if(this.isCurrentCursor(x,y) ){
        return f % 6 === 0 || f % 6 === 1 || f % 6 === 2 ? 0:10
      } else {
        return 10 
      }
    }
  
    if (this.isSelection(x, y)) {
      if (this.isSelectionOverlap(x,y)){
        return 1
      } else {
        return 6
      }
    }


    return 9
  }

  this.makeTheme = function (type) {
    // match.
    if (type === 0) { return { bg: this.theme.active.b_med, fg: this.theme.active.background } }
    // _
    if (type === 1) { return { bg: this.theme.active.f_low, fg: this.theme.active.b_inv  } }
    // _
    if (type === 2) { return { bg: this.theme.active.f_low, fg: this.theme.active.b_high } }
    // step cursor
    if (type === 3) { return { bg: this.theme.active.b_low, fg: this.theme.active.f_high } }
    // cursor
    if (type === 4) { return { bg: this.theme.active.f_med, fg: this.theme.active.f_low } }
    // Mark Step inverse.
    if (type === 5) { return { bg: this.theme.active.f_high, fg: this.theme.active.background } }
    // cursor selection scope.
    if (type === 6) { return { fg: this.theme.active.f_low, bg: this.theme.active.b_med } }
    // current cursor.
    if (type === 7) { return { fg: this.theme.active.background} }
    // Block select.
    if (type === 8) { return { bg: this.theme.active.b_med, fg: this.theme.active.f_low } }
    // Black.
    if (type === 10) { return { bg: this.theme.active.background, fg: this.theme.active.f_high } }
    // Default
    return { fg: this.theme.active.background }
  }

  // Canvas

  this.clear = function () {
    this.context.clearRect(0, 0, this.el.width, this.el.height)
  }

  this.drawProgram = function () {
    const selection = this.cursor.read()
    for (let y = 0; y < this.seequencer.h; y++) {
      for (let x = 0; x < this.seequencer.w; x++) {
        const glyph = this.makeGlyph(x, y)
        const style = this.makeStyle(x, y, glyph, selection)
        this.drawSprite(x, y, glyph, style)
      }
    }
  }

  this.drawStroke = function(el){
    let rects
    rects = el.toRect()
    rects.forEach( rect => {
      const r = {
        x: rect.x * this.scale * this.tile.w,
        y: rect.y * this.scale * this.tile.h,
        w: rect.w * this.scale * this.tile.w,
        h: rect.h * this.scale * this.tile.h
      }
      this.context.lineWidth = 1;
      this.context.strokeStyle = this.theme.active.background
      this.context.strokeRect(r.x + 0.5, r.y + 0.5, r.w, r.h)
    })
  }

  this.drawSprite = function (x, y, g, type) {
    const theme = this.makeTheme(type)
    if (theme.bg) {
      const bgrect = { 
        x: x * this.tile.w * this.scale, 
        y: (y) * this.tile.h * this.scale, 
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
      this.context.fillText(g, fgrect.x, fgrect.y)
    }
  }

  this.write = function (text, offsetX, offsetY, limit = 50, type = 2) {
    let x = 0
    while (x < text.length && x < limit - 1) {
      this.drawSprite(offsetX + x, offsetY, text.substr(x, 1), type)
      x += 1
    }
  }

  this.resize = function (force = false) {
    const size = { w: window.innerWidth + 0.5, h: window.innerHeight }
    const tiles = { w: Math.ceil(( size.w) / this.tile.w - 19 ), h: 17 }

    this.crop(tiles.w, tiles.h)

    // Keep cursor in bounds
    if (this.cursor.cursors[this.cursor.active].x >= tiles.w) { this.cursor.cursors[this.cursor.active].x = tiles.w - 1 }
    if (this.cursor.cursors[this.cursor.active].y >= tiles.h) { this.cursor.cursors[this.cursor.active].y = tiles.h - 1 }

    this.el.width = (this.tile.w) * this.seequencer.w * this.scale
    this.el.height = (this.tile.h + 5) * this.seequencer.h * this.scale
    this.el.style.width = `${Math.ceil(this.tile.w * this.seequencer.w)}px`

    this.context.textBaseline = 'bottom'
    this.context.textAlign = 'center'
    this.context.font = `${this.tile.h * 0.75 * this.scale}px input_mono_regular` 

    this.update()
  }

  this.crop = function (w, h) {
    let block = `${this.seequencer}`

    if (h > this.seequencer.h) {
      block = `${block}${`\n${'.'.repeat(this.seequencer.w)}`.repeat((h - this.seequencer.h))}`
    } else if (h < this.seequencer.h) {
      block = `${block}`.split('\n').slice(0, (h - this.seequencer.h)).join('\n').trim()
    }

    if (w > this.seequencer.w) {
      block = `${block}`.split('\n').map((val) => { return val + ('.').repeat((w - this.seequencer.w)) }).join('\n').trim()
    } else if (w < this.seequencer.w) {
      block = `${block}`.split('\n').map((val) => { return val.substr(0, val.length + (w - this.seequencer.w)) }).join('\n').trim()
    }

    // this.history.reset()
    this.seequencer.load(w, h, block, this.seequencer.f)
  }

  // Helpers

  function display (str, f, max) { return str.length < max ? str : str.slice(f % str.length) + str.substr(0, f % str.length) }
  function clamp (v, min, max) { return v < min ? min : v > max ? max : v }
}


module.exports = Canvas