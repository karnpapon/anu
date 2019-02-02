function Sequencer(id, overlayID){

  this.row = 32
  this.step = 16*3
  this.current = new Mark( document.querySelector("div.content") )
  this.currentIndex = 0
  this.target

  this.size = 0;
  this.position = 0;
  this.id = id;
  this.overlayID = overlayID;
  // this.content = this.data.text.innerHTML;
  this.map = {};
  this.allMatchedIndexes = [];
  this.currentParagraphIndex = 0;
  this.previousParagraphLength = 0;
  this.lastParagraphNumber = 0;
  this.isPlayed = false;
  this.paragraphCursorPosition = 0

  this.play = function(){
    // console.log("innerHTML", this.data.el.innerHTML)
    var output = ""
    var text = seeq.fetchDataSection.el.innerText;

    console.log('text sdf = ', seeq)

		output = "<p>" + text.substr(0, this.paragraphCursorPosition) +
		"<span class=\"current-active\">" +
		text.substr(this.paragraphCursorPosition, 1) +
		"</span>" +
    text.substr(this.paragraphCursorPosition+1) + "</p>";

    console.log("output", output)
    
    seeq.fetchDataSection.text.innerHTML = output
    seeq.currentNumber.innerHTML = this.paragraphCursorPosition
    seeq.totalNumber.innerHTML = seeq.fetchDataSection.el.innerText.length
  }

  this.increment = function(){
    seeq.seq.run()
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
    // for(var i = 0; i < this.data.dataText.length; i++ ){
      setTimeout( function(){
        var self = seeq.seq
        self.paragraphCursorPosition  += 1
        self.play()
        self.increment()
      }, 100)
    // }
  }

  
}

