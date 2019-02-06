function Data( ){
    this.el = document.createElement("div")
    this.text = document.createElement("p")

    // this layer only to display mark.
    this.maskText = document.createElement("p") 

    this.textBuffers = ""

    this.build = function(){
      this.el.classList.add("content")
      this.maskText.classList.add("masking")
      this.text.classList.add("no-masking")
      this.el.appendChild(this.text)
      this.el.appendChild(this.maskText)
      seeq.el.insertBefore(this.el,seeq.parentTarget.nextSibling)
    }

    this.refresh = function(){
      this.el.appendChild(this.text) 
      this.el.appendChild(this.maskText) 
    }

    this.updateWithCursor = function(data){
      this.text.innerHTML = data
    }

   

    this.update = function(txt){
      this.dataText = txt
      var limitedChar = 1500
      if(this.dataText && this.dataText.length){
        if( this.dataText.length > limitedChar ){
          var trimmedText = this.dataText.substring(0, limitedChar)
          trimmedText += `...`
          this.textBuffers = trimmedText
        } else {
          this.textBuffers = this.dataText 
        }
      }

      this.maskText.innerText = this.textBuffers
      this.text.innerText = this.textBuffers

      this.textDragSelect()

      // paragraph row detector.
      // seeq.lines = lineWrapDetector.getLines(this.text);
    }

    this.textDragSelect = function(){
      // var contextSelect = document.querySelector("p.masking")
      this.maskText.addEventListener("mouseup", function(){
        seeq.textSelect = seeq.getSelectionText()
        seeq.getSelectionTextPosition()
        seeq.seq.selectedTextArea()
      })
    }

    this.clear = function(){
      this.text.innerHTML = ""
      this.maskText.innerHTML = ""
    }
}