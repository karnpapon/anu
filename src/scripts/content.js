'use strict'

function Content(app){

  const el = tag => document.createElement(tag);
  this.el = el("div")
  this.loading = el("div")

  this.build = function(){
    this.el.classList.add("content")
    this.el.appendChild(this.loading)
    app.el.insertBefore(this.el,app.parentTarget.nextSibling)
  }
}