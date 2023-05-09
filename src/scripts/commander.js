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
     
      displayer.isDisplayInputToggled = false; 
      app_console.toggleInsert(app_console.inputFetch, app_console.caret, false);
      app_console.toggleInsert(app_console.searchRegExp, app_console.regexCaret, false); 
      app_console.inputFocus(false)
      app_console.regexFocus(false)
      displayer.displayDefault()
      this.stop();
      canvas.isPaused = false;
      return;
    })

    // DISABLE ALL KEYS UNLESS INPUT/REGEX IS BEING TURNED OFF
    this.doWhen(app_console.isInsertable(), () => this.handleWhenInputOn(event) )
    
    // CLOSE GUIDE BY PRESSING ANYKEY EXCEPT META/MODIFY KEYS.
    this.doWhen(this.isNotModifyKey(event), () => {
      if (canvas.guide && event.keyCode !== 72) {
        canvas.toggleGuide(false)
      }
    })

    // EVAL INPUT / EVAL REGEX
    this.doWhen(event.key === "Enter" && app_console.isInputFocused, () => this.runCmd("content", event) )
    this.doWhen(event.key === "Enter" && app_console.isRegExpFocused && app_console.regexMode[app_console.regexModeIndex] === RegexMode.OnEval, () => this.runCmd("regex", event) )

    // DISPLAYER INPUT(OSC/MIDI MSG/ETC.) ON
    this.doWhen(displayer.isDisplayInputToggled, () => { 
      // eval input msg.
      if (event.keyCode === 13) {
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

      // (ESC) exit.
      if (event.keyCode === 9) {
        displayer.isDisplayInputToggled = false; 
        displayer.displayDefault()
        this.stop();
        return;
      }
    })

    // -- INPUT/REGEX OFF --
    this.doWhen(!app_console.isInsertable() && !displayer.isDisplayInputToggled, () => { 
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
          stepcounter.isSnappedOnMarker = !stepcounter.isSnappedOnMarker
          stepcounter.counter[active_index].i = marker.active;
          return;
        }

        // ( Shift-{ ) change note-ratio.
        if (event.keyCode === 219) {
          canvas.marker.modNoteRatio(-1)
          event.preventDefault();
          return;
        }
  
        // ( Shift-} ) change note-ratio.
        if (event.keyCode === 221) {
          canvas.marker.modNoteRatio(1)
          event.preventDefault();
          return;
        }

        // ( Shift-GreaterThan ) increase BPM.
        if (event.key === ">") {
          metronome.mod(1)
          event.preventDefault();
          return;
        }
  
        // ( Shift-LessThan ) decrease BPM.
        if (event.key === "<") {
          metronome.mod(-1)
          event.preventDefault();
          return;
        }

        // ( Shift-? ) show current marker info
        if (event.key === "?") {
          displayer.displayMsg("show-marker-info");
          event.preventDefault();
          return;
        }

      })

      
      // ONLY SINGLE CHAR IS ACCEPTED
      this.doWhen(!this.isModifyKey(event) && !event.shiftKey, () => {

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
  
        // (r) reverse marker step.
        if (event.keyCode === 82 ) {
          const currentMarker = canvas.marker.currentMarker()
          currentMarker["control"]["reverse"] = !currentMarker["control"]["reverse"]
          event.preventDefault();
          return;
        }
  
        // (x) mute current selected marker.
        if (event.keyCode === 88 ) {
          const marker = canvas.marker.currentMarker();
          marker["control"]["muted"] = !marker["control"]["muted"]
          event.preventDefault();
          return;
        }
  
        // (f) focus
        if (event.keyCode === 70 ) {
          // app_console.togglePort('FOCUS', app_console)
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
          if (document.getElementsByClassName("content")[0].clientWidth < 458) { 
            displayer.helperMsg = "[WARNING]: cannot display helps window since current window width is too narrow";
            displayer.displayMsg("helper"); 
          }
          event.preventDefault();
          return;
        }
  
        // (Spacebar) Play/Pause
        if (event.key === " " && !displayer.isDisplayInputToggled) {
          canvas.clock.togglePlay();
          event.preventDefault();
          return;
        }

        // (') notation only mode.
        if (event.keyCode === 222 ) {
          // TODO: prevent holding key.
          canvas.replaceCurrentMarkerBlock(BLOCK_REPLACE_GLYPH)
          event.preventDefault();
          return;
        }

        // (;) toggle mono step mode
        if (event.keyCode === 186 ) {
          canvas.marker.markers.forEach(m => m["control"]["muted"] = !canvas.monoStepMode)
          if (!canvas.stepcounter.isSnappedOnMarker) return;
          canvas.monoStepMode = !canvas.monoStepMode
          event.preventDefault();
          return;
        }

      })
  

    })

    // -- MODIFY-KEY PRESSED --
    this.doWhen(this.isModifyKey(event), () => {

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

      // // show selection name.
      // if (event.keyCode === 69 && this.altFlag) {
      //   this.switchFlag = true;
      //   event.preventDefault();
      //   return;
      // }

      // (Cmd-i) insert input.
      if (event.keyCode === 73) {
        if(!app_console.isInsertable() || !app_console.isInputFocused) {
          app_console.inputFocus(!app_console.isInputFocused)
        }
        app_console.toggleInsert(app_console.inputFetch, app_console.caret, app_console.isInsertable());
        app_console.toggleInsert(app_console.searchRegExp, app_console.regexCaret, false); // blur regex input
        displayer.displayDefault();
        event.preventDefault();
        return;
      }

      // (Cmd-g) insert regex input.
      if (event.keyCode === 71) {
        if(!app_console.isInsertable() || !app_console.isRegExpFocused) {
          app_console.regexFocus(!app_console.isRegExpFocused)
        }
        app_console.toggleInsert(app_console.searchRegExp,  app_console.regexCaret, app_console.isInsertable());
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

      // // (Cmd-1) toggle regex-flag global [g]
      if (event.keyCode === 49) {
        app_console.changeRegexFlag(0)
        displayer.displayDefault();
        event.preventDefault();
        return;
      }

      // (Cmd-2) toggle regex-flag insensitive [i]
      if (event.keyCode === 50) {
        app_console.changeRegexFlag(1)
        displayer.displayDefault();
        event.preventDefault();
        return;
      }

      // (Cmd-3) toggle regex-flag multiline [m]
      if (event.keyCode === 51) {
        app_console.changeRegexFlag(2)
        displayer.displayDefault();
        event.preventDefault();
        return;
      }

      // (Cmd-4) toggle regex-flag unicode [u]
      if (event.keyCode === 52) {
        app_console.changeRegexFlag(3)
        displayer.displayDefault();
        event.preventDefault();
        return;
      }

      // (Cmd-5) toggle regex-flag unicode [s]
      if (event.keyCode === 53) {
        app_console.changeRegexFlag(4)
        displayer.displayDefault();
        event.preventDefault();
        return;
      }

      // (Cmd-6) toggle regex-flag unicode [y]
      if (event.keyCode === 54) {
        app_console.changeRegexFlag(5)
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
    const leap = skip ? canvas.grid.h / 2 : 1;
    if (mod) {
      canvas.marker.scale(0, leap);
    } else {
      canvas.marker.move(0, leap);
    }
  };

  this.onArrowDown = function(mod = false, skip = false) {
    const c = canvas.marker.currentMarker();
    let leap;
    if (!canvas.isSelectionAtEdgeBottom(c)) {
      // const leap = skip ? canvas.grid.h : 1
      if (skip) {
        if (c.y + c.h + canvas.grid.h > canvas.seequencer.h) {
          leap = canvas.seequencer.h % (c.y + c.h) - 1;
        } else {
          leap = canvas.grid.h / 2;
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
    const leap = skip ? canvas.grid.w / 2 : 1;
    if (mod) {
      canvas.marker.scale(-leap, 0);
    } else {
      canvas.marker.move(-leap, 0);
    }
  };

  this.onArrowRight = function(mod = false, skip = false) {
    const c = canvas.marker.currentMarker();
    let leap;
    if (!canvas.isSelectionAtEdgeRight(c)) {
      if (skip) {
        if (c.x + c.w + canvas.grid.w > canvas.seequencer.w) {
          leap = canvas.seequencer.w % (c.x + c.w) - 1;
        } else {
          leap = canvas.grid.w / 2;
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
    return event.ctrlKey || event.metaKey || event.altKey
  }

  this.runCmd = function(type, event) {
    app_console.runCmd(type);
    event.preventDefault();
    return; 
  }

}
