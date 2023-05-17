'use strict'

function Displayer(app) {

  const el = tag => document.createElement(tag);
  const qs = id => document.querySelector(id);

  // create.
  this.el = el("div")
  this.el_elem = el("div")
  this.main_text = el("div")
  this.default_text = DISPLAYER_DEFAULT_TEXTS

  // state.
  this.displayerInput = ""
  this.isOscShowed = false
  this.isConsoleInputShowed = false
  this.isDefaultShowed = true
  this.isActivedCursorShowed = false
  this.currentCmd = ""

  this.oscMsgPathElem = null

  this.displayType = "default"
  this.isDisplayInputToggled = false
  this.isDisplayFormFocused = false
  this.displayInputTarget = null

  this.helperMsg = ""
  this.errorMsgElem = null

  this.tabInputIndex = 0

  this.inputRef = {
    "osc": ["displayer-osc-path", "displayer-osc-msg"],
    "midi": ["displayer-midi-note", "displayer-midi-notelen","displayer-midi-velo", "displayer-midi-chan"],
    "rename-marker": ["displayer-rename-marker"]
  }

  this.caretRef = {
    "osc": ["caret-osc-path", "caret-osc-msg"],
    "midi": ["caret-midi-note", "caret-midi-notelen","caret-midi-velo", "caret-midi-chan"],
    "rename-marker": ["caret-rename-marker"]
  }

  this.omitCmdList = ["osc", "midi", "rename-marker"]
  
  this.oscConf = {
    path: "",
    msg: ""
  }

  this.midiConf = {
    note: "", 
    notelength: "", 
    velocity: "", 
    channel: "",
  }

  this.renameInput = ""
  this.isOscFocused = false

  // Observered Selection.
  this.observeConfig = { 
    subtree: true,
    childList: true,
  };

  // -------------------------------------------------------
  
  this.el_with_input = el("div")
  this.el_error_msg = el("div")
  this.el_general = el("div")
  this.input_text_default = el("div")
  this.input_error_default = `<div class="displayer-warning displayer-logger"> <p data-ctrl="osc-error"></p> </div>`

  document.addEventListener("DOMContentLoaded", function () {
    const self = app.displayer    
    self.errorMsgElem = qs("p[data-ctrl='osc-error']")

    function handleInput(e){
      if(self.currentCmd === 'osc'){
        self.oscConf[e.target.id === "osc-path" ? "path" : "msg"] = e.target.textContent;
      } else if( self.currentCmd === 'rename-marker'){
        self.renameInput = e.target.textContent
      } else if( self.currentCmd === 'midi'){
        self.midiConf[e.target.getAttribute("type")] =  e.target.textContent
      }
    }

    function handleFocus(e){
      e.preventDefault();
      // console.log("focus", e.target.dataset["ctrl"])
    }

    function handleBlur(e){
      e.preventDefault();
      // console.log("blur", e)
    }

    const observeCallback = function(mutationsList, observer) {
      for(var mutation of mutationsList){
        if (self.isDisplayInputToggled) {
          self.displayInputTarget = mutation.target
          mutation.target.addEventListener("input", handleInput)
          mutation.target.addEventListener("focus", handleFocus, true) 
          mutation.target.addEventListener("blur", handleBlur, true) 
        } else {
          self.displayInputTarget = null
          mutation.target.removeEventListener("input", handleInput) 
          mutation.target.removeEventListener("focus", handleFocus, true) 
          mutation.target.removeEventListener("blur", handleBlur, true) 
        }
      }
    };
      
    let observer = new MutationObserver(observeCallback); 
    observer.observe(self.el, self.observeConfig);

  })


  this.build = function(){
    this.buildWrapper()
    this.buildInputDisplay()
    this.buildGeneralDisplay()
    app.el.appendChild(this.el)
  }

  this.buildWrapper = function(){
    this.el_elem.classList.add("limit")
    this.main_text.classList.add("displayer-default")
    this.main_text.classList.add("displayer-show")
    this.main_text.innerText = this.default_text
    this.el.setAttribute("id", "info-bar")
    this.el.setAttribute("data-ctrl", "information")
    this.el_elem.appendChild(this.main_text)
    this.el.appendChild(this.el_elem)
  }

  this.run = function(){
    let active = canvas.marker.markers[canvas.marker.active]
    let pairedNoteAndOct
    
    switch (this.currentCmd) {
      case 'active-marker':
        this.displayType = "preview"
        this.el_general.innerHTML = `<div class="displayer-bold">${active.n}</div>` 
        break;
      case 'helper':
        this.displayType = "preview"
        this.el_general.innerHTML = `<p class="displayer-warning">${this.helperMsg}<p>` 
        break;
      case 'show-marker-info':
        this.displayType = "preview"
        this.el_general.innerText = `name: ${canvas.marker.markers[canvas.marker.active].n}\n${JSON.stringify(canvas.marker.markers[canvas.marker.active]["control"])}` 
        break;
      case 'osc':
        this.isDisplayInputToggled = !this.isDisplayInputToggled
        this.displayType = this.isDisplayInputToggled? "form":"default"
        this.el_with_input.innerHTML = `
          <div id="info-osc" class="info-input">
            <div class="displayer-form-short-wrapper">
              <p>PATH:</p>
              <terminal>
                <div id="osc-path" data-ctrl="displayer-osc-path" type="osc-path" tabindex="-1" contenteditable="false" autocomplete="off" autocorrect="off" autocapitalize="off">${active.msg.OSC.path}</div>
                <caret id="caret-osc-path" for="osc-path" class="caret hide">&nbsp;</caret>
              </terminal>
            </div>
            <lf>
              <p>MSG:</p>
              <terminal>
                <div id="osc-msg" data-ctrl="displayer-osc-msg" type="text" tabindex="-1" contenteditable="false" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">${active.msg.OSC.msg}</div>
                <caret id="caret-osc-msg" for="osc-msg" class="caret hide">&nbsp;</caret>
              </terminal>
            </lf>
          </div>
        `
        let oscMsgPathElem = qs("div[data-ctrl='displayer-osc-path']")
        let oscMsgInput = qs("caret#caret-osc-path")
        this.toggleInsert(oscMsgPathElem, oscMsgInput)
        this.errorMsgElem.classList.remove("hide")
        this.disableNotActiveInput()
        break;
      case 'midi':
        this.isDisplayInputToggled = !this.isDisplayInputToggled
        this.displayType = this.isDisplayInputToggled? "form":"default"
        pairedNoteAndOct = this.getPairedNoteAndOct(active)
        this.el_with_input.innerHTML = `
          <div id="info-osc" class="info-input">
            <div class="displayer-form-short-wrapper">
              <p>N:</p>
              <terminal>
                <div id="midi-note" data-ctrl="displayer-midi-note" type="note" tabindex="-1" contenteditable="false" autocomplete="off" autocorrect="off" autocapitalize="off">${pairedNoteAndOct}</div>
                <caret id="caret-midi-note" for="midi-note" class="caret hide">&nbsp;</caret>
              </terminal>
            </div>
            <div class="displayer-form-short-wrapper">
              <p>L:</p>
              <terminal>
                <div id="midi-notelen" data-ctrl="displayer-midi-notelen" type="notelength" tabindex="-1" contenteditable="false" autocomplete="off" autocorrect="off" autocapitalize="off">${active.msg.MIDI.notelength.join()}</div>
                <caret id="caret-midi-notelen" for="midi-notelen" class="caret hide">&nbsp;</caret>
              </terminal>
            </div>
            <div class="displayer-form-short-wrapper">
              <p>V:</p>
              <terminal>
                <div id="midi-velo" data-ctrl="displayer-midi-velo" type="velocity" tabindex="-1" contenteditable="false" autocomplete="off" autocorrect="off" autocapitalize="off">${active.msg.MIDI.velocity.join()}</div>
                <caret id="caret-midi-velo" for="midi-velo" class="caret hide">&nbsp;</caret>
              </terminal>
            </div>
            <div class="displayer-form-short-wrapper">
              <p>C:</p>
              <terminal>
                <div id="midi-chan" data-ctrl="displayer-midi-chan" type="channel" tabindex="-1" contenteditable="false" autocomplete="off" autocorrect="off" autocapitalize="off">${active.msg.MIDI.channel}</div>
                <caret id="caret-midi-chan" for="midi-chan" class="caret hide">&nbsp;</caret>
              </terminal>
          </div>
          </div>
        `
        let midiMsgElem = qs("div[data-ctrl='displayer-midi-note']")
        let midiMsgInput = qs("caret#caret-midi-note")
        this.toggleInsert(midiMsgElem, midiMsgInput)
        this.disableNotActiveInput()
        break;
      case 'regex':
        this.displayType = "preview"  
        let regexToDisplay = app.console.regexInput;
        let flags = ""
        app.console.regexFlagSelect.forEach(r => flags += r)
        this.el_general.innerHTML = `<div class="displayer-bold">${regexToDisplay !== "\n" ? `/${regexToDisplay}/${flags}` : `//${flags}` }</div>`
        break;
      case 'console':
        this.displayType = "preview"  
        this.el_general.innerHTML = `<div class="displayer-bold">${app.console.fetchSearchInput}</div>`
        break;
      case 'rename-marker':
        this.isDisplayInputToggled = !this.isDisplayInputToggled
        this.displayType = this.isDisplayInputToggled? "form":"default"
        this.el_with_input.innerHTML = `
          <div id="dp-cs-rename" class="info-input">
            <lf>
              <p>name:</p>
              <terminal>
                <div id="rename-marker" data-ctrl="displayer-rename-marker" type="rename" tabindex="-1" contenteditable="false" autocomplete="off" autocorrect="off" autocapitalize="off">${active.n}</div>
                <caret id="caret-rename-marker" for="rename-marker" class="caret hide">&nbsp;</caret>
              </terminal>
            </lf>
          </div>`

        let markerRenameElem = qs("div[data-ctrl='displayer-rename-marker']")
        let markerRenameInput = qs("caret#caret-rename-marker")
        this.toggleInsert(markerRenameElem, markerRenameInput)
        break;
      case 'default':
        this.displayType = "default"
    }

    // TODO: cleanup this
    if( this.displayType === "preview"){
      this.el_general.classList.add("displayer-show")
      this.el_with_input.classList.remove("displayer-show")
      this.main_text.classList.remove("displayer-show")
    } else if ( this.displayType === "form"){
      this.el_with_input.classList.add("displayer-show")
      this.el_general.classList.remove("displayer-show")
      this.main_text.classList.remove("displayer-show")
    } else if (this.displayType === "default"){
      this.main_text.classList.add("displayer-show")
      this.el_general.classList.remove("displayer-show")
      this.el_with_input.classList.remove("displayer-show")
    }

    if(!this.isDisplayInputToggled) { this.resetTabInputIndex() }
  }

  this.shouldSkipTriggerFX = function(cmd){
    return !this.omitCmdList.includes(cmd)
  }

  this.runCmd = function(){
    if (this.timer) { 
      this.displayInputTarget.classList.remove("trigger-input")
      clearTimeout(this.timer)
    }

    switch (this.currentCmd) {
      case 'osc':
        canvas.marker.setOSCmsg();
        break;
      case 'rename-marker':
        canvas.marker.setCursorName();
        break;
      case 'midi':
        canvas.marker.setMIDImsg();
        break;
    }
    if (this.shouldSkipTriggerFX(this.currentCmd)) return
    this.displayInputTarget.classList.add("trigger-input")
    this.timer = setTimeout(() => { this.displayInputTarget.classList.remove("trigger-input")  }, 200);
  }

  this.handleTab = function(){
    let elem  = qs(`div[data-ctrl='${this.inputRef[this.currentCmd][this.tabInputIndex]}']`)
    let input = qs(`caret#${this.caretRef[this.currentCmd][this.tabInputIndex]}`)
    this.toggleInsert(elem, input)
    this.disableNotActiveInput()
  }

  this.disableNotActiveInput = function() {
    this.inputRef[this.currentCmd].forEach(( ref, idx ) => {
      if(idx !== this.tabInputIndex){
        const previousInput  = qs(`div[data-ctrl='${ref}']`)
        const previousOscMsgInput = qs(`caret#${this.caretRef[this.currentCmd][idx]}`)
        this.toggleInsert(previousInput, previousOscMsgInput)
      }
    })
  }

  this.resetTabInputIndex = function(){
    this.tabInputIndex = 0
  }

  this.buildInputDisplay = function () {
    this.el_with_input.classList.add("displayer-osc")
    this.el_with_input.innerHTML += this.input_text_default
    this.el_error_msg.innerHTML += this.input_error_default
    this.el_elem.appendChild(this.el_with_input)
    this.el_elem.appendChild(this.el_error_msg)
  }

  this.buildGeneralDisplay = function () {
    this.el_general.classList.add("displayer-active-marker")
    this.el_elem.appendChild(this.el_general)
  }

  this.displayDefault = function(){
    this.currentCmd = "default"
    this.helperMsg = ""
    this.errorMsgElem.classList.add("hide")
    this.run();
  }

  this.displayMsg = function(type){
    this.currentCmd = type
    this.run();
  }

  this.setDisplayerErrMsg = function(msg) {
    this.errorMsgElem.innerText = msg
  }

  this.setFocusStyle = function(target){
    target.style.backgroundColor = "#3EFB00" 
  }

  this.removeFocusStyle = function(target){
    target.style.backgroundColor = "#FFFFFF"  
  }

  this.getPairedNoteAndOct = function(target){
    var notes, noteWithOct = [];
    
    for (var i = 0; i < target.msg.MIDI.note.length; i++) {
      noteWithOct.push(`${ target.msg.MIDI.note[i] }${ target.msg.MIDI.octave[i]}`)
    }
    notes = noteWithOct.join()

    return notes
  }


  // TODO: duplicated with console.js please dont forget to remove this.
  this.focusAndMoveCursorToTheEnd = function(input) {  
    const range = document.createRange();
    const selection = window.getSelection();
    const { childNodes } = input;
    const lastChildNode = childNodes && childNodes.length - 1;
    
    range.selectNodeContents(lastChildNode === -1 ? input : childNodes[lastChildNode]);
    range.collapse(false);
  
    selection.removeAllRanges();
    selection.addRange(range);
  }

  // TODO: clean up the mess
  this.toggleInsert = function (el, caret) {
    if (this.isDisplayInputToggled) {
      if(el.getAttribute("data-ctrl") === this.inputRef[this.currentCmd][this.tabInputIndex]) {
        el.classList.remove("disable-input")
        caret.classList.remove("hide")
        el.setAttribute("contenteditable", "true")
        this.focusAndMoveCursorToTheEnd(el);
        el.focus()
      } else {
        el.classList.add("disable-input")
        caret.classList.add("hide")
        el.setAttribute("contenteditable", "false")
        el.blur() 
      }
    } else {
      el.classList.add("disable-input")
      caret.classList.add("hide")
      el.setAttribute("contenteditable", "false")
      el.blur()
    }
  }

  this.increseTabInputIndex = function(){
    this.tabInputIndex++
    this.tabInputIndex = this.tabInputIndex % ( this.inputRef[this.currentCmd].length)
  }
}