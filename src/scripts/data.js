'use strict'

function Data(app){

    const { el } = require('./utils')

    // const lineWrapDetector = require('../libs/lineWrapDetector')
    this.el = el("div")
    this.cursorText = el("p")
    this.loading = el("div")
    this.flag = 0
    this.markedText = el("p") 
    this.highlightedText = el("p")

    this.textBuffers = ""
    this.getHighlight

    // multiple highlighter.
    this.hltr = new TextHighlighter(this.highlightedText,{
      highlightedClass: 'hltr',
      onAfterHighlight: function(){
        // app.textSelect = app.getSelectionText()
        app.getSelectionTextPosition()

        if (app.selectedRangeLength.length > 1 ){
          app.addCursorWhenSelectRange()
        }
        app.getHighlightElement()
      }
    });

    this.build = function(){
      this.el.classList.add("content")
      this.markedText.classList.add("marked-text")
      this.cursorText.classList.add("cursor-text")
      this.highlightedText.classList.add("highlighted-text")
      this.el.appendChild(this.loading)
      this.el.appendChild(this.cursorText)
      this.el.appendChild(this.markedText)
      this.el.appendChild(this.highlightedText)
      app.el.insertBefore(this.el,app.parentTarget.nextSibling)
    }

    this.refresh = function(){
      this.el.appendChild(this.cursorText) 
      this.el.appendChild(this.markedText) 
      this.el.appendChild(this.highlightedText) 
    }

    this.update = function(txt){
      this.dataText = txt
      var limitedChar = 1000
      if(this.dataText && this.dataText.length){
        if( this.dataText.length > limitedChar ){
          var trimmedText = this.dataText.substring(0, limitedChar - 100 )
          trimmedText += `...`
          this.textBuffers = trimmedText
        } else {
          this.textBuffers = this.dataText 
        }
      }

      this.markedText.innerText = this.textBuffers
      this.cursorText.innerText = this.textBuffers
      this.highlightedText.innerText = this.textBuffers 

      // paragraph row detector.
      // app.lines = lineWrapDetector.getLines(this.cursorText);
      // console.log("this.lines", app.lines)

      this.textCounter()
    }

    this.textCounter = function(){
      var text = ""
      this.highlightedText.addEventListener("mousedown", function () {
        this.flag = 1
        app.isConfigToggle = false
      });

      this.highlightedText.addEventListener("mousemove", function () {
        if (this.flag == 1) {
          app.textBuffers = window.getSelection()
          app.selectedIndexRef = app.textBuffers.anchorOffset
          app.textSelect = app.textBuffers.toString();
          app.info.style.opacity = 0
          app.keys.infoShow()
          app.keys.keyDisplayElCmd.innerText = `STEP-LENGTH : ${app.textSelect.length}`
          }
      });

      this.highlightedText.addEventListener("mouseup", function () {
        this.flag = 0
        app.keys.isShowInfoPressed ? app.keys.infoShow():app.keys.infoHide()
        app.info.style.opacity = 1
      }); 
    }

    this.clear = function(){
      this.cursorText.innerHTML = ""
      this.markedText.innerHTML = ""
      this.highlightedText.innerHTML = ""
    }


   
}

module.exports = Data