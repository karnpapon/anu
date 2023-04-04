"use strict";

/* global seeq */

function Commander(canvas) {
  this.isActive = false;
  this.query = "";
  this.history = [];
  this.historyIndex = 0;
  this.altFlag = false;
  this.tabFlag = false;
  this.switchFlag = false;
  this.switchCounter = 0;

  // Begin

  this.start = function(q = "") {
    this.isActive = true;
    this.query = q;
    canvas.update();
  };

  this.stop = function() {
    this.isActive = false;
    this.query = "";
    this.historyIndex = this.history.length;
    canvas.update();
  };

  this.erase = function() {
    this.query = this.query.slice(0, -1);
    // this.preview()
  };

  this.resetSwitchCounter = function() {
    this.switchCounter = 0;
  };

  this.write = function(key) {
    if (key.length !== 1) {
      return;
    }
    this.query += key;
    // this.preview()
  };

  // this.run = function () {
  //   const tool = this.isActive === true ? 'commander' : 'highlighter'
  //   canvas[tool].trigger()
  //   canvas.update()
  // }

  // Events

  this.onKeyDown = function(event) {

    // disable all keys unless isInsertable is being turned off
    if (seeq.console.isInsertable){ 
      // insert input.
      if (event.keyCode === 73 && (event.metaKey || event.ctrlKey) ) {
        seeq.console.isInsertable = !seeq.console.isInsertable;
        seeq.console.inputFetch.blur()
        seeq.console.inputFetch.setAttribute("contenteditable", "false")
        seeq.console.toggleInsert(seeq.console.inputFetch, seeq.console.caret);
        seeq.displayer.displayDefault();
        event.preventDefault();
        return;
      }

      // insert regex input.
      if (event.keyCode === 71 && (event.metaKey || event.ctrlKey) ) {
        seeq.console.isInsertable = !seeq.console.isInsertable;
        seeq.console.searchRegExp.blur()
        seeq.console.searchRegExp.setAttribute("contenteditable", "false")
        seeq.console.toggleInsert(seeq.console.searchRegExp,  seeq.console.regexCaret);
        seeq.displayer.displayDefault();
        event.preventDefault();
        return;
      }
    }

    // close guide by pressing anykey except meta/modify keys.
    if (!event.shiftKey && !event.metaKey && !event.ctrlKey) {
      if (canvas.guide && event.keyCode !== 72){ canvas.toggleGuide(false) }
    }

    if (event.which == 40 || event.which == 41) {
      event.preventDefault();
    }

    if (event.key === "Enter" && seeq.console.isInputFocused) {
      seeq.console.runCmd("content");
      event.preventDefault();
      return;
    }

    if (event.key === "Enter" && seeq.console.isFindFocused) {
      seeq.console.runCmd("find");
      event.preventDefault();
      return;
    }

    // eval sending osc msg.
    if (event.key === "Enter" && seeq.displayer.isDisplayInputToggled) {
      seeq.displayer.runCmd();
      event.preventDefault();
      return;
    }

    // jump between osc msg input.
    if (event.keyCode === 9 && seeq.displayer.isDisplayInputToggled) {
      seeq.displayer.tabInputIndex++
      seeq.displayer.tabInputIndex = seeq.displayer.tabInputIndex % ( seeq.displayer.currentCmd === "osc" ? 2 : 4 ) // TODO: no hardcode
      seeq.displayer.handleTab()
      event.preventDefault();
      return;
    }

    if (event.keyCode === 38 && !seeq.console.isInsertable && seeq.displayer.displayType === "default") {
      this.onArrowUp(event.shiftKey, event.metaKey || event.ctrlKey);
      return;
    }
    if (event.keyCode === 40 && !seeq.console.isInsertable && seeq.displayer.displayType === "default") {
      this.onArrowDown(event.shiftKey, event.metaKey || event.ctrlKey);
      return;
    }
    if (event.keyCode === 37 && !seeq.console.isInsertable && seeq.displayer.displayType === "default") {
      this.onArrowLeft(event.shiftKey, event.metaKey || event.ctrlKey);
      return;
    }
    if (event.keyCode === 39 && !seeq.console.isInsertable && seeq.displayer.displayType === "default") {
      this.onArrowRight(event.shiftKey, event.metaKey || event.ctrlKey);
      return;
    }

    // get step into highlighter range.
    if (event.shiftKey && event.keyCode === 13 && !seeq.console.isInsertable) {
      // canvas.stepcounter.range();
      const active_index = canvas.stepcounter.counter.length > 1 ? canvas.highlighter.active : 0
      canvas.stepcounter.isSelected = !canvas.stepcounter.isSelected
      canvas.stepcounter.counter[active_index].i = canvas.highlighter.active;
      return;
    }

    // add step.
    if (event.shiftKey && event.keyCode === 187 && !seeq.console.isInsertable) {
      if (!canvas.stepcounter.isSelected) {
        canvas.stepcursor.remove();
        canvas.stepcursor.add();
        canvas.stepcounter.range();
        canvas.stepcounter.isSelected = true;
      } else {
        canvas.stepcursor.add();
      }
      return;
    }

    // remove step
    if (event.shiftKey && event.keyCode === 189) {
      canvas.stepcursor.remove();
      return;
    }

    if (event.altKey) {
      this.altFlag = true;
      event.preventDefault();
    }

    // switch selection.
    if (event.keyCode === 9 && this.altFlag) {
      this.switchFlag = true;
      this.switchCounter += 1;
      event.preventDefault();
      return;
    }

    // show selection name.
    if (event.keyCode === 69 && this.altFlag) {
      this.switchFlag = true;
      event.preventDefault();
      return;
    }

    // insert input.
    if (event.keyCode === 73 && (event.metaKey || event.ctrlKey) ) {
      seeq.displayer.displayDefault();
      seeq.console.isInsertable = !seeq.console.isInsertable;
      if (seeq.console.isInsertable){
        seeq.console.inputFetch.focus()
        seeq.console.inputFetch.setAttribute("contenteditable", "true")
      } else {
        seeq.console.inputFetch.blur()
        seeq.console.inputFetch.setAttribute("contenteditable", "false")
      }  
      seeq.console.toggleInsert(seeq.console.inputFetch, seeq.console.caret);
      event.preventDefault();
      return;
    }

    // insert regex input.
    if (event.keyCode === 71 && (event.metaKey || event.ctrlKey) ) {
      seeq.displayer.displayDefault();
      seeq.console.isInsertable = !seeq.console.isInsertable;
      if (seeq.console.isInsertable){
        seeq.console.searchRegExp.focus()
        seeq.console.searchRegExp.setAttribute("contenteditable", "true")
      } else {
        seeq.console.searchRegExp.blur()
        seeq.console.searchRegExp.setAttribute("contenteditable", "false")
      }  
      seeq.console.toggleInsert(seeq.console.searchRegExp,  seeq.console.regexCaret);
      event.preventDefault();
      return;
    }

    if (!seeq.console.isInsertable){

      // toggle UDP
      if (event.keyCode === 49 ) {
        // seeq.console.togglePort('UDP', seeq.console.udpBtn)
        event.preventDefault();
        return;
      }

      // (n) new highlighter. 
      if (event.keyCode === 78 ) {
        canvas.globalIdx += 1;
        canvas.highlighter.add();
        event.preventDefault();
        return;
      }

      // (Backspace)
      if (
        event.key === "Backspace" &&
        canvas.highlighter.highlighters.length > 1
      ) {
        canvas.eraseSelectionCursor();
        event.preventDefault();
        return;
      }

      // (r) reverse global step.
      if (event.keyCode === 82 ) {
        seeq.console.togglePort('REV', seeq.console)
        event.preventDefault();
        return;
      }

      // (f) focus
      if (event.keyCode === 70 ) {
        seeq.console.togglePort('FOCUS', seeq.console)
        canvas.toggleShowMarks()
        event.preventDefault();
        return;
      }


      // (e) rename highlighter's name.
      if (event.keyCode === 69) {
        seeq.displayer.displayMsg("rename-highlighter");
        event.preventDefault();
        return;
      }

      // ([) change note-ratio.
       if (event.keyCode === 219) {
        metronome.modNoteRatio(-1)
        event.preventDefault();
        return;
      }

      // (]) change note-ratio.
      if (event.keyCode === 221) {
        metronome.modNoteRatio(1)
        event.preventDefault();
        return;
      }

      // (o) OSC config.
      if (event.keyCode === 79 ) {
        seeq.displayer.displayMsg("osc");
        event.preventDefault();
        return;
      }

      // (m) MIDI config.
      if (event.keyCode === 77 ) {
        seeq.displayer.displayMsg("midi");
        event.preventDefault();
        return;
      }

      // (h) show guide.
      if (event.keyCode === 72) {
        canvas.toggleGuide(!canvas.guide)
        event.preventDefault();
        return;
      }

      // (a) rename highlighter.
      if (event.keyCode === 65) {
        seeq.displayer.displayMsg('rename-highlighter')
        event.preventDefault();
        return
      }

      if (event.key === ">") {
        // canvas.clock.mod(1);
        metronome.mod(1)
        event.preventDefault();
        return;
      }

      if (event.key === "<") {
        // canvas.clock.mod(-1);
        metronome.mod(-1)
        event.preventDefault();
        return;
      }
    }
   
    if (event.metaKey) { return; }
    if (event.ctrlKey) { return; }
    if (event.key === "Enter") { return; }

    if (event.key === " " && !seeq.console.isInsertable && !seeq.displayer.isDisplayInputToggled) {
      canvas.clock.togglePlay();
      event.preventDefault();
      return;
    }

    if (event.key === "Escape") {
      canvas.commander.stop();
      canvas.clear();
      canvas.isPaused = false;
      canvas.reset();
      return;
    }
  };

  this.onKeyUp = function(event) {
    // switch highlighter.
    if( this.switchFlag ){
      if( this.switchFlag && this.altFlag ){
        canvas.highlighter.switch(this.switchCounter % canvas.highlighter.highlighters.length)
        this.altFlag = false
        seeq.displayer.displayMsg('active-highlighter')
      } else {
        this.switchFlag = false
        seeq.displayer.displayDefault()
      }
    }

    canvas.update();
  };

  this.onArrowUp = function(mod = false, skip = false) {
    const leap = skip ? canvas.grid.h : 1;
    if (mod) {
      canvas.highlighter.scale(0, leap);
    } else {
      canvas.highlighter.move(0, leap);
    }
  };

  this.onArrowDown = function(mod = false, skip = false) {
    const c = canvas.getCurrentHighlighter();
    let leap;
    if (!canvas.isSelectionAtEdgeBottom(c[0])) {
      // const leap = skip ? canvas.grid.h : 1
      if (skip) {
        if (c[0].y + c[0].h + canvas.grid.h > canvas.seequencer.h) {
          leap = canvas.seequencer.h % (c[0].y + c[0].h);
        } else {
          leap = canvas.grid.h;
        }
      } else {
        leap = 1;
      }

      if (mod) {
        canvas.highlighter.scale(0, -leap);
      } else {
        canvas.highlighter.move(0, -leap);
      }
    }
  };

  this.onArrowLeft = function(mod = false, skip = false) {
    const leap = skip ? canvas.grid.w : 1;
    if (mod) {
      canvas.highlighter.scale(-leap, 0);
    } else {
      canvas.highlighter.move(-leap, 0);
    }
  };

  this.onArrowRight = function(mod = false, skip = false) {
    const c = canvas.getCurrentHighlighter();
    let leap;
    if (!canvas.isSelectionAtEdgeRight(c[0])) {
      if (skip) {
        if (c[0].x + c[0].w + canvas.grid.w > canvas.seequencer.w) {
          leap = canvas.seequencer.w % (c[0].x + c[0].w);
        } else {
          leap = canvas.grid.w;
        }
      } else {
        leap = 1;
      }

      if (mod) {
        canvas.highlighter.scale(leap, 0);
      } else {
        canvas.highlighter.move(leap, 0);
      }
    }
  };

  // Events

  document.onkeydown = event => {
    this.onKeyDown(event);
  };
  document.onkeyup = event => {
    this.onKeyUp(event);
  };

  // UI

  this.toString = function() {
    return `${this.query}`;
  };
}
