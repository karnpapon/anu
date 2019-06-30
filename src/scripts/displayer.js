'use strict'

function Displayer(app) {

  const { el, qs } = require('./lib/utils')

  this.el = el("div")
  this.el_elem = el("div")
  this.main_text = el("div")
  this.default_text = "seeq | livecoding environtment"
  
  this.el_output = el("div")
  this.output = `
    <lf class="info-header">OSC |</lf>
    <form id="info-osc" class="info-input">
      <lf>
        <p>MSG:</p>
        <input id="addosc" class="input-osc" type="text" value="s [dr] n [22,11,4,5,6,12]">
      </lf>
    </form>
  `
 

  this.build = function(){
    this.buildWrapper()
    this.buildOutput()
    app.el.appendChild(this.el)
  }

  this.buildWrapper = function(){
    this.el_elem.classList.add("limit")
    this.main_text.classList.add("textfx")
    this.main_text.innerText = this.default_text
    this.el.setAttribute("id", "info-bar")
    this.el.setAttribute("data-ctrl", "information")
    this.el_elem.appendChild(this.main_text)
    this.el.appendChild(this.el_elem)
  }

  this.buildOutput = function () {
    this.el_output.classList.add("info")
    this.el_output.innerHTML += this.output
    this.el_elem.appendChild(this.el_output)
  }

  this.display = function(){
    this.main_text.innerText = "fkjfldjfksjflsjdflsdjflsdjflsdjflkdjf" 
  }

}

module.exports = Displayer