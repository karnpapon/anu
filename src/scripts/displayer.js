'use strict'

function Displayer(app) {

  const { el, qs } = require('./lib/utils')

  // create.
  this.el = el("div")
  this.el_elem = el("div")
  this.main_text = el("div")
  this.default_text = "seeq | livecoding environtment"

  
  // state.
  this.displayerInput = ""
  this.isOscShowed = false
  this.isDefaultShowed = true
  this.isActivedCursorShowed = false
  this.currentCmd = ""
  
  this.oscConf
  this.isOscFocused = false

  // -------------------------------------------------------
  
  this.el_osc = el("div")
  this.el_active_cursor = el("div")
  this.output = `
    <lf class="info-header">OSC |</lf>
    <form id="info-osc" class="info-input">
      <lf>
        <p>MSG:</p>
        <input id="addosc" class="input-osc" type="osc" value="">
      </lf>
    </form>
  `

  document.addEventListener("DOMContentLoaded", function () {
    const self = app.displayer
    self.oscConf = qs("input[type='osc']")
    self.oscConf.addEventListener("input", function () { self.displayerInput = this.value;})
    self.oscConf.addEventListener("focus", function () { self.isOscFocused = true })
    self.oscConf.addEventListener("blur", function () { self.isOscFocused = false })
  })


  this.build = function(){
    this.buildWrapper()
    this.buildOSC()
    this.buildActiveCursor()
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
        this.isDefaultShowed = false
        this.isOscShowed = false
        this.isActivedCursorShowed = true
        target = this.el_active_cursor
        this.el_active_cursor.innerHTML = `ACTIVE_CURSOR : <div class="displayer-bold">${active.n}</div>` 
        break;
      case 'osc':
        this.isDefaultShowed = false
        this.isOscShowed = !this.isOscShowed
        this.isActivedCursorShowed = false
        target = this.el_osc
        this.oscConf.value = active.msg.OSC.msg
        break;
      default:
        this.isDefaultShowed = true
        this.isActivedCursorShowed = false
        this.isOscShowed = false
        target = this.el_active_cursor
        break;
    }
    
    if( this.isActivedCursorShowed || this.isOscShowed ){
      target.classList.add("displayer-show")
      this.main_text.classList.remove("displayer-show")
    } else {
      target.classList.remove("displayer-show")
      this.main_text.classList.add("displayer-show")
    }
    
  }

  this.runCmd = function(id){
    let target = qs(id)
    target.classList.add("trigger")
    setTimeout(() => {target.classList.remove("trigger") }, 200);
  }

  this.buildOSC = function () {
    this.el_osc.classList.add("displayer-osc")
    this.el_osc.innerHTML += this.output
    this.el_elem.appendChild(this.el_osc)
  }

  this.buildActiveCursor = function () {
    this.el_active_cursor.classList.add("displayer-active-cursor")
    this.el_elem.appendChild(this.el_active_cursor)
  }

  this.displayOSC = function(){
    this.currentCmd = "osc"
  }

  this.displayActivedCursor = function(){
    this.currentCmd = "active-cursor" 
  }

  this.displayDefault = function(cmd){
    this.currentCmd = ""
  }


}

module.exports = Displayer