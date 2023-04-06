"use strict";

/* global client */

function Commander(canvas) {
  this.isActive = false;
  this.query = "";
  this.history = [];
  this.historyIndex = 0;
  this.altFlag = false;
  this.tabFlag = false;
  this.switchFlag = false;
  this.switchCounter = 0;

  const { displayer, console: app_console } = client

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
  };

  this.doWhen = function(condition, callback) {
    if(condition) {
      callback()
    }
  }

  this.onKeyDown = function(event) {

    // -- ESC PRESSED --
    this.doWhen(event.key === "Escape", () => {
      if(displayer.isDisplayInputToggled) { 
        displayer.isDisplayInputToggled = false; 
        displayer.displayDefault()
        return 
      }
      this.stop();
      canvas.isPaused = false;
      return;
    })

    // DISABLE ALL KEYS UNLESS INPUT/REGEX IS BEING TURNED OFF
    this.doWhen(app_console.isInsertable, () => this.handleWhenInputOn(event) )
    
    // CLOSE GUIDE BY PRESSING ANYKEY EXCEPT META/MODIFY KEYS.
    this.doWhen(this.isNotModifyKey(event), () => {
      if (canvas.guide && event.keyCode !== 72) {
        canvas.toggleGuide(false)
      }
    })

    // EVAL INPUT / EVAL REGEX
    this.doWhen(event.key === "Enter" && app_console.isInputFocused, () => this.runCmd("content", event) )
    this.doWhen(event.key === "Enter" && app_console.isRegExpFocused && app_console.regexMode[app_console.regexModeIndex] === "ON-EVAL", () => this.runCmd("regex", event) )

    // DISPLAYER INPUT(OSC/MIDI MSG/ETC.) ON
    this.doWhen(displayer.isDisplayInputToggled, () => { 
      // eval input msg.
      if (event.key === "Enter") {
        displayer.runCmd();
        event.preventDefault();
        return;
      }

      // (TAB) jump between input.
      if (event.keyCode === 9) {
        displayer.increseTabInputIndex()
        displayer.handleTab()
        event.preventDefault();
        return;
      }

      // (ESC) jump between input.
      if (event.keyCode === 9) {
        displayer.isDisplayInputToggled = false; 
        displayer.displayDefault()
        this.stop();
        return;
      }
    })

    // -- INPUT/REGEX OFF --
    this.doWhen(!app_console.isInsertable && !displayer.isDisplayInputToggled, () => { 
      if (displayer.displayType === "default") {
        if (event.keyCode === 38) {
          this.onArrowUp(event.shiftKey, event.metaKey || event.ctrlKey);
          return;
        }
        if (event.keyCode === 40) {
          this.onArrowDown(event.shiftKey, event.metaKey || event.ctrlKey);
          return;
        }
        if (event.keyCode === 37) {
          this.onArrowLeft(event.shiftKey, event.metaKey || event.ctrlKey);
          return;
        }
        if (event.keyCode === 39) {
          this.onArrowRight(event.shiftKey, event.metaKey || event.ctrlKey);
          return;
        }
      }

      this.doWhen(event.shiftKey, () => {
        const { marker, stepcounter,  stepcursor } = canvas

        // (Shift-Enter) get step into marker range.
        if (event.keyCode === 13) {
          const active_index = stepcounter.counter.length > 1 ? marker.active : 0
          stepcounter.isSelected = !stepcounter.isSelected
          stepcounter.counter[active_index].i = marker.active;
          return;
        }
  
        // (Shift-Plus) add new step
        if (event.keyCode === 187) {
          if (!stepcounter.isSelected) {
            stepcursor.remove();
            stepcursor.add();
            stepcounter.range();
            stepcounter.isSelected = true;
          } else {
            stepcursor.add();
          }
          return;
        }
      })

      // // toggle UDP
      // if (event.keyCode === 49 ) {
      //   // app_console.togglePort('UDP', app_console.udpBtn)
      //   event.preventDefault();
      //   return;
      // }
  
      // (n) new marker. 
      if (event.keyCode === 78 ) {
        canvas.globalIdx += 1;
        canvas.marker.add();
        event.preventDefault();
        return;
      }
  
      // (Backspace)
      if (
        event.key === "Backspace" &&
        canvas.marker.markers.length > 1
      ) {
        canvas.eraseSelectionCursor();
        event.preventDefault();
        return;
      }

      // (r) reverse global step.
      if (event.keyCode === 82 ) {
        app_console.togglePort('REV', app_console)
        event.preventDefault();
        return;
      }

      // (f) focus
      if (event.keyCode === 70 ) {
        app_console.togglePort('FOCUS', app_console)
        canvas.toggleShowMarks()
        event.preventDefault();
        return;
      }


      // (e) rename marker's name.
      if (event.keyCode === 69) {
        displayer.displayMsg("rename-marker");
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
        displayer.displayMsg("osc");
        event.preventDefault();
        return;
      }

      // (m) MIDI config.
      if (event.keyCode === 77 ) {
        displayer.displayMsg("midi");
        event.preventDefault();
        return;
      }

      // (h) show guide.
      if (event.keyCode === 72) {
        canvas.toggleGuide(!canvas.guide)
        event.preventDefault();
        return;
      }

      // (a) rename marker.
      if (event.keyCode === 65) {
        displayer.displayMsg('rename-marker')
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

      // (Spacebar) Play/Pause
      if (event.key === " " && !displayer.isDisplayInputToggled) {
        canvas.clock.togglePlay();
        event.preventDefault();
        return;
      }

    })

    // -- MODIFY-KEY(CMD/SHIFT/CTRL) PRESSED --
    this.doWhen(this.isModifyKey(event), () => {

      // (Shift-Minus) remove step
      if (event.keyCode === 189) {
        canvas.stepcursor.remove();
        return;
      }

      if (event.altKey) {
        this.altFlag = true;
        event.preventDefault();
      }

      // (Option-TAB) switch selection.
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

      // (Cmd-i) insert input.
      if (event.keyCode === 73) {
        if(!app_console.isInsertable || !app_console.isInputFocused) {
          app_console.insert()
        }
        app_console.toggleInsert(app_console.inputFetch, app_console.caret, app_console.isInsertable);
        app_console.toggleInsert(app_console.searchRegExp, app_console.regexCaret, false); // blur regex input
        displayer.displayDefault();
        event.preventDefault();
        return;
      }

      // (Cmd-g) insert regex input.
      if (event.keyCode === 71) {
        if(!app_console.isInsertable || !app_console.isRegExpFocused) {
          app_console.insert()
        }
        app_console.toggleInsert(app_console.searchRegExp,  app_console.regexCaret, app_console.isInsertable);
        app_console.toggleInsert(app_console.inputFetch,  app_console.caret, false); // blur input
        displayer.displayDefault();
        event.preventDefault();
        return;
      }

      // (Cmd-/) switch between regex-mode (realtime/on-eval)
      if (event.keyCode === 191) {
        app_console.changeRegexMode()
        displayer.displayDefault();
        event.preventDefault();
        return;
      }
    })    

  };

  this.onKeyUp = function(event) {
    // switch marker.
    if( this.switchFlag ){
      if( this.switchFlag && this.altFlag ){
        canvas.marker.switch(this.switchCounter % canvas.marker.markers.length)
        this.altFlag = false
        displayer.displayMsg('active-marker')
      } else {
        this.switchFlag = false
        displayer.displayDefault()
      }
    }

    canvas.update();
  };

  this.onArrowUp = function(mod = false, skip = false) {
    const leap = skip ? canvas.grid.h : 1;
    if (mod) {
      canvas.marker.scale(0, leap);
    } else {
      canvas.marker.move(0, leap);
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
        canvas.marker.scale(0, -leap);
      } else {
        canvas.marker.move(0, -leap);
      }
    }
  };

  this.onArrowLeft = function(mod = false, skip = false) {
    const leap = skip ? canvas.grid.w : 1;
    if (mod) {
      canvas.marker.scale(-leap, 0);
    } else {
      canvas.marker.move(-leap, 0);
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
        canvas.marker.scale(leap, 0);
      } else {
        canvas.marker.move(leap, 0);
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


  this.handleWhenInputOn = function(event){
    if (event.keyCode === 73 && (event.metaKey || event.ctrlKey) ) {
      app_console.inputFetch.blur()
      app_console.inputFetch.setAttribute("contenteditable", "false")
      app_console.toggleInsert(app_console.inputFetch, app_console.caret);
      displayer.displayDefault();
      event.preventDefault();
      return;
    }

    // insert regex input.
    if (event.keyCode === 71 && (event.metaKey || event.ctrlKey) ) {
      app_console.searchRegExp.blur()
      app_console.searchRegExp.setAttribute("contenteditable", "false")
      app_console.toggleInsert(app_console.searchRegExp,  app_console.regexCaret);
      displayer.displayDefault();
      event.preventDefault();
      return;
    }
  }

  this.isNotModifyKey = function(event){
    return !event.shiftKey && !event.metaKey && !event.ctrlKey && !event.altKey
  }

  this.isModifyKey = function(event){
    return event.shiftKey || event.metaKey || event.ctrlKey || event.altKey
  }

  this.runCmd = function(type, event) {
    app_console.runCmd(type);
    event.preventDefault();
    return; 
  }

}
