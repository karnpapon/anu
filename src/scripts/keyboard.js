'use strict'

function Keyboard() {
  this.locks = []
  this.history = ''

  this.onKeyDown = function (event) {

    // char = m
    if (event.keyCode === 77) { 
      seeq.info.innerHTML = `<div class="operator-group">| <lf>MUTE</lf> <lf> : mute/unmute selected area. </lf>  </div> <div class="dashed-line-operator"> --------------------------------------- </div> <lft class="ltf-operator">: INFO </lft>`
      seeq.isMutePressed = true;
      seeq.keyboardPress = true;
    }

     // char = spacebar
    if (event.keyCode === 32) { 
      seeq.keyboardPress = true;
      seeq.info.innerHTML = `<div class="operator-group">| <lf>RUN</lf> <lf> : run sequencer. </lf>  </div> <div class="dashed-line-operator"> --------------------------------------- </div> <lft class="ltf-operator">: INFO </lft>`
      seeq.isPlaying = true
      seeq.isReverse = false
      clearTimeout(seeq.seq.timer)
      seeq.findMatchedPosition()
      seeq.runStep()
    }

    // char = esc
    if (event.keyCode === 27) { 
      seeq.keyboardPress = true;
      seeq.info.innerHTML = `<div class="operator-group">| <lf>STOP</lf> <lf> : stop sequencer. </lf>  </div> <div class="dashed-line-operator"> --------------------------------------- </div> <lft class="ltf-operator">: INFO </lft>`
      seeq.isPlaying = false
      seeq.seq.stop()
      seeq.data.hltr.removeHighlights();
    }

     // char = r
    if (event.keyCode === 82) {
      seeq.keyboardPress = true; 
      seeq.info.innerHTML = `<div class="operator-group">| <lf> REVERSE </lf> <lf> : reverse target selection. </lf>  </div> <div class="dashed-line-operator"> --------------------------------------- </div> <lft class="ltf-operator">: INFO </lft>`
      seeq.isReversedCursorPressed = true;
    }

    //  // char = u
    if (event.keyCode === 85) { 
      seeq.isUpPressed = true;
      seeq.keyboardPress = true;
    }

     // char = d
    if (event.keyCode === 68) { 
      seeq.isDownPressed = true;
      seeq.keyboardPress = true;
    }

    if (event.key === '>') { 
      seeq.modSpeed(1); 
      event.preventDefault(); 
      return
    }

    if (event.key === '<') { 
      seeq.modSpeed(-1); 
      event.preventDefault(); 
      return 
    }

    // if (event.key.length === 1) {
    //   terminal.cursor.write(event.key)
    //   terminal.update()
    // }
  }

  this.onKeyUp = function (event) {

    seeq.isMutePressed = false;
    seeq.isUpPressed = false;
    seeq.isDownPressed = false;
    seeq.keyboardPress = false;
    seeq.isReversedCursorPressed = false;
    if (seeq.searchValue == "") {
      seeq.info.classList.remove("limit-regex")
      seeq.info.innerHTML = "|---------------------------------------------------------------------------------------------------|"
    }
  }

  document.onkeydown = (event) => { this.onKeyDown(event) }
  document.onkeyup = (event) => { this.onKeyUp(event) }
}

module.exports = Keyboard
