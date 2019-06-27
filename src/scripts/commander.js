'use strict'

function Commander (terminal) {
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
  //   'find': (p) => { terminal.cursor.find(p.str) },
  //   'select': (p) => { terminal.cursor.select(p.x, p.y, p.w, p.h) },
  //   'inject': (p) => { terminal.cursor.select(p._x, p._y); terminal.source.inject(p._str, false) },
  //   'write': (p) => { terminal.cursor.select(p._x, p._y, p._str.length) }
  // }

  // this.actives = {
  //   // Ports
  //   'osc': (p) => { terminal.io.osc.select(p.int) },
  //   'udp': (p) => { terminal.io.udp.select(p.int) },
  //   'ip': (p) => { terminal.io.setIp(p.str) },
  //   // Cursor
  //   'copy': (p) => { terminal.cursor.copy() },
  //   'paste': (p) => { terminal.cursor.paste(true) },
  //   'erase': (p) => { terminal.cursor.erase() },
  //   // Controls
  //   'play': (p) => { terminal.clock.play() },
  //   'stop': (p) => { terminal.clock.stop() },
  //   'run': (p) => { terminal.run() },
  //   // Speed
  //   'apm': (p) => { terminal.clock.set(null, p.int) },
  //   'bpm': (p) => { terminal.clock.set(p.int, p.int, true) },
  //   'time': (p) => { terminal.clock.setFrame(p.int) },
  //   'rewind': (p) => { terminal.clock.setFrame(terminal.orca.f - p.int) },
  //   'skip': (p) => { terminal.clock.setFrame(terminal.orca.f + p.int) },
  //   // Effects
  //   'rot': (p) => { terminal.cursor.rotate(p.int) },
  //   // Themeing
  //   'color': (p) => { terminal.theme.set('b_med', p.parts[0]); terminal.theme.set('b_inv', p.parts[1]); terminal.theme.set('b_high', p.parts[2]) },
  //   'graphic': (p) => { terminal.theme.setImage(terminal.source.locate(p.str + '.jpg')) },
  //   // Edit
  //   'find': (p) => { terminal.cursor.find(p.str) },
  //   'select': (p) => { terminal.cursor.select(p.x, p.y, p.w, p.h) },
  //   'inject': (p) => { terminal.cursor.select(p._x, p._y); terminal.source.inject(p._str, true) },
  //   'write': (p) => { terminal.cursor.select(p._x, p._y, p._str.length); terminal.cursor.writeBlock([p._str.split('')]) }
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
    terminal.update()
  }

  this.stop = function () {
    this.isActive = false
    this.query = ''
    this.historyIndex = this.history.length
    terminal.update()
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
    terminal[tool].trigger()
    terminal.update()
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
    /*#region */
    if ((event.metaKey || event.ctrlKey) && event.key === 'Backspace') {
      terminal.eraseSelection()
      event.preventDefault()
      return
    }
     // insert.
     if (event.keyCode === 73 && (event.metaKey || event.ctrlKey)) { 
      seeq.isInsertable = !seeq.isInsertable
      seeq.toggleInsert()
      event.preventDefault(); 
      return 
    }

    if (event.keyCode === 38) { this.onArrowUp(event.shiftKey, (event.metaKey || event.ctrlKey)); return }
    if (event.keyCode === 40) { this.onArrowDown(event.shiftKey, (event.metaKey || event.ctrlKey)); return }
    if (event.keyCode === 37) { this.onArrowLeft(event.shiftKey, (event.metaKey || event.ctrlKey)); return }
    if (event.keyCode === 39) { this.onArrowRight(event.shiftKey, (event.metaKey || event.ctrlKey)); return }

    if (event.shiftKey && event.keyCode === 13) { 
      terminal.stepcounter.range() 
      terminal.stepcounter.isSelected = !terminal.stepcounter.isSelected; 
      return 
    }

    // add step.
    if (event.shiftKey && event.keyCode === 187) { 
      if(!terminal.stepcounter.isSelected){
        terminal.stepcursor.remove()  
        terminal.stepcursor.add();
        terminal.stepcounter.range();
        terminal.stepcounter.isSelected = true; 
      } else {
        terminal.stepcursor.add() 
      }
      return 
    }

    // remove step
    if (event.shiftKey && event.keyCode === 189) { 
      terminal.stepcursor.remove() 
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
      terminal.globalIdx += 1
      terminal.cursor.add(); 
      event.preventDefault(); 
      return 
    }

    // switch cursor.
    if (event.keyCode === 50 && (event.metaKey || event.ctrlKey)) { 
      terminal.cursor.switch(1); 
      event.preventDefault(); 
      return 
    }

    if (event.metaKey) { return }
    if (event.ctrlKey) { return }

    if (event.key === ' ' ) { terminal.clock.togglePlay(); event.preventDefault(); return }

    /*#region */
    // if (event.key === ' ' && terminal.cursor.mode === 1) { terminal.cursor.move(1, 0); event.preventDefault(); return }

    if (event.key === 'Escape') { 
      // terminal.toggleGuide(false); 
      terminal.commander.stop(); 
      terminal.clear(); 
      terminal.isPaused = false; 
      terminal.cursor.reset(); 
      return 
    }
    // if (event.key === 'Backspace') { terminal[this.isActive === true ? 'commander' : 'cursor'].erase(); event.preventDefault(); return }

    if (event.key === '>') { terminal.clock.mod(1); event.preventDefault(); return }
    if (event.key === '<') { terminal.clock.mod(-1); event.preventDefault(); return }

    // Route key to Operator or Cursor
    // terminal[this.isActive === true ? 'commander' : 'cursor'].write(event.key)
    /*#endregion */
  }

  this.onKeyUp = function (event) {

    if( this.switchFlag ){ 
      if( this.switchFlag && this.altFlag){ 
        terminal.cursor.switch(this.switchCounter % terminal.cursor.cursors.length)
        this.altFlag = false
      } else {
        this.switchFlag = false
      }
    }
    
    terminal.update()
  }

  this.onArrowUp = function (mod = false, skip = false) {
   
    const leap = skip ? terminal.grid.h : 1
    if (mod) {
      terminal.cursor.scale(0, leap)
    } else {
      terminal.cursor.move(0, leap)
    }
  }

  this.onArrowDown = function (mod = false, skip = false) {
    const c = terminal.cursor.cursors.filter( cs => cs.i === terminal.cursor.active)
    let leap 
    if(!terminal.isSelectionAtEdgeBottom(c[0])){
      // const leap = skip ? terminal.grid.h : 1
      if(skip){
        if(c[0].y + c[0].h + terminal.grid.h > terminal.seequencer.h){ 
          leap = terminal.seequencer.h  % ( c[0].y + c[0].h )
        } else { leap = terminal.grid.h }
      } else {
        leap = 1
      }

      if (mod) {
        terminal.cursor.scale(0, -leap)
      } else {
        terminal.cursor.move(0, -leap)
      }
    }
  }

  this.onArrowLeft = function (mod = false, skip = false) {
    const leap = skip ? terminal.grid.w : 1
    if (mod) {
      terminal.cursor.scale(-leap, 0)
    } else {
      terminal.cursor.move(-leap, 0)
    }
  }

  this.onArrowRight = function (mod = false, skip = false) {
    const c = terminal.cursor.cursors.filter( cs => cs.i === terminal.cursor.active)
    let leap
    if(!terminal.isSelectionAtEdgeRight(c[0])){
      if(skip){
        if(c[0].x + c[0].w + terminal.grid.w > terminal.seequencer.w){ 
          leap = terminal.seequencer.w  % ( c[0].x + c[0].w )
        } else { leap = terminal.grid.w }
      } else {
        leap = 1
      }

      if (mod) {
        terminal.cursor.scale(leap, 0)
      } else {
        terminal.cursor.move(leap, 0)
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