'use strict'

/* global client */

function Console(app) {

  const el = tag => document.createElement(tag);
  const qs = id => document.querySelector(id);

  this.el = el("div")
  this.el_elem = `
   <div class="controller-wrapper">
        <div class="header-wrapper console-1">
          <div class="header">
            <p data-logo="client" class="title">INPUT:~$ </p>
            <terminal>
              <div id="content" data-ctrl="fetch" contenteditable="false" autocomplete="off" autocorrect="off" autocapitalize="off"></div>
              <caret id="input-caret" for="terminal-input" class="caret hide">&nbsp;</caret>
            </terminal>
          </div>
          <div class="header">
            <p class="title">REGEX:~$ </p>
            <terminal>
              <div id="regex" data-ctrl="regex" contenteditable="false" autocomplete="off" autocorrect="off" autocapitalize="off"></div>
              <caret id="regex-caret" for="regex" class="caret hide">&nbsp;</caret>
            </terminal>
          </div>
          <div class="header">
            <p class="title">MODE:</p>
            <terminal class="regex-mode"> 
              <p data-ctrl="regex-mode-realtime">Realtime</p>&nbsp;/&nbsp;
              <p data-ctrl="regex-mode-oneval">On-Eval</p>
            </terminal>
          </div>
          <div class="header">
            <p class="title">FLAG:</p>
            <terminal class="regex-flag">
              <p data-ctrl="regex-flag-g" class="active">g</p>|
              <p data-ctrl="regex-flag-i">i</p>|
              <p data-ctrl="regex-flag-m">m</p>|
              <p data-ctrl="regex-flag-u">u</p>|
              <p data-ctrl="regex-flag-s">s</p>|
              <p data-ctrl="regex-flag-y">y</p>
            </terminal>
          </div>
        </div>
       
        <div class="info">
          <div class="header-wrapper console-3 flex-col header-wrapper-status">
            <div class="tempo">
              <div class="information-details">
                <div style="display: grid;">
                  <p class="title">BPM:</p>
                  <p class="title">TME:</p>
                  <p class="title">LEN:</p>
                  <p class="title">POS:</p>
                </div>
                <div class="performance-details">
                  <p class="init-bpm" data-ctrl="bpm">120</p>
                  <p data-ctrl="current">1:16</p> 
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
                  <p class="title">OSC:</p>
                  <p class="title">UDP:</p> 
                  <p class="title">MIDI:</p> 
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
          <div class="mt"> <p data-ctrl="regex-error"></p> </div>
            `

  this.inputFetch
  this.oscInfo 
  this.midiInfo
  this.caret
  this.regexCaret

  this.searchRegExp
  this.regexInput
  this.regexModeIndex = 0
  this.regexModeRealtimeElem
  this.regexModeOnEvalElem
  this.regexErrorElem
  this.fetchSearchInput = ""
  this.searchValue = ""
  this.regexMode = [RegexMode.Realtime, RegexMode.OnEval]
  this.regexFlags = [
    RegexFlag.Global, 
    RegexFlag.Insensitive, 
    RegexFlag.Multiline, 
    RegexFlag.Unicode, 
    RegexFlag.Dotall, 
    RegexFlag.Sticky
  ]
 
  // Console status display.
  this.bpmNumber
  this.currentNumber
  this.highlightLength
  this.cursorPosition
  this.isInfoToggleOpened = false

  // state.
  this.isActive = false
  this.isConfigToggle = false
  this.isUDPToggled = false
  this.isOSCToggled = false
  this.isReverse = false
  this.isPlaying = false
  this.isFocus = false
  this.isBPMtoggle = false
  this.output = ""
  this.regexFlagSelect = new Set("g")
  
  this.isInputFocused = false
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
    self.highlightLength = qs("p[data-ctrl='crsrlen']")
    self.cursorPosition = qs("p[data-ctrl='crsrpos']")
    self.regexModeRealtimeElem = qs("p[data-ctrl='regex-mode-realtime']")
    self.regexModeOnEvalElem = qs("p[data-ctrl='regex-mode-oneval']")
    self.regexErrorElem = qs("p[data-ctrl='regex-error']")
    qs(`p[data-ctrl=${self.regexMode[self.regexModeIndex].description}]`).classList.add("active")

    const attrObserver = new MutationObserver((mutations) => {
      mutations.forEach(mu => {
        if (mu.type !== "attributes" && mu.attributeName !== "class") return;
        if (mu.target.className === "active") {
          self.regexFlagSelect.add(mu.target.textContent)
        } else {
          self.regexFlagSelect.delete(mu.target.textContent) 
        }
      });
    });

    let regexFlagElem = self.regexFlags.map(el => qs(`p[data-ctrl=${el.description}]`));
    regexFlagElem.forEach(el => attrObserver.observe(el, {attributes: true}));

    // input 
    self.inputFetch.addEventListener("input", function (e) { 
      self.fetchSearchInput = this.innerText; 
      client.displayer.displayMsg("console")
    })
    self.inputFetch.addEventListener("focus", function () { 
      self.isInputFocused = true; 
      self.setFocusStyle(self.inputFetch) 
    })
    self.inputFetch.addEventListener("blur", function () { 
      self.isInputFocused = false; 
      self.removeFocusStyle(self.inputFetch) 
    })

    // RegExp.
    self.searchRegExp.addEventListener("input", function () {
      self.searchType = "regex"
      self.regexInput = this.innerText
      if (self.regexMode[self.regexModeIndex] === RegexMode.Realtime) {
        client.handleRegexInput() 
      } 
      client.displayer.displayMsg("regex")
    });
    self.searchRegExp.addEventListener("focus", function () { 
      self.isRegExpFocused=true; 
      self.setFocusStyle(self.searchRegExp) 
    });
    self.searchRegExp.addEventListener("blur", function () { 
      self.isRegExpFocused=false; 
      self.removeFocusStyle(self.searchRegExp) 
    });
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

  this.setTotalLenghtCounterDisplay = function () {
    this.highlightLength.innerHTML = canvas.texts.length
  }

  this.inputFocus = function(state = false){
    this.isInputFocused = state
  }
  
  this.regexFocus = function(state = false) {
    this.isRegExpFocused = state
  }

  this.isInsertable = function(){
    return this.isInputFocused || this.isRegExpFocused
  }

  this.toggleInsert = function (el, caret, condition) {
    if (condition) {
      el.classList.remove("disable-input")
      caret.classList.remove("hide")
      el.setAttribute("contenteditable", "true")
      el.focus()
      this.focusAndMoveCursorToTheEnd(el);
    } else {
      el.classList.add("disable-input")
      el.setAttribute("contenteditable", "false")
      caret.classList.add("hide")
      el.blur()
    }
  }

  this.runCmd = function(id){
    let target = document.getElementById(id)

    target.classList.add("trigger-input")
    if (this.isInputFocused) {
      app.startFetch()
    } else {
      canvas.clearMarksPos()
      app.handleRegexInput()
    } 
    setTimeout(() => {
      target.classList.remove("trigger-input") 
    }, 200);
  
  }

  this.togglePort = function(type, bind){
    if(type === 'UDP'){
      this.isUDPToggled = !this.isUDPToggled
    } else if ( type === 'OSC'){
      this.isOSCToggled = !this.isOSCToggled 
      if (this.isOSCToggled) { canvas.io.osc.setup(); }
    } else if ( type === 'REV'){
      this.isReverse = !this.isReverse
    } else if ( type === 'FOCUS'){
      this.isFocus = !this.isFocus 
    }
  }

  this.changeRegexMode = function() {
    qs(`p[data-ctrl=${this.regexMode[this.regexModeIndex].description}]`).classList.remove("active")
    this.regexModeIndex++
    this.regexModeIndex = this.regexModeIndex % this.regexMode.length
    qs(`p[data-ctrl=${this.regexMode[this.regexModeIndex].description}]`).classList.add("active")
  }

  this.changeRegexFlag = function(index) {
    qs(`p[data-ctrl=${this.regexFlags[index].description}]`).classList.toggle("active")
  }

  this.setFocusStyle = function(target){
    // target.style.backgroundColor = "#3EFB00" 
  }

  this.removeFocusStyle = function(target){
    // target.style.backgroundColor = "#FFFFFF"  
  }

}