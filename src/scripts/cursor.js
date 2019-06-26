'use strict'

function Cursor(terminal) {
  this.mode = 0
  this.block = []
  this.active = 0
  this.cursors = [{ x: 0, y: 0, w: 1, h:1, i: 0}]

  this.move = function (x, y) {
    let active = this.cursors[this.active]
    if (isNaN(x) || isNaN(y)) { return }
    active.x = clamp(active.x + parseInt(x), 0, terminal.seequencer.w - 1)
    active.y = clamp(active.y - parseInt(y), 0, terminal.seequencer.h - 1)
    terminal.update()
  }

  this.scale = function (x, y) {
    let active = this.cursors[this.active] 
    if (isNaN(x) || isNaN(y)) { return }
    active.w = clamp(active.w + parseInt(x), 1, terminal.seequencer.w - active.x)
    active.h = clamp(active.h - parseInt(y), 1, terminal.seequencer.h - active.y)
    terminal.update()
  }

  this.switch = function(index = 0){
    this.active = index
  }

  this.add = function(){
    this.cursors.push({ x: 0, y: 0, w: 10, h: 1, i: terminal.globalIdx }) 
  }

  this.moveTo = function (x, y) {
    let active = this.cursors[this.active]  
    if (isNaN(x) || isNaN(y)) { return }
    active.x = clamp(parseInt(x), 0, terminal.seequencer.w - 1)
    active.y = clamp(parseInt(y), 0, terminal.seequencer.h - 1)
    terminal.update()
  }
  
  this.scaleTo = function (w, h) {
    let active = this.cursors[this.active] 
    if (isNaN(w) || isNaN(h)) { return }
    active.w = clamp(parseInt(w), 1, terminal.seequencer.w - 1)
    active.h = clamp(parseInt(h), 1, terminal.seequencer.h - 1)
    terminal.update()
  }
  
  /* #region fold */
  // this.resize = function (w, h) {
  //   if (isNaN(w) || isNaN(h)) { return }
  //   this.w = clamp(parseInt(w), 1, terminal.seequencer.w - this.x)
  //   this.h = clamp(parseInt(h), 1, terminal.seequencer.h - this.y)
  //   terminal.update()
  // }

  // this.drag = function (x, y) {
  //   if (isNaN(x) || isNaN(y)) { return }
  //   this.mode = 0
  //   this.cut()
  //   this.move(x, y)
  //   this.paste()
  // }

  // this.selectAll = function () {
  //   this.x = 0
  //   this.y = 0
  //   this.w = terminal.seequencer.w
  //   this.h = terminal.seequencer.h
  //   this.mode = 0
  //   terminal.update()
  // }

  // this.copy = function () {
  //   const block = this.getBlock()
  //   var rows = []
  //   for (var i = 0; i < block.length; i++) {
  //     rows.push(block[i].join(''))
  //   }
  //   clipboard.writeText(rows.join('\n'))
  // }

  // this.cut = function () {
  //   this.copy()
  //   this.erase()
  // }

  // this.paste = function (overlap = false) {
  //   this.writeBlock(clipboard.readText().split(/\r?\n/), overlap)
  // }

  // this.rotate = function (rate = 1) {
  //   if (isNaN(rate)) { return }
  //   const cols = terminal.cursor.getBlock()
  //   for (const y in cols) {
  //     for (const x in cols[y]) {
  //       const g = cols[y][x]
  //       if (g === '.') { continue }
  //       if (terminal.seequencer.isSpecial(g)) { continue }
  //       cols[y][x] = terminal.seequencer.keyOf(parseInt(rate) + terminal.seequencer.valueOf(g), sense(g))
  //     }
  //   }
  //   terminal.cursor.writeBlock(cols)
  // }

  // this.comment = function () {
  //   const block = this.getBlock()
  //   for (const id in block) {
  //     block[id][0] = block[id][0] === '#' ? '.' : '#'
  //     block[id][block[id].length - 1] = block[id][block[id].length - 1] === '#' ? '.' : '#'
  //   }
  //   this.writeBlock(block)
  // }

  /* #endregion*/

  this.select = function (x = this.cursors[0].x, y = this.cursors[0].y, w = this.cursors[0].w, h = this.cursors[0].h) {
    this.moveTo(x, y)
    this.scaleTo(w, h)
    terminal.update()
  }

  this.reset = function (pos = false) {
    let active = this.cursors[this.active]  
    if (pos) {
      active.x = 0
      active.y = 0
    }
    this.move(0, 0)
    active.w = 1
    active.h = 1
    this.mode = 0
  }

  this.read = function () {
    let active = this.cursors[this.active] 
    return terminal.seequencer.glyphAt(active.x, active.y)
  }

  this.write = function (g) {
    let active = this.cursors[this.active] 
    if (terminal.seequencer.write(active.x, active.y, g) && this.mode === 1) {
      this.move(1, 0)
    }
  }

  // this.erase = function () {
  //   this.eraseBlock(this.x, this.y, this.w, this.h)
  //   if (this.mode === 1) { this.move(-1, 0) }
  //   terminal.history.record(terminal.seequencer.s)
  // }

  // this.find = function (str) {
  //   const i = terminal.seequencer.s.indexOf(str)
  //   if (i < 0) { return }
  //   const pos = terminal.seequencer.posAt(i)
  //   this.w = str.length
  //   this.h = 1
  //   this.x = pos.x
  //   this.y = pos.y
  // }

  // this.trigger = function () {
    // const operator = terminal.seequencer.operatorAt(this.x, this.y)
    // if (!operator) { console.warn('Cursor', 'Nothing to trigger.'); return }
    // console.log('Cursor', 'Trigger: ' + operator.name)
    // operator.run(true)
  // }

  // this.toggleMode = function (val) {
  //   this.w = 1
  //   this.h = 1
  //   this.mode = this.mode === 0 ? val : 0
  // }

  this.inspect = function (name = true, ports = false) {
    // if (this.w > 1 || this.h > 1) { return 'multi' }
    // const port = terminal.portAt(this.x, this.y)
    // if (port) { return `${port[3]}` }
    // if (terminal.seequencer.lockAt(this.x, this.y)) { return 'locked' }
    return 'empty'
  }

  // Block

  this.getBlock = function () {
    let rect = []
    rect = this.toRect()
    const block = []
    rect.forEach( r => {
      for (let _y = r.y; _y < r.y + r.h; _y++) {
        const line = []
        for (let _x = r.x; _x < r.x + r.w; _x++) {
          block.push({x: _x, y: _y })
        }
      }
    })
    return block
  }

  this.getBlockByIndex = function (idx) {
    let rect = []
    rect = this.toRect()
    const block = []
    rect.forEach( r => {
      if( r.i === idx ){
        for (let _y = r.y; _y < r.y + r.h; _y++) {
          const line = []
          for (let _x = r.x; _x < r.x + r.w; _x++) {
            block.push({x: _x, y: _y })
          }
        }
      }
    })
    return block
  }

  this.toRect = function () {
    let cursorArea = []
    this.cursors.forEach( ( cs ) => {
      cursorArea.push({ 
        x: cs.x, 
        y: cs.y, 
        w: cs.w, 
        h: cs.h,
        i: cs.i
      })
    })

    return cursorArea
  }

  function sense (s) { return s === s.toUpperCase() && s.toLowerCase() !== s.toUpperCase() }
  function clamp (v, min, max) { return v < min ? min : v > max ? max : v }
}

module.exports = Cursor