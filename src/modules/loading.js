'use strict'

function Loading(){

  const el = tag => document.createElement(tag);
  this.wrapperElem = el("div")
  this.loadingElem = el("div")

  this.build = function(){
    this.wrapperElem.classList.add("content")
    this.wrapperElem.appendChild(this.loadingElem)
    client.el.insertBefore(this.wrapperElem,client.parentTarget.nextSibling)
  }
}