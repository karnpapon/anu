'use strict'

function Displayer(app) {

  const el = tag => document.createElement(tag);

  // create.
  this.el = el("div")
  this.el_elem = el("div")
  this.main_text = el("div")
  this.default_text = "(Cmd-i or Ctrl-i) toggle input\n (Cmd-g or Ctrl-g) toggle Regex input\n(Return) eval input\n(h) toggle helps window\n"

  
  // state.
  this.displayerInput = ""
  this.isOscShowed = false
  this.isConsoleInputShowed = false
  this.isDefaultShowed = true
  this.isActivedCursorShowed = false
  this.currentCmd = ""

  this.displayType = "default"
  this.isDisplayInputToggled = false
  this.isDisplayFormFocused = false
  this.displayInputTarget = null
  
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
  this.observeConfig = { childList: true, subtree: true };

  // -------------------------------------------------------
  
  this.el_with_input = el("div")
  this.el_general = el("div")
  this.input_text_default = `
    <form id="info-osc" class="info-input">
      <lf>
        <p>MSG:</p>
        <input id="addosc" class="displayer-form" type="osc" value="">
      </lf>
    </form>
  `

  document.addEventListener("DOMContentLoaded", function () {
    const self = app.displayer
    var observeCallback = function(mutationsList, observer) {
      for(var mutation of mutationsList){
        if(mutation.target.lastElementChild.nodeName === "FORM"){
           
          for( var mut_elem of mutation.target.lastElementChild){
            let target  = mut_elem
            target.addEventListener("input", function(){
              if(self.currentCmd === 'osc'){
                self.oscConf.path =  target.getAttribute("type") === 'osc-path'? target.value:""
                self.oscConf.msg =  target.getAttribute("type") === 'osc'? target.value:""
              } else if( self.currentCmd === 'rename-cursor'){
                self.renameInput = target.value 
              } else if( self.currentCmd === 'midi'){
                self.midiConf.note =  target.getAttribute("type") === 'midi-note'? target.value:""
                self.midiConf.notelength =  target.getAttribute("type") === 'midi-notelen'? target.value:""
                self.midiConf.velocity =  target.getAttribute("type") === 'midi-velo'? target.value:""
                self.midiConf.channel =  target.getAttribute("id") === 'midi-chan'? target.value:""
              }
            })
            
            target.addEventListener("focus", function(){
              self.isDisplayFormFocused = true
              self.displayInputTarget = target
              self.setFocusStyle(target)
            })
            target.addEventListener("blur", function(){
              self.isDisplayFormFocused = false
              self.removeFocusStyle(target) 
            })
          }
        }
      }
    };
      
    var observer = new MutationObserver(observeCallback); 
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
    let active = canvas.cursor.cursors[canvas.cursor.active]
    let target, pairedNoteAndOct
    

    switch (this.currentCmd) {
      case 'active-cursor':
        this.displayType = "preview"
        target = this.el_general
        target.innerHTML = `<div class="displayer-bold">${active.n}</div>` 
        break;
      case 'helper':
        this.displayType = "preview"
        target = this.el_general
        target.innerText = `cmd (⌘) or ctrl + h = helps.` 
        break;
      case 'osc':
        this.isDisplayInputToggled = !this.isDisplayInputToggled
        this.displayType = this.isDisplayInputToggled? "form":"default"
        target = this.el_with_input
        target.innerHTML = `
          <form id="info-osc" class="info-input">
            <div class="displayer-form-short-wrapper">
              <p>PATH:</p>
              <input class="displayer-form-short" type="osc-path" value="${active.msg.OSC.path}">
            </div>
            <lf>
            <p>MSG:</p>
            <input id="addosc" class="displayer-form" type="osc" value="${active.msg.OSC.msg}">
          </lf>
          </form>
        `
        break;
      case 'midi':
        this.isDisplayInputToggled = !this.isDisplayInputToggled
        this.displayType = this.isDisplayInputToggled? "form":"default"
        target = this.el_with_input
        pairedNoteAndOct = this.getPairedNoteAndOct(active)
        target.innerHTML = `
          <form id="info-osc" class="info-input">
            <div class="displayer-form-short-wrapper">
              <p>N:</p>
              <input class="displayer-form" placeholder="note" type="midi-note" value="${pairedNoteAndOct}">
            </div>
            <div class="displayer-form-short-wrapper">
              <p>L:</p>
              <input class="displayer-form-short" placeholder="length" type="midi-notelen" value="${active.msg.MIDI.notelength.join()}">
            </div>
            <div class="displayer-form-short-wrapper">
              <p>V:</p>
              <input class="displayer-form-short" placeholder="velocity" type="midi-velo" value="${active.msg.MIDI.velocity.join()}">
            </div>
            <div class="displayer-form-short-wrapper">
            <p>C:</p>
            <input id="midi-chan" class="displayer-form-short" placeholder="channel" type="number" min="0" max="15" value="${active.msg.MIDI.channel}">
          </div>
          </form>
        `
        break;
      case 'regex':
        this.displayType = "preview"  
        target = this.el_general
        let regexToDisplay = app.console.regexInput.replace(/[)(]/g, "\\$&");
        target.innerHTML = `<div class="displayer-bold">${new RegExp(regexToDisplay,"gi")}</div>`
        break;
      case 'console':
        this.displayType = "preview"  
        target = this.el_general
        target.innerHTML = `<div class="displayer-bold">${app.console.fetchSearchInput}</div>`
        break;
      case 'rename-cursor':
        this.isDisplayInputToggled = !this.isDisplayInputToggled
        this.displayType = this.isDisplayInputToggled? "form":"default"
        target = this.el_with_input
        target.innerHTML = `
        <form id="dp-cs-rename" class="info-input">
          <lf>
            <p>name:</p>
            <input class="displayer-form" type="rename" value="${active.n}">
          </lf>
        </form>`
        break;
      case 'default':
        this.displayType = "default"
        target = this.el_general
        break;
    }

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
  }

  this.runCmd = function(){
    let target = this.displayInputTarget
    switch (this.currentCmd) {
      case 'osc':
        canvas.cursor.setOSCmsg();
        break;
      case 'rename-cursor':
        canvas.cursor.setCursorName();
        break;
      case 'midi':
        canvas.cursor.setMIDImsg();
        break;
    }
    target.classList.add("trigger-input")
    setTimeout(() => {target.classList.remove("trigger-input")  }, 200);
  }

  this.buildInputDisplay = function () {
    this.el_with_input.classList.add("displayer-osc")
    this.el_with_input.innerHTML += this.input_text_default
    this.el_elem.appendChild(this.el_with_input)
  }

  this.buildGeneralDisplay = function () {
    this.el_general.classList.add("displayer-active-cursor")
    this.el_elem.appendChild(this.el_general)
  }

  this.displayDefault = function(){
    this.currentCmd = "default"
    this.run();
  }

  this.displayMsg = function(type){
    this.currentCmd = type
    this.run();
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


}