'use strict'

/* global seeq */

function Console(app) {

  const el = tag => document.createElement(tag);
  const qs = id => document.querySelector(id);

  this.el = el("div")
  this.el_elem = `
   <div class="controller-wrapper">
        <div class="header-wrapper console-1">
          <div class="header">
            <p data-logo="seeq" class="title">INPUT:</p>
            <terminal>
              <div id="content" data-ctrl="fetch" contenteditable="false"></div>
              <caret id="input-caret" for="terminal-input" class="caret btn-hide">&nbsp;</caret>
            </terminal>
          </div>
          <div class="header">
          <p class="title">REGEXP:</p>
            <terminal>
              <div id="regex" data-ctrl="regex" contenteditable="false"></div>
              <caret id="regex-caret" for="regex" class="caret btn-hide">&nbsp;</caret>
            </terminal>
          </div>
        </div>
       
        <div class="info">
          <div class="header-wrapper console-3 flex-col header-wrapper-status">
            <div class="tempo">
              <div class="information-details">
                <div style="display: grid;">
                  <p class="information-details"> BPM:</p>
                  <p class="information-details">TME:</p>
                  <p class="information-details">LEN:</p>
                  <p class="information-details">POS:</p>
                </div>
                <div class="performance-details">
                  <p class="init-bpm" data-ctrl="bpm">120</p>
                  <p data-ctrl="current">16th</p> 
                  <p data-ctrl="crsrlen">--</p>
                  <p data-ctrl="crsrpos">--</p>
                </div>
              </div>
              <div class="counter">
              </div> 
              </div>
              </div>

          <div class="header-wrapper console-3 flex-col header-wrapper-status">
            <div class="tempo">
              <div class="information-details">
                <div style="display: grid;">
                  <p class="information-details">OSC:</p>
                  <p class="information-details">UDP:</p> 
                  <p class="information-details">MIDI:</p> 
                </div>
                <div class="performance-details">
                  <p data-ctrl="osc">--</p>
                  <p data-ctrl="udp">--</p> 
                  <p data-ctrl="midi">--</p> 
                </div>
              </div>
            </div>
          </div>
        </div>
            `

  // button.
  this.prevBtn
  this.nextBtn 
  this.configBtn 
  this.inputFetch
  this.linkBtn 
  this.clearBtn 
  this.nudgeBtn 
  this.oscInfo 
  this.midiInfo
  this.bpmUpBtn
  this.bpmDownBtn
  this.devBtn 
  this.caret
  this.regexCaret
  // this.focusBtn
  // this.udpBtn 
  // this.revBtn 

  // this.notationMode 
  // this.extractLines 

  // Input. 
  // this.searchInput
  this.searchRegExp
  this.regexInput
  this.fetchSearchInput = ""
  this.searchValue = ""
 
  // Console status display.
  this.bpmNumber
  this.metronomeBtn
  this.currentNumber
  this.cursorLength
  this.cursorPosition
  this.isInfoToggleOpened = false

  // state.
  this.isActive = false
  this.isConfigToggle = false
  this.isLinkToggle = false
  this.isUDPToggled = false
  this.isOSCToggled = false
  this.isReverse = false
  this.isPlaying = false
  this.isFocus = false
  this.isBPMtoggle = false
  this.isInsertable = false
  this.updateMarkType = "normal"
  this.isSearchModeChanged = false
  this.output = ""
  this.beatRatio = '16th'
  
  this.isInputFocused = false
  this.isFindFocused = false
  this.isRegExpFocused = false

  // --------------------------------------------------------

  document.addEventListener("DOMContentLoaded", function () {
    const self = app.console
    self.inputFetch = qs("div[data-ctrl='fetch']")
    self.searchRegExp = qs("div[data-ctrl='regex']")
    self.getTextBtn = qs("button[data-gettext='gettext']")
    self.caret = qs("caret#input-caret")
    self.regexCaret = qs("caret#regex-caret")
    self.oscInfo = qs("p[data-ctrl='osc']")
    self.midiInfo = qs("p[data-ctrl='midi']")
    self.bpmNumber = qs("p[data-ctrl='bpm']")
    self.currentNumber = qs("p[data-ctrl='current']")
    self.cursorLength = qs("p[data-ctrl='crsrlen']")
    self.cursorPosition = qs("p[data-ctrl='crsrpos']")

    // input to get.
    self.inputFetch.addEventListener("input", function (e) { 
      self.fetchSearchInput = this.innerText; 
      seeq.displayer.displayMsg("console")
    })
    self.inputFetch.addEventListener("focus", function () { self.isInputFocused = true; self.setFocusStyle(self.inputFetch) })
    self.inputFetch.addEventListener("blur", function () { self.isInputFocused = false; self.removeFocusStyle(self.inputFetch) })

    // RegExp.
    self.searchRegExp.addEventListener("input", function () {
      self.searchType = "regex"
      self.isRegExpFocused = !self.isRegExpFocused
      self.regexInput = this.innerText
      console.log("ldjfdsl", this.innerText)
      seeq.getMatchedPosition() //TODO: return value instead.
      seeq.displayer.displayMsg("regex")
    });
    self.searchRegExp.addEventListener("focus", function () { self.setFocusStyle(self.searchRegExp) });
    self.searchRegExp.addEventListener("blur", function () {self.removeFocusStyle(self.searchRegExp) });
  });

  this.focusAndMoveCursorToTheEnd = function(input) {  
    input.focus();
    
    const range = document.createRange();
    const selection = window.getSelection();
    const { childNodes } = input;
    const lastChildNode = childNodes && childNodes.length - 1;
    
    range.selectNodeContents(lastChildNode === -1 ? input : childNodes[lastChildNode]);
    range.collapse(false);
  
    selection.removeAllRanges();
    selection.addRange(range);
  }
  

  this.build = function () {
    this.el.innerHTML += this.el_elem
    app.el.appendChild(this.el)
  }
  
  this.setBPMdisplay = function () {
    app.bpmNumber.innerHTML = app.clock().bpm
  }

  this.setCounterDisplay = function () {
    app.currentNumber.innerHTML = this.beatRatio
  }

  this.setCPUUsageDisplay = function(v){
    let trimmedData = v.toFixed(2)
    app.cpuUsage.innerHTML = trimmedData + " " + "%"
  }

  this.setTotalLenghtCounterDisplay = function () {
    this.cursorLength.innerHTML = canvas.texts.length
  }

  this.toggleInsert = function (el, caret) {
    if (this.isInsertable) {
      el.classList.remove("disable-input")
      caret.classList.remove("btn-hide")
      el.focus()
      this.focusAndMoveCursorToTheEnd(el);
    } else {
      el.classList.add("disable-input")
      caret.classList.add("btn-hide")
      el.blur()
    }
  }

  this.toggleIsSearchModeChanged = function () {
    this.isSearchModeChanged = !this.isSearchModeChanged
  }

  this.runCmd = function(id){
    let target = document.getElementById(id)

    target.classList.add("trigger-input")
    this.isInputFocused? app.startFetch():() => {}
    setTimeout(() => {
      target.classList.remove("trigger-input") 
    }, 200);
  
  }

  this.togglePort = function(type, bind){
    if(type === 'UDP'){
      this.isUDPToggled = !this.isUDPToggled
    } else if ( type === 'OSC'){
      this.isOSCToggled = !this.isOSCToggled 
      if (this.isOSCToggled) { app.io.osc.setup(); }
    } else if ( type === 'REV'){
      this.isReverse = !this.isReverse
    } else if ( type === 'FOCUS'){
      this.isFocus = !this.isFocus 
    }
  }

  this.setFocusStyle = function(target){
    // target.style.backgroundColor = "#3EFB00" 
  }

  this.removeFocusStyle = function(target){
    // target.style.backgroundColor = "#FFFFFF"  
  }

}