'use strict'

function Keyboard(parent) {
  this.locks = []
  this.history = ''
  this.down = false;
  this.isKeyNotFound = false;
  this.keyboardPress = false
  this.isMutePressed = false
  this.isUpPressed = false
  this.isDownPressed = false
  this.isShowInfo = false
  this.isMuted = false
  this.isReversedCursorPressed = false
  this.isDeletePressed = false
  this.isRetriggered = false

  this.onKeyDown = function (event) {

    // char = m
    if (event.keyCode === 77) { 
      parent.info.innerHTML = this.infoDisplay('MUTE : mute target highlight.','mute', "e")
      this.isMutePressed = true;
    }

    // char = spacebar
    else if (event.keyCode === 32) { 
      parent.info.innerHTML = this.infoDisplay('RUN : run sequencer.')
      parent.play()
    }

    // char = esc
    else if (event.keyCode === 27) { 
      parent.info.innerHTML = this.infoDisplay('STOP : stop sequencer.', "e")
      parent.clear()
    }

    // char = r = reverse selected.
    else if (event.keyCode === 82) {
      parent.info.innerHTML = this.infoDisplay('REVERSE : reverse step.', 'reverse', "e")
      this.isReversedCursorPressed = true;
    }

      // char = u = increase selected bpm.
    else if (event.keyCode === 85) { 
      this.isUpPressed = true;
    }

    // char = d = decrease selected bpm.
    else if (event.keyCode === 68) { 
      this.isDownPressed = true;
    }

    // char = i = information.
    else if (event.keyCode === 73) { 
      parent.info.innerHTML = this.infoDisplay('INFORMATION : show target informations.','midiout', "i")
      this.isShowInfo = true;
    }

    // char = t = re-trigger.
    else if (event.keyCode === 84) { 
      parent.info.innerHTML = this.infoDisplay('INFORMATION : re-trigger.','midiout', "i")
      this.isRetriggered = true;
    }

    // char = x = delete highlight.
    else if (event.keyCode === 88) { 
      parent.info.innerHTML = this.infoDisplay('DELETE : remove target highlight.','delete', 'i')
      this.isDeletePressed = true;
    }

    else if (event.key === '>') { 
      parent.info.innerHTML = this.infoDisplay('INCREASE : increase BPM++.')
      parent.modSpeed(1); 
      event.preventDefault(); 
      return
    }

    else if (event.key === '<') { 
      parent.info.innerHTML = this.infoDisplay('INCREASE : decrease BPM--.')
      parent.modSpeed(-1); 
      event.preventDefault(); 
      return 
    }
    else {
      this.isKeyNotFound = true
    }
   
  }

  this.infoDisplay = function( command, color, icon = "e" ){
    parent.info.classList.add("limit-regex")
    this.isKeyNotFound = false
    return `
      <div class="info-group">
        <lf>INFO</lf> | 
      </div> 
      <lft>${command}</lft>
      <div class="info-icon-and-color">
        <div class="info-color ${color}"></div>
        <object type="image/svg+xml" data="media/icons/${icon}.svg" class="icons"></object>
      </div>
    `
  }

  this.onKeyUp = function (event) {
    
    if (parent.isInfoActived){ 
      return 
    } else if (!this.isKeyNotFound) {
      this.isMutePressed = false;
      this.isUpPressed = false;
      this.isDownPressed = false;
      this.keyboardPress = false;
      this.isDeletePressed = false;
      this.isShowInfo = false;
      this.isReversedCursorPressed = false;
      this.isRetriggered = false;
  
      parent.resetInfoBar()
    }
    // for performance's sake, not to render DOM for unassigned key.
    else { return }
  }

  document.onkeydown = (event) => { 
    // prevent repeated DOM rendering, when hold the keys.
    if( this.down ) return;
    this.down = true
    this.keyboardPress = true;
    this.onKeyDown(event) 
  }
  document.onkeyup = (event) => { 
    this.down = false
    this.onKeyUp(event) 
  }
}

module.exports = Keyboard
