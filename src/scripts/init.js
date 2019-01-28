function InitDoc(  ){
    this.el = document.createElement("div")
    this.text = document.createElement("p")
    this.el.classList.add("content")
    this.el.appendChild(this.text)
    document.body.appendChild(this.el) 

    this.update = function(txt){
      initDocument.dataText = txt
      if(initDocument.dataText && initDocument.dataText.length){
        var trimmedText = initDocument.dataText.substring(0, 1700)
        trimmedText += `...`
        initDocument.text.innerHTML += trimmedText
      }
      this.el.appendChild(initDocument.text)
      document.body.appendChild(this.el)
    }

    this.clear = function(){
      initDocument.text.innerHTML = ""
      this.el.appendChild(initDocument.text)
      document.body.appendChild(this.el)
    }
}