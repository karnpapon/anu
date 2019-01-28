function Sequencer(){

  this.row = 32
  this.step = 16*3
  this.current = new Mark( document.querySelector("div.content") )
  this.currentIndex = 0

  console.log("this.current", this.current)

  // this.build = function(){
  //   let grid = document.getElementById("gridseq")
  //   grid.innerHTML = ""

  //   for( let i = 0; i < this.row; i++){
  //     let tr_el = document.createElement("tr")
  //     for( let y = 0; y <  this.step; y++){
  //       let td_el = document.createElement("td")
  //       td_el.textContent = "-"
  //       tr_el.appendChild(td_el)
  //     }
  //     grid.appendChild(tr_el)
  //   }
  // }


  this.play = function(){
    // get first letter of contents.

    var target = initDocument.text.innerHTML.charAt( seeq.seq.currentIndex)
    seeq.seq.current.mark(target,{
      "filter": function(node, term, totalCounter, counter){
        if(term === target && counter >= 1){
          // return false;
          console.log("term", term)
        } else {
          console.log("target", target)
          // return true;
        }
      },
      "element": "span",
      "className": "current-active",
    })
    // seeq.seq.run()
    seeq.seq.currentIndex += 1
  }

  this.update = function(){
    var current, nextEl, prevEl
  }


  this.stop = function(){
    clearTimeout(seeq.seq.run)
  }



  this.run = function(){
    // for(var i = 0; i < initDocument.dataText.length; i++ ){
      setTimeout( function(){
        seeq.seq.currentIndex += 1
        seeq.seq.play()
      }, 400)
    // }
  }

  
}

