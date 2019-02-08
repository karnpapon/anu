function Sequencer(){

  this.currentIndex = 0
  this.target

  this.paragraphCursorPosition = 0
  this.textBuffers = ""
  this.output = ""
  this.isCursorActived = false
  this.timer = ""

  this.linkInfo =  100

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
    this.setCounterDisplay()
  }

  // connect with Ableton Link.
  this.connect = function(data){
    const { beat, bpm } = data
    var TIME_SIGNATURE = 4
    var MS_PER_BEAT = 1000 * 60 / bpm
    var CONVERTED_BPM = MS_PER_BEAT / TIME_SIGNATURE
    if( beat % TIME_SIGNATURE == 0){
      this.linkInfo = CONVERTED_BPM
    }
  }

  this.setCounterDisplay = function(){
    seeq.currentNumber.innerHTML = this.paragraphCursorPosition
  }

  this.setTotalLenghtCounterDisplay = function(){
    seeq.totalNumber.innerHTML = seeq.fetchDataSection.text.innerText.length
  }

  this.selectedTextArea = function(){
    seeq.seq.paragraphCursorPosition = seeq.matchedSelectPosition
  }

  this.setSelectLoopRange = function(){
    // limited sequence within select range.
    if( seeq.isSelectDrag){
      if( seeq.seq.paragraphCursorPosition > seeq.selectAreaLength - 2){
        seeq.seq.paragraphCursorPosition = seeq.matchedSelectPosition
      }
    } 
  }

  this.increment = function(){
    var length = seeq.fetchDataSection.text.innerText.length
    this.setSelectLoopRange()

    if( this.paragraphCursorPosition > length-1){
      this.paragraphCursorPosition = 0
      seeq.seq.refresh()
      seeq.seq.set() 
    }
    this.paragraphCursorPosition  += 1
    seeq.seq.run()
    this.trigger()
  }

  this.trigger = function(){
    if( seeq.searchValue !== ""){
      if(seeq.matchedPosition.indexOf(this.paragraphCursorPosition) !== (-1) && seeq.matchedPosition){
        document.body.classList.add("trigger")
        seeq.sendOsc()
      }
      setTimeout(() => {
        document.body.classList.remove("trigger")
      }, 200);
    }
  }

  this.run = function(){
    this.timer = setTimeout( function(){
        // this.paragraphCursorPosition  += 1  //remove this when wanted to run auto.
        seeq.seq.refresh()
        seeq.seq.set()
        seeq.seq.increment() //enable this when wanted to run auto.
    }, seeq.seq.linkInfo)
  }

  this.stop = function(){
    clearTimeout(this.timer)
    this.paragraphCursorPosition = 0
    seeq.seq.refresh()
    seeq.seq.set()
  }
  
}

