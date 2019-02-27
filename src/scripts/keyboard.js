'use strict'

function Keyboard() {
  this.locks = []
  this.history = ''

  this.onKeyDown = function (event) {

    if (event.keyCode === 77) { 
      seeq.isShiftPressed = true;
      seeq.info.innerHTML = `<div class="operator-group">| <lf>MUTE</lf> <lf> : mute/unmute selected area. </lf>  </div> <div class="dashed-line-operator"> --------------------------------------- </div> <lft class="ltf-operator">: INFO </lft>`
    }
    if (event.keyCode === 32) { 
      seeq.info.innerHTML = `<div class="operator-group">| <lf>RUN</lf> <lf> : run sequencer. </lf>  </div> <div class="dashed-line-operator"> --------------------------------------- </div> <lft class="ltf-operator">: INFO </lft>`
      seeq.isPlaying = true
      seeq.isReverse = false
      clearTimeout(seeq.seq.timer)
      seeq.findMatchedPosition()
      seeq.runStep()
    }
    if (event.keyCode === 27) { 
      seeq.info.innerHTML = `<div class="operator-group">| <lf>STOP</lf> <lf> : stop sequencer. </lf>  </div> <div class="dashed-line-operator"> --------------------------------------- </div> <lft class="ltf-operator">: INFO </lft>`
      seeq.isPlaying = false
      seeq.seq.stop()
      seeq.data.hltr.removeHighlights();
    }
    if (event.keyCode === 85) { 
      seeq.isUpPressed = true;
    }
    if (event.keyCode === 68) { 
      seeq.isDownPressed = true;
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

    seeq.isShiftPressed = false;
    seeq.isUpPressed = false;
    seeq.isDownPressed = false;
    if (seeq.searchValue == "") {
      seeq.info.classList.remove("limit-regex")
      seeq.info.innerHTML = "|---------------------------------------------------------------------------------------------------|"
    }
  }

  document.onkeydown = (event) => { this.onKeyDown(event) }
  document.onkeyup = (event) => { this.onKeyUp(event) }
}

module.exports = Keyboard
