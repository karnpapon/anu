'use strict'

function Canvas () {
  this.seequencer = new Seequencer(this)
  this.marker = new Marker(this)
  this.commander = new Commander(this)
  this.clock = new Clock(this)
  this.io = new IO(this)
  this.stepcursor = new StepCursor(this)
  this.stepcounter = new StepCounter(this)
  this.texts = ""

  // Themes 9affcc
  this.theme = new Theme({ 
    background: '#000000',
    f_high: '#FFFFFF',  
    f_med: '#e6e6e6', 
    f_low: '#5bd532',  
    f_inv: '#6C00FF', 
    b_high: '#eeeeee', 
    b_med: '#3EFB00',  
    // b_med: '#9affcc',  
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
  this.guide = true
  this.isShowMarked = true
  this.notationMode = false
  this.monoStepMode = false
  this.globalIdx = 0

  // -----------------------------

  this.install = function () {
    loading.wrapperElem.appendChild(this.el)
    this.theme.install(loading.wrapperElem)
    this.resize()
  }

  this.init = function () {
    this.io.start()
    this.clock.start()
    this.marker.start()
    
    this.reset()
    this.writeData()
    this.modZoom()
    this.el.className = 'ready'
    this.resize()
    this.update()
    this.resize()
    this.resize()
    this.resize()
  }

  this.run = function () {
    this.io.clear()
    this.clock.run()
    this.seequencer.run()
    this.stepcounter.run()
    this.update()
    this.stepcursor.trigger()
    this.io.run()
  }
  
  this.update = function () {
    if (document.hidden === true) { return }
    this.clear()
    this.drawProgram()
    this.match()
    this.stepcursor.draw()
    this.drawStroke(this.marker.toRect())
    this.drawGuide()
  }

  this.reset = function () {
    this.resize()
    this.globalIdx = 0 
    this.seequencer.reset()
    this.theme.reset()
    this.marker.reset()
    this.stepcounter.reset()
    this.stepcursor.reset()
  }
  
  // -----------------------------

  this.writeData = function (data = 'Please give some input value and hit return' ) {
    this.texts = data
    let position = this.marker.markers[this.marker.active]
    for (var i = 0; i < this.texts.length; i++) {
      this.marker.write(this.texts.charAt(i))
      position.x++
      if (position.x % this.seequencer.w === 0) {
        position.x = 0
        position.y++
      }
    }
  }

  this.replaceCurrentMarkerBlock = function (glyph = '.') {
    let currentMarker = this.marker.currentMarker()
    for (var x = 0; x < currentMarker.w; x++) {
      for (var y = 0; y < currentMarker.h; y++) {
        this.seequencer.write(currentMarker.x + x, currentMarker.y + y, glyph)

        // modified fetchedData so regex can be properly re-calculated.
        let indexAt = this.seequencer.indexAt(currentMarker.x+x, currentMarker.y + y)
        this.texts = this.texts.substring(0, indexAt ) + glyph + this.texts.substring(indexAt + 1)
      }
    }

    if (client.console.regexInput) { client.handleRegexInput() } // refresh regex matching
  }

  this.match = function () {
    if(this.p.length > 0){
      this.marker.clearMatchedPos() 
      this.p.forEach((item, i) => {
        let g = this.seequencer.glyphAt(item.x, item.y)
        let marker = this.getMarkerAt(item.x, item.y);
        if(this.isWithinMarker(marker)){
          marker.forEach((m) => { 
            m.matched.add(`${item.x}:${item.y}`) 
            this.drawSprite(item.x, item.y, m["control"]["muted"] ? g : BANG_GLYPH, this.isMarkerHead(item.x, item.y) ? 10 : 12) // matched within marker block.
          })
        } else {
          this.drawSprite(item.x, item.y, g, this.isShowMarked? 0:5) // matched not within marker block.
        }
      })
    } else {
      this.marker.clearMatchedPos() 
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
    this.marker.erase()
    this.commander.resetSwitchCounter()
  }

  this.isMarkerHead = function (x, y) {
    return this.marker.markers.some( cs => x === cs.x && y === cs.y)
  }

  this.isCurrentMarker = function(x,y){
    return this.marker.markers.some( cs => x === cs.x && y === cs.y && cs.i === this.marker.markers[ this.marker.active ].i)
  }

  this.getMarkerAt = function (x, y) {
    return this.marker.markers.filter( item => x >= item.x && x < item.x + item.w && y >= item.y && y < item.y + item.h ) 
  }

  this.isOverlapArea = function (x,y){
    // TODO: overlapped areas for muliples marker still display incorrectly.
    return this.marker.markers.some( item => item.overlapAreas.has(`${x}:${y}:${item.overlapIndex.values().next().value}`)) 
    // ||  this.marker.markers.some((item) => item.overlapAreas.has(`${x}:${y}:${this.marker.active}`))
  }

  this.isMutedArea = function (i){
    return this.marker.markers[i]["control"]["muted"];
  }

  this.isMarker = function (x, y) {
    return x % this.grid.w === 0 && y % this.grid.h === 0
  }

  this.isMatchedChar = function(x,y){
    return this.p.some( matched => matched.x === x && matched.y === y)
  }

  this.isEdge = function(x, y) {
    return x === 0 || y === 0 || x === this.seequencer.w - 1 || y === this.seequencer.h - 1
  }

  this.isSelectionAtEdge = function(marker){
    return ( marker.x + marker.w ) - 1  === this.seequencer.w - 1 || ( marker.y + marker.h ) - 1  === this.seequencer.h - 1
  }

  this.isSelectionAtEdgeRight = function(marker){
    return ( marker.x + marker.w ) - 1  === this.seequencer.w - 2 
  }

  this.isSelectionAtEdgeBottom = function(marker){
    return ( marker.y + marker.h ) - 1  === this.seequencer.h - 2
  }

  this.isWithinMarker = function(marker){ return marker.length > 0 }

  this.makeStyle = function (x, y) {
    if(this.isMarkerHead(x,y)) { return this.isCurrentMarker(x,y)? 10:5 }
    let marker = this.getMarkerAt(x, y);
    if(this.isWithinMarker(marker)) { return this.isOverlapArea(x,y)? 1: 12 }
    return 9
  }

  this.makeTheme = function (type) {
    // match.
    if (type === 0) { return { bg: this.theme.active.b_med, fg: this.theme.active.background } }
    // _
    if (type === 1) { return { bg: this.theme.active.f_low, fg: this.theme.active.background  } }
    // _
    if (type === 2) { return { bg: '#4B4B4B', fg: this.theme.active.b_med } }
    // step marker
    if (type === 3) { return { bg: "#919191", fg: this.theme.active.f_high } }
    // marker
    if (type === 4) { return { bg: this.theme.active.f_med, fg: this.theme.active.f_low } }
    // Mark Step inverse.
    if (type === 5) { return { bg: '#B4B4B4', fg: this.theme.active.background } }
    // marker selection scope.
    if (type === 6) { return { fg: this.theme.active.f_low, bg: this.theme.active.b_med } }
    // current marker.
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

  this.isInvisible = (x, y) => {
    return this.seequencer.glyphAt(x, y) === EMPTY_GLYPH
    // && !this.isMarker(x, y) 
    && !this.marker.selected(x, y)
  }

  this.drawProgram = function () {
    for (let y = 0; y < this.seequencer.h; y++) {
      for (let x = 0; x < this.seequencer.w; x++) {
        // if (this.isInvisible(x, y)) { continue }
        const g = this.seequencer.glyphAt(x, y)
        const glyph = g !== EMPTY_GLYPH ? g : this.isMarkerHead(x, y) ? (this.clock.isPaused ? MARKER_PAUSE_GLYPH : MARKER_PLAY_GLYPH) : this.isMarker(x, y) ? MARKER_GLYPH : g
        this.drawSprite(x, y, glyph, this.makeStyle(x, y))
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
      this.context.lineWidth = 2;
      if (rect.i !== this.marker.active) { this.context.setLineDash([5, 5]); }
      else { this.context.setLineDash([]) }
      this.context.strokeStyle = this.theme.active.background
      this.context.strokeRect(r.x + 1.5 , r.y + 1.5 , r.w - 2, r.h - 1.5)
    })
  }

  this.drawGuide = () => {
    if (this.guide !== true) { return }
    if (document.getElementsByClassName("content")[0].clientWidth < 458) { return }
    const operators = Object.keys(LIBRARY).filter((val) => { return isNaN(val) })
    const top_border = this.seequencer.w - 7
    const box = { x: 2, y: 2}

    // top_border
    this.write(`${TOP_BORDER_SYMBOL[0]}${TOP_BORDER_SYMBOL[1].repeat(top_border)}${TOP_BORDER_SYMBOL[2]}`,2, box.y, 99, 11)

    // helps content
    for (const id in operators) {
      const key = operators[id]
      const oper = LIBRARY[key]
      const text = oper.info
      const frame = this.seequencer.h - 4
      const x = (Math.floor(parseInt(id) / frame) * 32) + 2
      const y = (parseInt(id) % frame) + box.y + 1
      const text_line_length = text.length + key.length
      this.write(`${CONTENT_SYMBOL[0]}${SPACE_GLYPH}${key}`, x, y, 99, 11, "input_mono_bold")
      this.write(`:${SPACE_GLYPH}${text}${SPACE_GLYPH.repeat(this.seequencer.w - text_line_length - 10)}${CONTENT_SYMBOL[0]}`, x + key.length + 2, y, 99, 11)
    }

    // bottom_border
    const note_spaces1 = ((this.seequencer.w - LIBRARY_ENDNOTES_1.length) / 2) - 3
    // const note_spaces2 = ((this.seequencer.w - LIBRARY_ENDNOTES_2.length) / 2) - 3
    this.write(`|${SPACE_GLYPH.repeat(this.seequencer.w - 7)}|`,2, operators.length + box.y+1, 99, 11, "input_mono_bold")
    this.write(`|${SPACE_GLYPH.repeat(note_spaces1)}${LIBRARY_ENDNOTES_1}${SPACE_GLYPH.repeat(note_spaces1)}|`,2, operators.length + box.y+2, 99, 11, "input_mono_bold")
    // this.write(`|${SPACE_GLYPH.repeat(note_spaces2)}${LIBRARY_ENDNOTES_2}${SPACE_GLYPH.repeat(note_spaces2)}|`,2, operators.length + box.y+2, 99, 11, "input_mono_bold")
    this.write(`${BOTTOM_BORDER_SYMBOL[0]}${BOTTOM_BORDER_SYMBOL[1].repeat(top_border)}${BOTTOM_BORDER_SYMBOL[2]}`,2, operators.length + box.y+3, 99, 11)
  }

  this.drawSprite = function (x, y, g, type, font_family = "input_mono_regular") {
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
      this.context.font = `${this.tile.h * 0.75 * this.scale}px ${font_family}`
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

  this.write = function (text, offsetX, offsetY, limit = 50, type = 2, font_family = "input_mono_regular") {
    for (let x = 0; x < text.length && x < limit; x++) {
      this.drawSprite(offsetX + x, offsetY, text.substr(x, 1), type, font_family)
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

    const w = this.tile.ws * this.seequencer.w
    const h = (this.tile.hs + (this.tile.hs / 5)) * this.seequencer.h 

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
      block = `${block}${`\n${EMPTY_GLYPH.repeat(this.seequencer.w)}`.repeat(h - this.seequencer.h )}`
    } else if (h < this.seequencer.h) {
      block = `${block}`.split(/\r?\n/).slice(0, (h - this.seequencer.h)).join('\n').trim()
    }
    
    if (w > this.seequencer.w) {
      block = `${block}`.split(/\r?\n/).map((val) => { return val + (EMPTY_GLYPH).repeat((w - this.seequencer.w)) }).join('\n').trim()
    } else if (w < this.seequencer.w) {
      block = `${block}`.split(/\r?\n/).map((val) => { return val.substr(0, val.length + (w - this.seequencer.w)) }).join('\n').trim()
    }
    this.seequencer.load(w, h, block, this.seequencer.f)
  }

  this.toggleNotationMode = function(){
    this.notationMode = !this.notationMode
  }


  window.onresize = (e) => {
    this.resize()
  }
}
