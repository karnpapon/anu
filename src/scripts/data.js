'use strict'


function Data( ){

    // const lineWrapDetector = require('../libs/lineWrapDetector')
    this.el = document.createElement("div")
    this.cursorText = document.createElement("p")
    this.loading = document.createElement("div")
    this.flag = 0

    // this layer only for displaying mark.
    this.markedText = document.createElement("p") 
    
    // this layer only for text's selection ( hihger z-index child's issue workaround).
    this.highlightedText = document.createElement("p")

    this.textBuffers = ""
    this.getHighlight

    // multiple highlighter.
    this.hltr = new TextHighlighter(this.highlightedText,{
      highlightedClass: 'hltr',
      onAfterHighlight: function(){
        // seeq.textSelect = seeq.getSelectionText()
        seeq.getSelectionTextPosition()

        // start adding new cursor.
        if (seeq.selectedRangeLength.length > 1 ){
          seeq.addCursorWhenSelectRange()
        }
        seeq.seq.selectedRangeStartIndex()
        seeq.getHighlightElement()
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
      seeq.el.insertBefore(this.el,seeq.parentTarget.nextSibling)
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
      // seeq.lines = lineWrapDetector.getLines(this.cursorText);
      // console.log("this.lines", seeq.lines)

      this.textCounter()
    }

    this.textCounter = function(){
      var text = ""
      this.highlightedText.addEventListener("mousedown", function () {
        this.flag = 1
        seeq.isConfigToggle = false
      });

      this.highlightedText.addEventListener("mousemove", function () {
        if (this.flag == 1) {
          seeq.textBuffers = window.getSelection()
          seeq.selectedIndexRef = seeq.textBuffers.anchorOffset
          seeq.textSelect = seeq.textBuffers.toString();
          seeq.info.style.opacity = 0
          seeq.keyboard.infoShow()
          seeq.keyboard.keyDisplayElCmd.innerText = `STEP-LENGTH : ${seeq.textSelect.length}`
          }
      });

      this.highlightedText.addEventListener("mouseup", function () {
        this.flag = 0
        seeq.keyboard.isShowInfoPressed ? seeq.keyboard.infoShow():seeq.keyboard.infoHide()
        seeq.info.style.opacity = 1
        // seeq.info.innerHTML = seeq.retrieveInfoDisplay()
      }); 
    }

    this.clear = function(){
      this.cursorText.innerHTML = ""
      this.markedText.innerHTML = ""
      this.highlightedText.innerHTML = ""
    }


    this.highlightedText.addEventListener( 'dblclick', function(event) {  
      event.preventDefault();  
      event.stopPropagation(); 
    },  true //capturing phase!!
    );
}

module.exports = Data