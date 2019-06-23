'use strict'

function Terminal () {

  const Theme = require('./lib/theme')
  const Seequencer = require('./seequencer')
  const Commander = require('./commander')
  const Cursor = require('./cursor')
  const Source = require('./source')
  const Clock = require('./clock')

  // this.version = 141
  // this.library = library

  this.seequencer = new Seequencer(this)
  this.cursor = new Cursor(this)
  this.source = new Source(this)
  this.commander = new Commander(this)
  this.clock = new Clock(this)
  // this.history = new History()
  // this.controller = new Controller()

  this.dataMockup = `Extratone is basically a form of extreme sound art,”explains a London-based artist and Slime City label owner who has identified himself as Rick.
He operates under various aliases, like Zara Skumshot and Skat Injector.“It’s not about pounding kicks, but kicks so fast they have morphed into a tonal beast.
they’ve mutated into a whole different animal. A natural process of evolution.It reminds me at times of such genres as harsh noise and HWN in places depending on production.
The production of course is more varied and peppered with additional elements such as synths and sampling.That’s the thing with difficult music,” admits Neil LAR, founder of U.K.-based label Legs Akimbo Records, an imprint that wound down operations indefinitely on December 31, 2017. “It can be a very rewarding, but also a very harsh experience. You will find both extreme, ear-bleeding distortion and sublimely clean, intricate sound design within the extratone scene. It’s far more diverse than, say, the standard Frenchcore sound.`

  // Themes
  this.theme = new Theme({ 
    background: '#000000', 
    f_high: '#ffffff', 
    f_med: '#777777', 
    f_low: '#000000', 
    f_inv: '#000000', 
    b_high: '#eeeeee', 
    b_med: '#3EFB00', 
    b_low: '#444444', 
    b_inv: '#ffb545' 
  })

  this.el = document.createElement('canvas')
  this.context = this.el.getContext('2d')

  // Settings
  this.isStepRun = false
  this.stepCursor = {x: 0, y: 0}
  this.grid = { w: 8, h: 8 }
  this.tile = { w: 7, h: 14 }
  this.scale = window.devicePixelRatio
  this.hardmode = true
  this.guide = false

  this.install = function (host) {
    host.appendChild(this.el)
    this.theme.install(host)
  }

  this.start = function () {
    this.theme.start()
    // this.io.start()
    this.source.start()
    // this.history.bind(this.seequencer, 's')
    // this.history.record(this.seequencer.s)
    // this.clock.start()
    this.el.className = 'ready'
    this.dataInstall()
    this.update()
   
    // this.toggleGuide(this.reqGuide() === true)
  }

  this.dataInstall = function(){
    for (var i = 0; i < this.dataMockup.length; i++) {
      terminal.cursor.write(this.dataMockup.charAt(i))
      terminal.cursor.x++
      if(terminal.cursor.x % this.seequencer.w === 0){
        terminal.cursor.x = 0
        terminal.cursor.y++ 
      }
    }
  }

  this.match = function(){
    let p = []
    seeq.matchedPosition.forEach(pos => { 
      // words matching.
      if(pos.len > 0){
        let len = 0
        for(var i=0; i<pos.len;i++){
          p.push(terminal.seequencer.posAt(pos.index + len)) 
          len++
        }
      } else {
        // letter matching.
        p.push(terminal.seequencer.posAt(pos.index))
      }
    })

    p.forEach( ( item, i ) =>  {
      let g = terminal.seequencer.glyphAt(item.x, item.y)
      // if overlapped position found draw other sprite style.
      if(this.seequencer.inBlock(item.x, item.y)){
        terminal.drawSprite(item.x,item.y,g, 3)
      } else {
        terminal.drawSprite(item.x,item.y,g, 0)
      }
    })
  }

  this.run = function () {
    // this.io.clear()
    this.clock.run()
    this.source.run()
    this.seequencer.run()
    // this.io.run()
    this.update()
    this.runStepCursor()
  }
  
  this.update = function () {
    if (document.hidden === true) { return }
    this.clear()
    // this.ports = this.findPorts()
    this.drawProgram()
    this.match()
    // this.drawInterface()
    // this.drawGuide()
  }

  this.reset = function () {
    this.theme.reset()
  }

  this.setGrid = function (w, h) {
    this.grid.w = w
    this.grid.h = h
    this.update()
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
    return x === this.cursor.x && y === this.cursor.y
  }

  this.isSelection = function (x, y) {
    return !!(x >= this.cursor.x && x < this.cursor.x + this.cursor.w && y >= this.cursor.y && y < this.cursor.y + this.cursor.h)
  }

  this.isMarker = function (x, y) {
    return x % this.grid.w === 0 && y % this.grid.h === 0
  }

  this.isNear = function (x, y) {
    return x > (parseInt(this.cursor.x / this.grid.w) * this.grid.w) - 1 && x <= ((1 + parseInt(this.cursor.x / this.grid.w)) * this.grid.w) && y > (parseInt(this.cursor.y / this.grid.h) * this.grid.h) - 1 && y <= ((1 + parseInt(this.cursor.y / this.grid.h)) * this.grid.h)
  }

  this.isAligned = function (x, y) {
    return x === this.cursor.x || y === this.cursor.y
  }

  this.isEdge = function (x, y) {
    return x === 0 || y === 0 || x === this.seequencer.w - 1 || y === this.seequencer.h - 1
  }

  this.isLocals = function (x, y) {
    return this.isNear(x, y) === true && (x % (this.grid.w / 4) === 0 && y % (this.grid.h / 4) === 0) === true
  }

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
    const g = this.seequencer.glyphAt(x, y)
    if (g !== '.') { return g }
    if (this.isCursor(x, y)) { return ' ' }
    if (this.isMarker(x, y)) { return '+' }
    return g
  }

  this.makeStyle = function (x, y, glyph, selection) {
    const isLocked = this.seequencer.lockAt(x, y)
    // const port = this.ports[this.seequencer.indexAt(x, y)]
    if (this.isSelection(x, y)) { return 4}
    // if (!port && glyph === '.' && isLocked === false && this.hardmode === true) { return this.isLocals(x, y) === true ? 9 : 7 }
    // if (selection === glyph && isLocked === false && selection !== '.') { return 6 }
    // if (glyph === '*' && isLocked === false) { return 6 }
    // if (port) { return port[2] }
    // if (isLocked === true) { return 5 }
    return 9
  }

  this.makeTheme = function (type) {
    // match.
    if (type === 0) { return { bg: this.theme.active.b_med, fg: this.theme.active.f_low } }
    // Haste
    if (type === 1) { return { bg: this.theme.active.b_inv } }
    // Input
    if (type === 2) { return { fg: this.theme.active.b_high } }
    // step cursor
    if (type === 3) { return { bg: this.theme.active.b_low, fg: this.theme.active.f_high } }
    // cursor
    if (type === 4) { return { bg: this.theme.active.b_inv, fg: this.theme.active.f_inv } }
    // Locked
    if (type === 5) { return { fg: this.theme.active.f_med } }
    // Reader
    if (type === 6) { return { fg: this.theme.active.b_inv } }
    // Invisible
    if (type === 7) { return {} }
    // Reader
    if (type === 8) { return { bg: this.theme.active.b_low, fg: this.theme.active.f_high } }
    // Reader+Background
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

  this.runStepCursor = function(){
    this.isStepRun = !terminal.seequencer.isPaused
    if( this.isStepRun){
      if(!terminal.clock.isPaused){ this.stepCursorBoundary()}
      this.drawSprite(this.stepCursor.x, this.stepCursor.y, this.seequencer.glyphAt(this.stepCursor.x, this.stepCursor.y), 3) 
    }
  }

  this.stepCursorBoundary = function(){
    if(this.seequencer.f % this.seequencer.w === 0 && this.seequencer.f !== 0){
      this.stepCursor.x = 0
      this.stepCursor.y++
    } else {
      this.stepCursor.x++
    }
  }

  /* #region unused */
  // this.drawInterface = function () {
  //   const col = this.grid.w
  //   const variables = Object.keys(this.seequencer.variables).join('')
  //   const col1 = this.seequencer.h
  //   const col2 = this.seequencer.h + 1

    // console detail info section.
    // if (this.commander.isActive === true) {
      // this.write(`${this.commander.query}${this.seequencer.f % 2 === 0 ? '_' : ''}`, col * 0, this.seequencer.h + 1, this.grid.w * 2, 9)
    // } else {
      // this.write(`${this.cursor.x},${this.cursor.y}${this.cursor.mode === 1 ? '+' : ''}`, col * 0, this.seequencer.h + 1, this.grid.w, 9) // 0,0
      // this.write(`${this.cursor.w}:${this.cursor.h}`, col * 1, this.seequencer.h + 1, this.grid.w, 9) // 1:1
      // this.write(`${this.cursor.inspect()}`, col * 2, this.seequencer.h + 1, this.grid.w, 9) //empty
      // this.write(`${this.seequencer.f}f${this.isPaused ? '*' : ''}`, col * 3, this.seequencer.h + 1, this.grid.w, 9) //0f
    // }

    // this.write(`${this.seequencer.w}x${this.seequencer.h}`, col * 0, this.seequencer.h, this.grid.w,9) // 64x33
    // this.write(`${this.grid.w}/${this.grid.h}${this.tile.w !== 10 ? ' ' + (this.tile.w / 10).toFixed(1) : ''}`, col * 1, this.seequencer.h, this.grid.w,9) // 8/8
    // this.write(`${this.source}`, col * 2, this.seequencer.h, this.grid.w, 9) // unsaved
    // this.write(`${this.clock}`, col * 3, this.seequencer.h, this.grid.w, this.io.midi.inputIndex > -1 ? 3 : 2)

    // if (this.seequencer.f < 15) {
      // this.write(`${this.io.midi}`, col * 4, this.seequencer.h, this.grid.w * 2)
      // this.write(`Version ${this.version}`, col * 4, this.seequencer.h + 1, this.grid.w * 2, 9)
    // } else {
      // this.write(`${this.io.inspect(this.grid.w)}`, col * 4, this.seequencer.h, this.grid.w)
      // this.write(`${display(variables, this.seequencer.f, this.grid.w)}`, col * 4, this.seequencer.h + 1, this.grid.w, 9)
    // }
  // }

  // this.drawGuide = function () {
  //   if (this.guide !== true) { return }
  //   const operators = Object.keys(this.library).filter((val) => { return isNaN(val) })
  //   for (const id in operators) {
  //     const key = operators[id]
  //     const oper = new this.library[key]()
  //     const text = oper.info
  //     const frame = this.seequencer.h - 4
  //     const x = (Math.floor(parseInt(id) / frame) * 32) + 2
  //     const y = (parseInt(id) % frame) + 2
  //     this.write(key, x, y, 99, 3)
  //     this.write(text, x + 2, y, 99, 10)
  //   }
  // }
  /* #endregion*/

  this.drawSprite = function (x, y, g, type) {
    const theme = this.makeTheme(type)
    if (theme.bg) {
      const bgrect = { x: x * this.tile.w * this.scale, y: (y) * this.tile.h * this.scale, w: this.tile.w * this.scale, h: this.tile.h * this.scale }
      this.context.fillStyle = theme.bg
      this.context.fillRect(bgrect.x, bgrect.y, bgrect.w, bgrect.h)
    }
    if (theme.fg) {
      const fgrect = { x: (x + 0.5) * this.tile.w * this.scale, y: (y + 1) * this.tile.h * this.scale, w: this.tile.w * this.scale, h: this.tile.h * this.scale }
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
    const size = { w: window.innerWidth - 40, h: window.innerHeight - (this.tile.h) }
    const tiles = { w: Math.ceil(size.w / this.tile.w - 17 ), h: 17 }

    // if (this.seequencer.w === tiles.w && this.seequencer.h === tiles.h && force === false) { return }

    // Limit Tiles to Bounds
    // const bounds = this.seequencer.bounds()
    // if (tiles.w <= bounds.w) { tiles.w = bounds.w + 1 }
    // if (tiles.h <= bounds.h) { tiles.h = bounds.h + 1 }
    this.crop(tiles.w, tiles.h)

    // Keep cursor in bounds
    if (this.cursor.x >= tiles.w) { this.cursor.x = tiles.w - 1 }
    if (this.cursor.y >= tiles.h) { this.cursor.y = tiles.h - 1 }

    this.el.width = ( this.tile.w) * this.seequencer.w * this.scale
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

  /* #region unused */
  // Docs

  // this.docs = function () {
  //   let html = ''
  //   const operators = Object.keys(library).filter((val) => { return isNaN(val) })
  //   for (const id in operators) {
  //     const oper = new this.library[operators[id]]()
  //     const ports = oper.ports.input ? Object.keys(oper.ports.input).reduce((acc, key, val) => { return acc + ' ' + key }, '') : ''
  //     html += `- \`${oper.glyph.toUpperCase()}\` **${oper.name}**${ports !== '' ? '(' + ports.trim() + ')' : ''}: ${oper.info}.\n`
  //   }
  //   return html
  // }
  // Events

  // window.addEventListener('dragover', (e) => {
  //   e.stopPropagation()
  //   e.preventDefault()
  //   e.dataTransfer.dropEffect = 'copy'
  // })

  // window.addEventListener('drop', (e) => {
  //   e.preventDefault()
  //   e.stopPropagation()

  //   const file = e.dataTransfer.files[0]
  //   const path = file.path ? file.path : file.name

  //   if (!path || path.indexOf('.seequencer') < 0) { console.log('seequencer', 'Not a seequencer file'); return }

  //   terminal.source.read(path)
  // })

  // window.onresize = (event) => {
  //   terminal.resize()
  // }
  /* #endregion*/

  // Helpers

  function display (str, f, max) { return str.length < max ? str : str.slice(f % str.length) + str.substr(0, f % str.length) }
  function clamp (v, min, max) { return v < min ? min : v > max ? max : v }
}


module.exports = Terminal