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
  this.content = initDocument.text.innerHTML;
  this.map = {};
  this.allMatchedIndexes = [];
  this.currentParagraphIndex = 0;
  this.previousParagraphLength = 0;
  this.lastParagraphNumber = 0;
  this.isPlayed = false;

  console.log("this.current", this.current)

  this.hiligthText = function(){

  }




  this.play = function(){
    // get first letter of contents.

    target = initDocument.text.innerHTML.charAt( seeq.seq.currentIndex)
    seeq.seq.current.unmark({
      done: function(){
        seeq.seq.current.mark(target,{
          filter: function(node, term, totalCounter, counter){
            if(term === target && counter >= 1){
              console.log("counter =", counter)
              console.log("term =", term)
              console.log("target =", target)
              return true;
            } else {
              console.log("target =", target)
              return true;
            }
          },
          done: function(){
            seeq.seq.currentIndex += 1
          },
          element: "span",
          className: "current-active",
        })
      }
    })
    // seeq.seq.run()
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

