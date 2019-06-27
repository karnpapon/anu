'use strict'

function Terminal () {

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
  // this.io = new IO(this)

  this.dataMockup = `Extratone is basically a form of extreme sound art,”explains a London-based artist and Slime City label owner who has identified himself as Rick.
He operates under various aliases, like Zara Skumshot and Skat Injector.“It’s not about pounding kicks, but kicks so fast they have morphed into a tonal beast.
they’ve mutated into a whole different animal. A natural process of evolution.It reminds me at times of such genres as harsh noise and HWN in places depending on production.
The production of course is more varied and peppered with additional elements such as synths and sampling.That’s the thing with difficult music,” admits Neil LAR, founder of U.K.-based label Legs Akimbo Records, an imprint that wound down operations indefinitely on December 31, 2017. “It can be a very rewarding, but also a very harsh experience. You will find both extreme, ear-bleeding distortion and sublimely clean, intricate sound design within the extratone scene. It’s far more diverse than, say, the standard Frenchcore sound.`

  // Themes
  this.theme = new Theme({ 
    background: '#000000', //black
    f_high: '#FFFFFF',  //almost white
    f_med: '#e6e6e6', // grey
    f_low: '#000000',  //black
    f_inv: '#D1FF00', // purple-ish
    b_high: '#eeeeee', //grey-white.
    b_med: '#3EFB00',  // green
    b_low: '#00FFD4', // grey-black
    b_inv: '#69DA44'  // selection
  })

  this.el = document.createElement('canvas')
  this.context = this.el.getContext('2d')

  // Settings
  this.p = []
  this.prevRegExInput = ""
  this.grid = { w: 8, h: 8 }
  this.tile = { w: 7, h: 14 }
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
    // this.io.start()
    this.source.start()
    this.clock.start()
    this.dataInstall()
    this.update()
    this.el.className = 'ready'
  }

  this.run = function () {
    // this.io.clear()
    // this.io.run()
    this.clock.run()
    this.source.run()
    this.seequencer.run()
    this.stepcounter.run()
    this.update()
  }
  
  this.update = function () {
    if (document.hidden === true) { return }
    this.clear()
    this.drawProgram()
    this.stepcursor.run()
    this.drawStroke(this.cursor)
    seeq.isRegExpSearching? this.match():() => {}
  }

  this.reset = function () {
    this.theme.reset()
  }

  this.setGrid = function (w, h) {
    this.grid.w = w
    this.grid.h = h
    this.update()
  }

  this.dataInstall = function () {
    for (var i = 0; i < this.dataMockup.length; i++) {
      this.cursor.write(this.dataMockup.charAt(i))
      this.cursor.cursors[this.cursor.active].x++
      if (this.cursor.cursors[this.cursor.active].x % this.seequencer.w === 0) {
        this.cursor.cursors[this.cursor.active].x = 0
        this.cursor.cursors[this.cursor.active].y++
      }
    }
  }

  this.match = function () {
    terminal.p.forEach((item, i) => {
      let g = terminal.seequencer.glyphAt(item.x, item.y)
      if (this.seequencer.inBlock(item.x, item.y)) {
        terminal.drawSprite(item.x, item.y, g, 0) // trigger background
        const r = {
          x: item.x * this.scale * this.tile.w,
          y: item.y * this.scale * this.tile.h,
          w: 1 * this.scale * this.tile.w,
          h: 1 * this.scale * this.tile.h
        }
        this.context.lineWidth = 1;
        this.context.strokeStyle = this.theme.active.background
        this.context.strokeRect(r.x, r.y, r.w, r.h)
      } else {
        terminal.drawSprite(item.x, item.y, g, 0) //match marked.
      }
    })
  }

  /* #region unused */
  // this.toggleRetina = function () {
  //   this.scale = this.scale === 1 ? window.devicePixelRatio : 1
  //   console.log('Terminal', `Pixel resolution: ${this.scale}`)
  //   this.resize(true)
  // }

  // this.toggleHardmode = function () {
  //   this.hardmode = this.hardmode !== true
  //   console.log('Terminal', `Hardmode: ${this.hardmode}`)
  //   this.update()
  // }

  // this.toggleGuide = function (force = null) {
  //   const display = force !== null ? force : this.guide !== true
  //   if (display === this.guide) { return }
  //   console.log('Terminal', `Toggle Guide: ${display}`)
  //   this.guide = display
  //   this.update()
  // }

  // this.reqGuide = function () {
  //   const session = this.source.recall('session')
  //   console.log('Terminal', 'Session #' + session)
  //   if (!session || parseInt(session) < 20) { return true }
  //   return false
  // }

  // this.modGrid = function (x = 0, y = 0) {
  //   const w = clamp(this.grid.w + x, 4, 16)
  //   const h = clamp(this.grid.h + y, 4, 16)
  //   this.setGrid(w, h)
  // }

  // this.modZoom = function (mod = 0, reset = false) {
  //   this.tile = {
  //     w: reset ? 10 : this.tile.w * (mod + 1),
  //     h: reset ? 15 : this.tile.h * (mod + 1)
  //   }
  //   localStorage.setItem('tilew', this.tile.w)
  //   localStorage.setItem('tileh', this.tile.h)
  //   this.resize(true)
  // }

  //
  /* #endregion*/

  this.isCursor = function (x, y) {
    return this.cursor.cursors.some( cs => x === cs.x && y === cs.y)
  }

  this.isCurrentCursor = function(x,y){
    return this.cursor.cursors.some( cs => x === cs.x && y === cs.y && cs.i === this.cursor.active)
  }

  this.isSelection = function (x, y) {
    return !!( this.cursor.cursors.some( cs => x >= cs.x && x < cs.x + cs.w && y >= cs.y && y < cs.y + cs.h )  )
  }

  // this.isInSelectionScope = function(el){
  //   return !!( el.some( cs => x >= cs.x && x < cs.x + cs.w && y >= cs.y && y < cs.y + cs.h )  )
  // }

  this.isMarker = function (x, y) {
    return x % this.grid.w === 0 && y % this.grid.h === 0
  }

  // this.isNear = function (x, y) {
  //   return x > (parseInt(this.cursor.x / this.grid.w) * this.grid.w) - 1 && x <= ((1 + parseInt(this.cursor.x / this.grid.w)) * this.grid.w) && y > (parseInt(this.cursor.y / this.grid.h) * this.grid.h) - 1 && y <= ((1 + parseInt(this.cursor.y / this.grid.h)) * this.grid.h)
  // }

  // this.isAligned = function (x, y) {
  //   return x === this.cursor.x || y === this.cursor.y
  // }

  this.isEdge = function (x, y) {
    return x === 0 || y === 0 || x === this.seequencer.w - 1 || y === this.seequencer.h - 1
  }

  // this.isLocals = function (x, y) {
  //   return this.isNear(x, y) === true && (x % (this.grid.w / 4) === 0 && y % (this.grid.h / 4) === 0) === true
  // }

  /* #region unused */
  // this.portAt = function (x, y) {
  //   return this.ports[this.seequencer.indexAt(x, y)]
  // }

  // this.findPorts = function () {
  //   const a = new Array((this.seequencer.w * this.seequencer.h) - 1)
  //   for (const id in this.seequencer.runtime) {
  //     const operator = this.seequencer.runtime[id]
  //     if (this.seequencer.lockAt(operator.x, operator.y)) { continue }
  //     const ports = operator.getPorts()
  //     for (const i in ports) {
  //       const port = ports[i]
  //       const index = this.seequencer.indexAt(port[0], port[1])
  //       a[index] = port
  //     }
  //   }
  //   return a
  // }
  /* #endregion*/

  // Interface

  this.makeGlyph = function (x, y) {
    let cursor = this.cursor.cursors
    const g = this.seequencer.glyphAt(x, y)
    if (g !== '.' ) { 
      if( this.isCursor(x,y)){
        // for(const id in cursor ){ 
        //   return cursor[id].i.toString() 
        // }
        return "*"
      } else {
        return g 
      }
    }

    if (this.isCursor(x, y)) { 
      // for(const id in cursor ){ 
        // return cursor[id].i.toString() 
      // }
      return '*'
    }

    if (this.isMarker(x, y)) { return '+' }
    return g
  }

  this.makeStyle = function (x, y, glyph, selection) {
    // const isLocked = this.seequencer.lockAt(x, y)
    // const port = this.ports[this.seequencer.indexAt(x, y)]
    let f = this.seequencer.f
    if(this.isCursor(x,y)) {
      if(this.isCurrentCursor(x,y) ){
        return f % 6 === 0 || f % 6 === 1 || f % 6 === 2 ? 0:10
      } else {
        return 10 
      }
    }
    if (this.isSelection(x, y)) { return 6}
    // if (!port && glyph === '.' && isLocked === false && this.hardmode === true) { return this.isLocals(x, y) === true ? 9 : 7 }
    // if (selection === glyph && isLocked === false && selection !== '.') { return 6 }
    // if (glyph === '*' && isLocked === false) { return 6 }
    // if (isLocked === true) { return 5 }
    return 9
  }

  this.makeTheme = function (type) {
    // match.
    if (type === 0) { return { bg: this.theme.active.b_med, fg: this.theme.active.background } }
    // _
    if (type === 1) { return { bg: this.theme.active.f_high, fg: this.theme.active.f_low  } }
    // _
    if (type === 2) { return { bg: this.theme.active.f_low, fg: this.theme.active.b_high } }
    // step cursor
    if (type === 3) { return { bg: this.theme.active.b_low, fg: this.theme.active.f_high } }
    // cursor
    if (type === 4) { return { bg: this.theme.active.f_med, fg: this.theme.active.f_low } }
    // Mark Step inverse.
    if (type === 5) { return { bg: this.theme.active.f_high, fg: this.theme.active.background } }
    // cursor selection scope.
    if (type === 6) { return { fg: this.theme.active.b_inv } }
    // current cursor.
    if (type === 7) { return { fg: this.theme.active.background} }
    // Block select.
    if (type === 8) { return { bg: this.theme.active.b_med, fg: this.theme.active.f_low } }
    // Black.
    if (type === 10) { return { bg: this.theme.active.background, fg: this.theme.active.f_high } }
    // Default
    return { fg: this.theme.active.f_low }
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
      this.context.strokeRect(r.x, r.y, r.w, r.h)
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

  // Resize tools

  // this.fit = function () {
  //   const size = { w: (this.seequencer.w * this.tile.w) + 60, h: (this.seequencer.h * this.tile.h) + 60 + (2 * this.tile.h) }
  //   const win = require('electron').remote.getCurrentWindow()
  //   const winSize = win.getSize()
  //   const current = { w: winSize[0], h: winSize[1] }
  //   if (current.w === size.w && current.h === size.h) { console.warn('Terminal', 'No resize required.'); return }
  //   console.log('Source', `Fit terminal for ${this.seequencer.w}x${this.seequencer.h}(${size.w}x${size.h})`)
  //   win.setSize(parseInt(size.w), parseInt(size.h), false)
  //   this.resize()
  // }

  this.resize = function (force = false) {
    const size = { w: window.innerWidth - 56, h: window.innerHeight - (60 + this.tile.h * 2) }
    const tiles = { w: Math.ceil(size.w / this.tile.w - 14 ), h: 17 }

    // if (this.seequencer.w === tiles.w && this.seequencer.h === tiles.h && force === false) { return }

    // Limit Tiles to Bounds
    // const bounds = this.seequencer.bounds()
    // if (tiles.w <= bounds.w) { tiles.w = bounds.w + 1 }
    // if (tiles.h <= bounds.h) { tiles.h = bounds.h + 1 }
    this.crop(tiles.w, tiles.h)

    // Keep cursor in bounds
    if (this.cursor.cursors[this.cursor.active].x >= tiles.w) { this.cursor.cursors[this.cursor.active].x = tiles.w - 1 }
    if (this.cursor.cursors[this.cursor.active].y >= tiles.h) { this.cursor.cursors[this.cursor.active].y = tiles.h - 1 }

    this.el.width = (this.tile.w) * this.seequencer.w * this.scale
    this.el.height = (this.tile.h) * this.seequencer.h * this.scale
    this.el.style.width = `${Math.ceil(this.tile.w * this.seequencer.w)}px`
    // this.el.style.height = `100%`
    // this.el.style.width = `100%`
    // this.el.style.height = `${Math.ceil((this.tile.h + (this.tile.h / 5)) * this.seequencer.h)}px`

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


module.exports = Terminal