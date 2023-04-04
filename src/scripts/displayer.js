'use strict'

function Displayer(app) {

  const el = tag => document.createElement(tag);
  const qs = id => document.querySelector(id);

  // create.
  this.el = el("div")
  this.el_elem = el("div")
  this.main_text = el("div")
  this.default_text = "(CmdOrCtrl-i) toggle input\n (CmdOrCtrl-g) toggle Regex input\n(Return) eval input (target input must = ON)\n(h) toggle helps window\n"

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

  this.tabInputIndex = 0

  this.inputRef = {
    "osc": ["displayer-osc-path", "displayer-osc-msg"],
    "midi": []
  }

  this.caretRef = {
    "osc": ["caret-osc-path", "caret-osc-msg"],
    "midi": []
  }
  
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

    function handleInput(e){
      if(self.currentCmd === 'osc'){
        self.oscConf.path = e.target.textContent;
        // self.oscConf.msg =  target.getAttribute("type") === 'osc'? target.value:""
        console.log("self.oscConf",self.oscConf )
      } else if( self.currentCmd === 'rename-highlighter'){
        console.log("rename-highlighterrename-highlighter")
        // self.renameInput = target.value 
      } else if( self.currentCmd === 'midi'){
        console.log("midimidimidimidi")
        // self.midiConf.note =  target.getAttribute("type") === 'midi-note'? target.value:""
        // self.midiConf.notelength =  target.getAttribute("type") === 'midi-notelen'? target.value:""
        // self.midiConf.velocity =  target.getAttribute("type") === 'midi-velo'? target.value:""
        // self.midiConf.channel =  target.getAttribute("id") === 'midi-chan'? target.value:""
      }
    }

    function handleFocus(e){
      self.isDisplayFormFocused = true
      console.log("focus")
    }

    function handleBlur(e){
      self.isDisplayFormFocused = false
      console.log("blur")
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

        // mutation.target.addEventListener("blur", function(e){
        //   // this.isDisplayFormFocused = false
        //   console.log("this blur")
        // })  

        // if(mutation.target.lastElementChild.nodeName === "DIV"){
          
          // for( var mut_elem of mutation.target.lastElementChild.children){
            // let target  = mut_elem

            // target.addEventListener("input", function(){
              // if(self.currentCmd === 'osc'){
                // self.oscConf.path =  self.oscMsgPathElem.innerText;
                // self.oscConf.msg =  target.getAttribute("type") === 'osc'? target.value:""
                // console.log("self.oscConf", self.oscConf)
              // } else if( self.currentCmd === 'rename-highlighter'){
                // console.log("rename-highlighterrename-highlighter")
                // self.renameInput = target.value 
              // } else if( self.currentCmd === 'midi'){
                // console.log("midimidimidimidi")
                // self.midiConf.note =  target.getAttribute("type") === 'midi-note'? target.value:""
                // self.midiConf.notelength =  target.getAttribute("type") === 'midi-notelen'? target.value:""
                // self.midiConf.velocity =  target.getAttribute("type") === 'midi-velo'? target.value:""
                // self.midiConf.channel =  target.getAttribute("id") === 'midi-chan'? target.value:""
              // }
            // })

            // const terminalElem = target.querySelector("terminal");

            // if(terminalElem){
            //   const inputElem = terminalElem.getElementsByTagName("div");
            //   for (let i=0, max=inputElem.length; i < max; i++) {
            //     inputElem[i].addEventListener("focus", function(e){
            //       self.isDisplayFormFocused = true
            //       self.displayInputTarget = inputElem[i]
            //       console.log("focus")
            //     }) 

            //     inputElem[i].addEventListener("blur", function(e){
            //       this.isDisplayFormFocused = false
            //       console.log("this blur")
            //     })  
            //   }
            // }

            // target.addEventListener("focus", function(){
              // console.log("target focus")
              // self.isDisplayFormFocused = true
              // self.displayInputTarget = target
              // self.setFocusStyle(target)
            // })
            // target.addEventListener("blur", function(){
              // console.log("target blur")
              // self.isDisplayFormFocused = false
              // self.removeFocusStyle(target) 
            // })
          // }
        // }
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
    let active = canvas.highlighter.highlighters[canvas.highlighter.active]
    let pairedNoteAndOct
    
    switch (this.currentCmd) {
      case 'active-highlighter':
        this.displayType = "preview"
        this.el_general.innerHTML = `<div class="displayer-bold">${active.n}</div>` 
        break;
      case 'helper':
        this.displayType = "preview"
        this.el_general.innerText = `cmd (⌘) or ctrl + h = helps.` 
        break;
      case 'osc':
        this.isDisplayInputToggled = !this.isDisplayInputToggled
        this.displayType = this.isDisplayInputToggled? "form":"default"
        this.el_with_input.innerHTML = `
          <div id="info-osc" class="info-input">
            <div class="displayer-form-short-wrapper">
              <p>PATH:</p>
              <terminal>
                <div id="osc-path" data-ctrl="displayer-osc-path" type="osc-path" tabindex="-1" contenteditable="false">${active.msg.OSC.path}</div>
                <caret id="caret-osc-path" for="osc-path" class="caret btn-hide">&nbsp;</caret>
              </terminal>
            </div>
            <lf>
              <p>MSG:</p>
              <terminal>
                <div id="osc-msg" data-ctrl="displayer-osc-msg" type="osc-msg" tabindex="-1" contenteditable="false">${active.msg.OSC.msg}</div>
                <caret id="caret-osc-msg" for="osc-msg" class="caret btn-hide">&nbsp;</caret>
              </terminal>
            </lf>
          </div>
        `
        this.oscMsgPathElem = qs("div[data-ctrl='displayer-osc-path']")
        let oscMsgInput = qs("caret#caret-osc-path")
        this.toggleInsert(this.oscMsgPathElem, oscMsgInput)
        break;
      case 'midi':
        this.isDisplayInputToggled = !this.isDisplayInputToggled
        this.displayType = this.isDisplayInputToggled? "form":"default"
        pairedNoteAndOct = this.getPairedNoteAndOct(active)
        this.el_with_input.innerHTML = `
          <div id="info-osc" class="info-input">
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
          </div>
        `
        break;
      case 'regex':
        this.displayType = "preview"  
        let regexToDisplay = app.console.regexInput.replace(/[)(]/g, "\\$&");
        this.el_general.innerHTML = `<div class="displayer-bold">${new RegExp(regexToDisplay,"gi")}</div>`
        break;
      case 'console':
        this.displayType = "preview"  
        this.el_general.innerHTML = `<div class="displayer-bold">${app.console.fetchSearchInput}</div>`
        break;
      case 'rename-highlighter':
        this.isDisplayInputToggled = !this.isDisplayInputToggled
        this.displayType = this.isDisplayInputToggled? "form":"default"
        this.el_with_input.innerHTML = `
        <div id="dp-cs-rename" class="info-input">
          <lf>
            <p>name:</p>
            <input class="displayer-form" type="rename" value="${active.n}">
          </lf>
        </div>`
        break;
      case 'default':
        this.displayType = "default"
        // target = this.el_general
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
  }

  this.runCmd = function(){
    let target = this.displayInputTarget
    switch (this.currentCmd) {
      case 'osc':
        canvas.highlighter.setOSCmsg();
        break;
      case 'rename-highlighter':
        canvas.highlighter.setCursorName();
        break;
      case 'midi':
        canvas.highlighter.setMIDImsg();
        break;
    }
    target.classList.add("trigger-input")
    setTimeout(() => {target.classList.remove("trigger-input")  }, 200);
  }

  this.handleTab = function(){
    this.oscMsgPathElem  = qs(`div[data-ctrl='${this.inputRef[this.currentCmd][this.tabInputIndex]}']`)
    let oscMsgInput = qs(`caret#${this.caretRef[this.currentCmd][this.tabInputIndex]}`)
    this.toggleInsert(this.oscMsgPathElem, oscMsgInput)
    this.inputRef[this.currentCmd].forEach(( ref, idx ) => {
      if(idx !== this.tabInputIndex){
        const previousInput  = qs(`div[data-ctrl='${ref}']`)
        const previousOscMsgInput = qs(`caret#${this.caretRef[this.currentCmd][idx]}`)
        this.toggleInsert(previousInput, previousOscMsgInput)
      }
    })
  }

  this.buildInputDisplay = function () {
    this.el_with_input.classList.add("displayer-osc")
    this.el_with_input.innerHTML += this.input_text_default
    this.el_elem.appendChild(this.el_with_input)
  }

  this.buildGeneralDisplay = function () {
    this.el_general.classList.add("displayer-active-highlighter")
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
        caret.classList.remove("btn-hide")
        el.setAttribute("contenteditable", "true")
        this.focusAndMoveCursorToTheEnd(el);
        el.focus()
      } else {
        el.classList.add("disable-input")
        caret.classList.add("btn-hide")
        el.setAttribute("contenteditable", "false")
        el.blur() 
      }
    } else {
      el.classList.add("disable-input")
      caret.classList.add("btn-hide")
      el.setAttribute("contenteditable", "false")
      el.blur()
    }
  }
}