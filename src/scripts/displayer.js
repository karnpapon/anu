'use strict'

function Displayer(app) {

  const { el, qs } = require('./lib/utils')

  this.el = el("div")
  this.el_elem = el("div")
  this.main_text = el("div")
 

  this.build = function(){
    this.el_elem.classList.add("limit")
    this.main_text.classList.add("textfx")
    this.main_text.innerText = "seeq | livecoding environtment"
    this.el.setAttribute("id", "info-bar")
    this.el.setAttribute("data-ctrl", "information")
    this.el_elem.appendChild(this.main_text)
    this.el.appendChild(this.el_elem)
    app.el.appendChild(this.el)
  }
}

module.exports = Displayer