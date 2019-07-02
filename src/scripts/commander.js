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

  this.resetSwitchCounter = function(){
    this.switchCounter = 0
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

    if ((event.key === "Enter") && seeq.displayer.isOscFocused) {
      seeq.displayer.runCmd("input[type='osc']")
      canvas.cursor.setOSCmsg()
      // send OSC
      event.preventDefault()
      return
    }

    if ((event.metaKey || event.ctrlKey) && event.key === 'Backspace' && canvas.cursor.cursors.length > 1) {
      canvas.eraseSelectionCursor()
      event.preventDefault()
      return
    }
     // insert.
     if (event.keyCode === 73 && (event.metaKey || event.ctrlKey)) { 
      seeq.console.isInsertable = !seeq.console.isInsertable
      seeq.console.toggleInsert()
      seeq.displayer.displayDefault()
      event.preventDefault(); 
      return 
    }

    if (event.keyCode === 38 && !seeq.console.isInsertable) { this.onArrowUp(event.shiftKey, (event.metaKey || event.ctrlKey)); return }
    if (event.keyCode === 40 && !seeq.console.isInsertable) { this.onArrowDown(event.shiftKey, (event.metaKey || event.ctrlKey)); return }
    if (event.keyCode === 37 && !seeq.console.isInsertable) { this.onArrowLeft(event.shiftKey, (event.metaKey || event.ctrlKey)); return }
    if (event.keyCode === 39 && !seeq.console.isInsertable) { this.onArrowRight(event.shiftKey, (event.metaKey || event.ctrlKey)); return }

    if (event.shiftKey && event.keyCode === 13 && !seeq.console.isInsertable) { 
      canvas.stepcounter.range() 
      canvas.stepcounter.isSelected = !canvas.stepcounter.isSelected; 
      return 
    }

    // add step.
    if (event.shiftKey && event.keyCode === 187 && !seeq.console.isInsertable) { 
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
    if (event.shiftKey && event.keyCode === 189 ) { 
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

    // OSC config.
    if (event.keyCode === 79 && (event.metaKey || event.ctrlKey)) { 
      seeq.displayer.displayOSC()
      event.preventDefault(); 
      return 
    }

    if (event.metaKey) { return }
    if (event.ctrlKey) { return }

    if (event.key === ' ' && !seeq.console.isInsertable) { canvas.clock.togglePlay(); event.preventDefault(); return }

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

    // switch cursor.
    if( this.switchFlag ){ 
      if( this.switchFlag && this.altFlag){ 
        canvas.cursor.switch(this.switchCounter % canvas.cursor.cursors.length)
        this.altFlag = false
        seeq.displayer.displayActivedCursor()
      } else {
        this.switchFlag = false
        seeq.displayer.displayDefault()
      }
    }

    seeq.displayer.run() 
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
    const c = canvas.getCurrentCursor()
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
    const c = canvas.getCurrentCursor()
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