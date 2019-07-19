'use strict'

function Displayer(app) {

  const { el, qs } = require('./lib/utils')

  // create.
  this.el = el("div")
  this.el_elem = el("div")
  this.main_text = el("div")
  this.default_text = "cmd (⌘) or ctrl + i = toggle insert mode."

  
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
  
  this.oscConf
  this.renameInput = ""
  this.isOscFocused = false


  // Observered Selection.
  this.observeConfig = { childList: true, subtree: true };

  // -------------------------------------------------------
  
  this.el_with_input = el("div")
  this.el_general = el("div")
  this.output = `
    <lf class="info-header">OSC |</lf>
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
      let target = mutationsList[0].target.lastElementChild[0]
      if(self.displayType === 'form'){
        target.addEventListener("input", function(){
          self.displayInputTarget = target
          if(self.currentCmd === 'osc'){
            self.oscConf = target.value
          } else if( self.currentCmd === 'rename-cursor'){
            self.renameInput = target.value 
          }
        })
  
        target.addEventListener("focus", function(){
          self.isDisplayFormFocused = true
        })
  
        target.addEventListener("blur", function(){
          self.isDisplayFormFocused = false
        })
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
    let target
    

    switch (this.currentCmd) {
      case 'active-cursor':
        this.displayType = "preview"
        target = this.el_general
        target.innerHTML = `ACTIVE_CURSOR : <div class="displayer-bold">${active.n}</div>` 
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
          <lf class="info-header">OSC |</lf>
          <form id="info-osc" class="info-input">
            <lf>
              <p>MSG:</p>
              <input id="addosc" class="displayer-form" type="osc" value="${active.msg.OSC.msg}">
            </lf>
          </form>
        `
        break;
      case 'regex':
        this.displayType = "preview"  
        target = this.el_general
        let regexToDisplay = app.console.regexInput.replace(/[)(]/g, "\\$&");
        target.innerHTML = `<div class="displayer-bold">${new RegExp("(" + regexToDisplay + ")","gi")}</div>`
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
        <lf class="info-header">CURSOR |</lf>
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
    }
    target.classList.add("trigger")
    setTimeout(() => {target.classList.remove("trigger") }, 200);
  }

  this.buildInputDisplay = function () {
    this.el_with_input.classList.add("displayer-osc")
    this.el_with_input.innerHTML += this.output
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


}

module.exports = Displayer