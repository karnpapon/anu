function Sequencer(){

  this.row = 32
  this.step = 16*3
  this.current = new Mark( document.querySelector("div.content") )
  this.currentIndex = 0
  this.target

  this.size = 0;
  this.position = 0;
  // this.content = this.data.text.innerHTML;
  this.map = {};
  this.allMatchedIndexes = [];
  this.currentParagraphIndex = 0;
  this.previousParagraphLength = 0;
  this.lastParagraphNumber = 0;
  this.isPlayed = false;
  this.paragraphCursorPosition = 0
  this.textBuffers = ""
  this.output = ""
  this.isCursorActived = false

  this.set = function(){
    this.textBuffers = seeq.fetchDataSection.text.innerHTML; 
		this.output =  "<p>" + this.textBuffers.substr(0, this.paragraphCursorPosition) +
		"<span class=\"current-active\">" +
		this.textBuffers.substr(this.paragraphCursorPosition, 1) +
		"</span>" +
    this.textBuffers.substr(this.paragraphCursorPosition+1) + "</p>" ;

    seeq.fetchDataSection.updateWithCursor(this.output)
    this.isCursorActived = true
    seeq.currentNumber.innerHTML = this.paragraphCursorPosition
    seeq.totalNumber.innerHTML = seeq.fetchDataSection.el.innerText.length
  }


  this.play = function(){
    console.log("cursor", seeq.seq.paragraphCursorPosition)
    console.log("this textBuffers", this.textBuffers)
    // seeq.updateMark(target, seeq.updateMarkType)
  }

  this.increment = function(){
    // seeq.seq.run()
    seeq.updateMarkType = "normal"
    // seeq.fetchDataSection.update() 
    this.paragraphCursorPosition  += 1
    seeq.fetchDataSection.updateWithCursor(seeq.seq.output) 
    seeq.updateMark(seeq.searchValue, seeq.updateMarkType)
  }




  // this.play = function(){
  //   // get first letter of contents.

  //   target = this.data.text.innerHTML.charAt( seeq.seq.currentIndex)
  //   seeq.seq.current.unmark({
  //     done: function(){
  //       seeq.seq.current.mark(target,{
  //         filter: function(node, term, totalCounter, counter){
  //           if(term === target && counter >= 1){
  //             console.log("counter =", counter)
  //             console.log("term =", term)
  //             console.log("target =", target)
  //             return true;
  //           } else {
  //             console.log("target =", target)
  //             return true;
  //           }
  //         },
  //         done: function(){
  //           seeq.seq.currentIndex += 1
  //         },
  //         element: "span",
  //         className: "current-active",
  //       })
  //     }
  //   })
  //   // seeq.seq.run()
  // }

  this.update = function(){
    var current, nextEl, prevEl
  }


  this.stop = function(){
    clearTimeout(seeq.seq.run)
  }



  this.run = function(){
      setTimeout( function(){
        var self = seeq.seq
        self.paragraphCursorPosition  += 1
        self.set()
        self.increment()
      }, 100)
  }

  
}

