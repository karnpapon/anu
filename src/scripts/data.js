function Data( ){
    this.el = document.createElement("div")
    this.text = document.createElement("p")
    this.textBuffers = ""

    this.build = function(){
      this.el.classList.add("content")
      this.el.appendChild(this.text)
      seeq.el.insertBefore(this.el,seeq.parentTarget.nextSibling)
    }

    this.refresh = function(){
      this.el.appendChild(this.text) 
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

      // seeq.refresh(this.textBuffers)
      this.text.innerText = this.textBuffers
      // console.log("this", this.text.innerText)
      // this.el.appendChild(this.text)
      // seeq.fetchDataSection.el.replaceWith(this.el)
    }

    this.clear = function(){
      this.text.innerHTML = ""
      // this.el.appendChild(this.text)
      // seeq.el.insertBefore(this.el,seeq.parentTarget.nextSibling)
    }
}