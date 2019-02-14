'use strict'

function Data( ){
    this.el = document.createElement("div")
    this.text = document.createElement("p")
    this.loading = document.createElement("div")

    // this layer for multi-cursor.
    this.text2 = document.createElement("p")

    // this layer only for displaying mark.
    this.maskText = document.createElement("p") 
    
    // this layer only for text's selection ( hihger z-index child's issue workaround).
    this.selectedText = document.createElement("p") 

    this.textBuffers = ""

    // multiple highlighter.
    this.hltr = new TextHighlighter(this.selectedText,{
      highlightedClass: 'hltr',
      onAfterHighlight: function(){
        seeq.textSelect = seeq.getSelectionText()
        seeq.getSelectionTextPosition()
        seeq.seq.selectedTextArea()
      }
    });

    this.build = function(){
      this.el.classList.add("content")
      this.maskText.classList.add("masking")
      this.text.classList.add("no-masking")
      // this.text2.classList.add("no-masking2")
      this.loading.classList.add("loading")
      this.selectedText.classList.add("for-select-text")
      this.el.appendChild(this.loading)
      this.el.appendChild(this.text)
      // this.el.appendChild(this.text2)
      this.el.appendChild(this.maskText)
      this.el.appendChild(this.selectedText)
      seeq.el.insertBefore(this.el,seeq.parentTarget.nextSibling)
    }

    this.refresh = function(){
      this.el.appendChild(this.text) 
      // this.el.appendChild(this.text2) 
      this.el.appendChild(this.maskText) 
      this.el.appendChild(this.selectedText) 
    }

    this.updateWithCursor = function(data){
      this.text.innerHTML = data
    }

    // var targetHighlight = document.getElementsByClassName("hltr")
    // targetHighlight.addEventListener("click", function(){
    //   targetHighlight.removeHighlights()
    // })

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
      // this.text2.innerText = this.textBuffers
      this.selectedText.innerText = this.textBuffers 

      // this.textDragSelect()
      // paragraph row detector.
      // seeq.lines = lineWrapDetector.getLines(this.text);
    }

    // this.textDragSelect = function(){
    //   this.selectedText.addEventListener("mouseup", function(){
    //     seeq.textSelect = seeq.getSelectionText()
    //     seeq.getSelectionTextPosition()
    //     seeq.seq.selectedTextArea()
    //   })
    // }

    this.clear = function(){
      this.text.innerHTML = ""
      // this.text2.innerHTML = ""
      this.maskText.innerHTML = ""
      this.selectedText.innerHTML = ""
    }
}

module.exports = Data