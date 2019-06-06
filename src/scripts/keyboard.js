'use strict'

function Keyboard() {
  this.locks = []
  this.history = ''
  this.down = false;
  this.isKeyNotFound = false;

  this.onKeyDown = function (event) {

    // char = m
    if (event.keyCode === 77) { 
      seeq.info.innerHTML = this.infoDisplay('MUTE : mute target highlight.','mute', "e")
      seeq.isMutePressed = true;
    }

    // char = spacebar
    else if (event.keyCode === 32) { 
      seeq.info.innerHTML = this.infoDisplay('RUN : run sequencer.')
      seeq.play()
    }

    // char = esc
    else if (event.keyCode === 27) { 
      seeq.info.innerHTML = this.infoDisplay('STOP : stop sequencer.', "e")
      seeq.clear()
    }

    // char = r = reverse selected.
    else if (event.keyCode === 82) {
      seeq.info.innerHTML = this.infoDisplay('REVERSE : reverse step.', 'reverse', "e")
      seeq.isReversedCursorPressed = true;
    }

      // char = u = increase selected bpm.
    else if (event.keyCode === 85) { 
      seeq.isUpPressed = true;
    }

    // char = d = decrease selected bpm.
    else if (event.keyCode === 68) { 
      seeq.isDownPressed = true;
    }

    // char = i = information.
    else if (event.keyCode === 73) { 
      seeq.info.innerHTML = this.infoDisplay('INFORMATION : show target informations.','midiout', "i")
      seeq.isShowInfo = true;
    }

    // char = t = re-trigger.
    else if (event.keyCode === 84) { 
      seeq.info.innerHTML = this.infoDisplay('INFORMATION : re-trigger.','midiout', "i")
      seeq.isRetriggered = true;
    }

    // char = x = delete highlight.
    else if (event.keyCode === 88) { 
      seeq.info.innerHTML = this.infoDisplay('DELETE : remove target highlight.','delete', 'i')
      seeq.isDeletePressed = true;
    }

    else if (event.key === '>') { 
      seeq.info.innerHTML = this.infoDisplay('INCREASE : increase BPM++.')
      seeq.modSpeed(1); 
      event.preventDefault(); 
      return
    }

    else if (event.key === '<') { 
      seeq.info.innerHTML = this.infoDisplay('INCREASE : decrease BPM--.')
      seeq.modSpeed(-1); 
      event.preventDefault(); 
      return 
    }
    else {
      this.isKeyNotFound = true
    }
   
  }

  this.infoDisplay = function( command, color, icon = "e" ){
    seeq.info.classList.add("limit-regex")
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
    
    if(seeq.isInfoActived){ 
      return 
    } else if (!this.isKeyNotFound) {
      seeq.isMutePressed = false;
      seeq.isUpPressed = false;
      seeq.isDownPressed = false;
      seeq.keyboardPress = false;
      seeq.isDeletePressed = false;
      seeq.isShowInfo = false;
      seeq.isReversedCursorPressed = false;
      seeq.isRetriggered = false;
  
      seeq.resetInfoBar()
    }
    // for performance's sake, not to render DOM for unassigned key.
    else { return }
  }

  document.onkeydown = (event) => { 
    // prevent repeated DOM rendering, when hold the keys.
    if( this.down ) return;
    this.down = true
    seeq.keyboardPress = true;
    this.onKeyDown(event) 
  }
  document.onkeyup = (event) => { 
    this.down = false
    this.onKeyUp(event) 
  }
}

module.exports = Keyboard
