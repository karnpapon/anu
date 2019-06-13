'use strict'


function Data( ){

    // const lineWrapDetector = require('../libs/lineWrapDetector')
    this.el = document.createElement("div")
    this.text = document.createElement("p")
    this.loading = document.createElement("div")
    this.flag = 0

    // this layer only for displaying mark.
    this.maskText = document.createElement("p") 
    
    // this layer only for text's selection ( hihger z-index child's issue workaround).
    this.selectedText = document.createElement("p")

    this.textBuffers = ""
    this.getHighlight

    // multiple highlighter.
    this.hltr = new TextHighlighter(this.selectedText,{
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
      this.maskText.classList.add("masking")
      this.text.classList.add("no-masking")
      // this.loading.classList.add("loading")
      this.selectedText.classList.add("for-select-text")
      this.el.appendChild(this.loading)
      this.el.appendChild(this.text)
      this.el.appendChild(this.maskText)
      this.el.appendChild(this.selectedText)
      seeq.el.insertBefore(this.el,seeq.parentTarget.nextSibling)
    }

    this.refresh = function(){
      this.el.appendChild(this.text) 
      this.el.appendChild(this.maskText) 
      this.el.appendChild(this.selectedText) 
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

      this.maskText.innerText = this.textBuffers
      this.text.innerText = this.textBuffers
      this.selectedText.innerText = this.textBuffers 

      // paragraph row detector.
      // seeq.lines = lineWrapDetector.getLines(this.text);
      // console.log("this.lines", seeq.lines)

      this.textCounter()
    }

    this.textCounter = function(){
      var text = ""
      this.selectedText.addEventListener("mousedown", function () {
        this.flag = 1
        seeq.isConfigToggle = false
      });

      this.selectedText.addEventListener("mousemove", function () {
        if (this.flag == 1) {
          seeq.textBuffers = window.getSelection()
          seeq.selectedIndexRef = seeq.textBuffers.anchorOffset
          seeq.textSelect = seeq.textBuffers.toString();
          seeq.info.style.opacity = 0
          seeq.keyboard.infoShow()
          seeq.keyboard.keyDisplayElCmd.innerText = `STEP-LENGTH : ${seeq.textSelect.length}`
          }
      });

      this.selectedText.addEventListener("mouseup", function () {
        this.flag = 0
        seeq.keyboard.infoHide()
        seeq.info.style.opacity = 1
        // seeq.info.innerHTML = seeq.infoDetails()
      }); 
    }

    this.clear = function(){
      this.text.innerHTML = ""
      this.maskText.innerHTML = ""
      this.selectedText.innerHTML = ""
    }


    this.selectedText.addEventListener( 'dblclick', function(event) {  
      event.preventDefault();  
      event.stopPropagation(); 
    },  true //capturing phase!!
    );
}

module.exports = Data