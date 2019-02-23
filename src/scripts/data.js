'use strict'

function Data( ){
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
        seeq.textSelect = seeq.getSelectionText()
        seeq.getSelectionTextPosition()
        
        // start adding new cursor.
        if (seeq.selectAreaLength.length > 1 ){
          seeq.addCursorWhenSelectRange()
        }
        seeq.seq.selectedTextArea()
        seeq.getHighlightAfterSelect()
      }
    });

    this.build = function(){
      this.el.classList.add("content")
      this.maskText.classList.add("masking")
      this.text.classList.add("no-masking")
      this.loading.classList.add("loading")
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

    // this.updateWithCursor = function( data ){
    //   this.text.innerHTML = data
    // }

    this.update = function(txt){
      this.dataText = txt
      var limitedChar = 1500
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
      var element = this.selectedText;
      var text = ""
      var self = this
      this.selectedText.addEventListener("mousedown", function () {
        this.flag = 1
      });

      this.selectedText.addEventListener("mousemove", function () {
        if (this.flag == 1) {
          text = window.getSelection().toString();
          seeq.info.innerHTML = `<div class="info-group">| <lf>LENGTH ${text.length }</lf> | - | <lf>CHAN 0</lf> | - | <lf>NOTE D</lf> | </div> <div class="dashed-line-info"> ---------------------------------------- </div> <lft>: INFO </lft>`
          }
      });

      this.selectedText.addEventListener("mouseup", function () {
        this.flag = 0
        seeq.info.innerHTML = "|---------------------------------------------------------------------------------------------------|"
      }); 
    }

    this.clear = function(){
      this.text.innerHTML = ""
      this.maskText.innerHTML = ""
      this.selectedText.innerHTML = ""
    }
}

module.exports = Data