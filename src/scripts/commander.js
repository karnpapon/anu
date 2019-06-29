'use strict'

function Commander (canvas) {
  this.isActive = false
  this.query = ''
  this.history = []
  this.historyIndex = 0
  this.altFlag = false
  this.tabFlag = false
  this.switchFlag = false
  this.switchCounter = 0

  /*#region*/
  // Library

  // this.passives = {
  //   'find': (p) => { canvas.cursor.find(p.str) },
  //   'select': (p) => { canvas.cursor.select(p.x, p.y, p.w, p.h) },
  //   'inject': (p) => { canvas.cursor.select(p._x, p._y); canvas.source.inject(p._str, false) },
  //   'write': (p) => { canvas.cursor.select(p._x, p._y, p._str.length) }
  // }

  // this.actives = {
  //   // Ports
  //   'osc': (p) => { canvas.io.osc.select(p.int) },
  //   'udp': (p) => { canvas.io.udp.select(p.int) },
  //   'ip': (p) => { canvas.io.setIp(p.str) },
  //   // Cursor
  //   'copy': (p) => { canvas.cursor.copy() },
  //   'paste': (p) => { canvas.cursor.paste(true) },
  //   'erase': (p) => { canvas.cursor.erase() },
  //   // Controls
  //   'play': (p) => { canvas.clock.play() },
  //   'stop': (p) => { canvas.clock.stop() },
  //   'run': (p) => { canvas.run() },
  //   // Speed
  //   'apm': (p) => { canvas.clock.set(null, p.int) },
  //   'bpm': (p) => { canvas.clock.set(p.int, p.int, true) },
  //   'time': (p) => { canvas.clock.setFrame(p.int) },
  //   'rewind': (p) => { canvas.clock.setFrame(canvas.orca.f - p.int) },
  //   'skip': (p) => { canvas.clock.setFrame(canvas.orca.f + p.int) },
  //   // Effects
  //   'rot': (p) => { canvas.cursor.rotate(p.int) },
  //   // Themeing
  //   'color': (p) => { canvas.theme.set('b_med', p.parts[0]); canvas.theme.set('b_inv', p.parts[1]); canvas.theme.set('b_high', p.parts[2]) },
  //   'graphic': (p) => { canvas.theme.setImage(canvas.source.locate(p.str + '.jpg')) },
  //   // Edit
  //   'find': (p) => { canvas.cursor.find(p.str) },
  //   'select': (p) => { canvas.cursor.select(p.x, p.y, p.w, p.h) },
  //   'inject': (p) => { canvas.cursor.select(p._x, p._y); canvas.source.inject(p._str, true) },
  //   'write': (p) => { canvas.cursor.select(p._x, p._y, p._str.length); canvas.cursor.writeBlock([p._str.split('')]) }
  // }

  /* #endregion*/

  // Make shorthands
  // for (const id in this.actives) {
  //   this.actives[id.substr(0, 2)] = this.actives[id]
  // }

  function Param (val) {
    this.str = `${val}`
    this.length = this.str.length
    this.chars = this.str.split('')
    this.int = !isNaN(val) ? parseInt(val) : null
    this.parts = val.split(';')
    this.x = parseInt(this.parts[0])
    this.y = parseInt(this.parts[1])
    this.w = parseInt(this.parts[2])
    this.h = parseInt(this.parts[3])
    // Optionals Position Style
    this._str = this.parts[0]
    this._x = parseInt(this.parts[1])
    this._y = parseInt(this.parts[2])
  }

  // Begin

  this.start = function (q = '') {
    this.isActive = true
    this.query = q
    canvas.update()
  }

  this.stop = function () {
    this.isActive = false
    this.query = ''
    this.historyIndex = this.history.length
    canvas.update()
  }

  this.erase = function () {
    this.query = this.query.slice(0, -1)
    // this.preview()
  }

  this.write = function (key) {
    if (key.length !== 1) { return }
    this.query += key
    // this.preview()
  }

  this.run = function () {
    const tool = this.isActive === true ? 'commander' : 'cursor'
    canvas[tool].trigger()
    canvas.update()
  }

  /*#region */

  this.trigger = function (msg = this.query, touch = true) {
    // const cmd = `${msg}`.split(':')[0].toLowerCase()
    // const val = `${msg}`.substr(cmd.length + 1)
    // if (!this.actives[cmd]) { console.warn('Commander', `Unknown message: ${msg}`); this.stop(); return }
    // console.info('Commander trigger', msg)
    // this.actives[cmd](new Param(val), true)
    // if (touch === true) {
    //   this.history.push(msg)
    //   this.historyIndex = this.history.length
    //   this.stop()
    // }
  }

  /*#endregion */

  // Events

  this.onKeyDown = function (event) {

    if ((event.key === "Enter") && seeq.console.isInputFocused ) {
      seeq.console.runCmd("content")
      event.preventDefault()
      return
    }

    if ((event.key === "Enter") && seeq.console.isFindFocused) {
      seeq.console.runCmd("find")
      event.preventDefault()
      return
    }

    // if ((event.key === "Enter") && seeq.console.isRegExpFocused) {
    //   seeq.console.runCmd("regex")
    //   event.preventDefault()
    //   return
    // }

    if ((event.metaKey || event.ctrlKey) && event.key === 'Backspace') {
      canvas.eraseSelection()
      event.preventDefault()
      return
    }
     // insert.
     if (event.keyCode === 73 && (event.metaKey || event.ctrlKey)) { 
      seeq.console.isInsertable = !seeq.console.isInsertable
      seeq.console.toggleInsert()
      event.preventDefault(); 
      return 
    }

    if (event.keyCode === 38) { this.onArrowUp(event.shiftKey, (event.metaKey || event.ctrlKey)); return }
    if (event.keyCode === 40) { this.onArrowDown(event.shiftKey, (event.metaKey || event.ctrlKey)); return }
    if (event.keyCode === 37) { this.onArrowLeft(event.shiftKey, (event.metaKey || event.ctrlKey)); return }
    if (event.keyCode === 39) { this.onArrowRight(event.shiftKey, (event.metaKey || event.ctrlKey)); return }

    if (event.shiftKey && event.keyCode === 13) { 
      canvas.stepcounter.range() 
      canvas.stepcounter.isSelected = !canvas.stepcounter.isSelected; 
      return 
    }

    // add step.
    if (event.shiftKey && event.keyCode === 187) { 
      if(!canvas.stepcounter.isSelected){
        canvas.stepcursor.remove()  
        canvas.stepcursor.add();
        canvas.stepcounter.range();
        canvas.stepcounter.isSelected = true; 
      } else {
        canvas.stepcursor.add() 
      }
      return 
    }

    // remove step
    if (event.shiftKey && event.keyCode === 189) { 
      canvas.stepcursor.remove() 
      return 
    }

    if (event.altKey) { 
      this.altFlag = true
      event.preventDefault(); 
    }

    // switch cursor.
    if (event.keyCode === 9 && this.altFlag) { 
      this.switchFlag = true
      this.switchCounter += 1
      event.preventDefault(); 
      return 
    }

    // new cursor.
    if (event.keyCode === 78 && (event.metaKey || event.ctrlKey)) { 
      canvas.globalIdx += 1
      canvas.cursor.add(); 
      event.preventDefault(); 
      return 
    }

    // switch cursor.
    if (event.keyCode === 50 && (event.metaKey || event.ctrlKey)) { 
      canvas.cursor.switch(1); 
      event.preventDefault(); 
      return 
    }

    if (event.metaKey) { return }
    if (event.ctrlKey) { return }

    if (event.key === ' ' ) { canvas.clock.togglePlay(); event.preventDefault(); return }

    if (event.key === 'Escape') { 
      // canvas.toggleGuide(false); 
      canvas.commander.stop(); 
      canvas.clear(); 
      canvas.isPaused = false; 
      canvas.cursor.reset(); 
      return 
    }

    if (event.key === '>') { canvas.clock.mod(1); event.preventDefault(); return }
    if (event.key === '<') { canvas.clock.mod(-1); event.preventDefault(); return }
  }

  this.onKeyUp = function (event) {

    if( this.switchFlag ){ 
      if( this.switchFlag && this.altFlag){ 
        canvas.cursor.switch(this.switchCounter % canvas.cursor.cursors.length)
        this.altFlag = false
      } else {
        this.switchFlag = false
      }
    }
    
    canvas.update()
  }

  this.onArrowUp = function (mod = false, skip = false) {
   
    const leap = skip ? canvas.grid.h : 1
    if (mod) {
      canvas.cursor.scale(0, leap)
    } else {
      canvas.cursor.move(0, leap)
    }
  }

  this.onArrowDown = function (mod = false, skip = false) {
    const c = canvas.cursor.cursors.filter( cs => cs.i === canvas.cursor.active)
    let leap 
    if(!canvas.isSelectionAtEdgeBottom(c[0])){
      // const leap = skip ? canvas.grid.h : 1
      if(skip){
        if(c[0].y + c[0].h + canvas.grid.h > canvas.seequencer.h){ 
          leap = canvas.seequencer.h  % ( c[0].y + c[0].h )
        } else { leap = canvas.grid.h }
      } else {
        leap = 1
      }

      if (mod) {
        canvas.cursor.scale(0, -leap)
      } else {
        canvas.cursor.move(0, -leap)
      }
    }
  }

  this.onArrowLeft = function (mod = false, skip = false) {
    const leap = skip ? canvas.grid.w : 1
    if (mod) {
      canvas.cursor.scale(-leap, 0)
    } else {
      canvas.cursor.move(-leap, 0)
    }
  }

  this.onArrowRight = function (mod = false, skip = false) {
    const c = canvas.cursor.cursors.filter( cs => cs.i === canvas.cursor.active)
    let leap
    if(!canvas.isSelectionAtEdgeRight(c[0])){
      if(skip){
        if(c[0].x + c[0].w + canvas.grid.w > canvas.seequencer.w){ 
          leap = canvas.seequencer.w  % ( c[0].x + c[0].w )
        } else { leap = canvas.grid.w }
      } else {
        leap = 1
      }

      if (mod) {
        canvas.cursor.scale(leap, 0)
      } else {
        canvas.cursor.move(leap, 0)
      }
    }
  }

  // Events

  document.onkeydown = (event) => { this.onKeyDown(event) }
  document.onkeyup = (event) => { this.onKeyUp(event) }

  // UI

  this.toString = function () {
    return `${this.query}`
  }
}


module.exports = Commander