function Data( ){
    this.el = document.createElement("div")
    this.text = document.createElement("p")

    this.build = function(){
      this.el.classList.add("content")
      this.el.appendChild(this.text)
      // document.body.appendChild(this.el) 
      seeq.el.insertBefore(this.el,seeq.parentTarget.nextSibling)
    }

    this.update = function(txt){
      this.dataText = txt
      if(this.dataText && this.dataText.length){
        if( this.dataText.length > 1700 ){
          var trimmedText = this.dataText.substring(0, 1700)
          trimmedText += `...`
          this.text.innerHTML += trimmedText
        } else {
          this.text.innerHTML += this.dataText 
        }
      }
      this.el.appendChild(this.text)
      seeq.el.insertBefore(this.el,seeq.parentTarget.nextSibling)
    }

    this.clear = function(){
      this.text.innerHTML = ""
      this.el.appendChild(this.text)
      seeq.el.insertBefore(this.el,seeq.parentTarget.nextSibling)
    }
}