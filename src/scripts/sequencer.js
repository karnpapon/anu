function Sequencer(){

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

  this.refresh = function(){
    this.textBuffers = seeq.fetchDataSection.text.innerText; 
  }

  this.set = function(){
		this.output =  this.textBuffers.substr(0, this.paragraphCursorPosition) +
		"<span class=\"current-active\">" +
		this.textBuffers.substr(this.paragraphCursorPosition, 1) +
		"</span>" +
    this.textBuffers.substr(this.paragraphCursorPosition+1)  ;

    seeq.fetchDataSection.updateWithCursor(this.output)
    this.isCursorActived = true
    seeq.currentNumber.innerHTML = this.paragraphCursorPosition
    seeq.totalNumber.innerHTML = seeq.fetchDataSection.text.innerText.length
  }

  this.increment = function(){
    this.paragraphCursorPosition  += 1
    seeq.seq.run()
    this.trigger()

  }

  this.trigger = function(){
    if(seeq.matchedPosition.indexOf(this.paragraphCursorPosition) !== (-1)){
      console.log("triggered!!!")
    }
  }

  this.run = function(){
    setTimeout( function(){
        // this.paragraphCursorPosition  += 1  //remove this when wanted to run auto.
        seeq.seq.refresh()
        seeq.seq.set()
        seeq.seq.increment() //enable this when wanted to run auto.
    }, 100)
  }

  this.update = function(){
    var current, nextEl, prevEl
  }


  this.stop = function(){
    clearTimeout(seeq.seq.run)
  }




  
}

