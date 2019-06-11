function Seeq(){

  const Data = require('./data')
  const Sequencer = require('./sequencer')
  const Midi = require('./midi')
  const Clock = require('./clock')
  const IO = require('./io')
  const Keyboard = require('./keyboard')
  const Metronome = require('./metronome')
  // const MetronomeWorker = require('./metronomeworker')
  

  this.data = new Data
  this.io = new IO(this)
  this.midi = new Midi()
  this.seq = new Sequencer()
  this.keyboard = new Keyboard(this)
  this.masterClock = [new Clock(120)] 
  this.metronome = new Metronome()
  // this.metronomeWorker = new MetronomeWorker()
  this.selectedClock = 0

  this.bpmNumber
  this.metronomeBtn
  this.timerID=null;
  this.interval=100;
  this.audioContext = null
  this.isBPMtoggle = false

  this.appWrapper = document.createElement("appwrapper")
  this.el = document.createElement("app");
  this.el.style.opacity = 0;
  this.el.id = "seeq";
  this.appWrapper.appendChild(this.el)
  this.wrapper_el = document.createElement("div")
  this.wrapper_el.className = "wrapper-control"
  this.el.appendChild(this.wrapper_el)
  this.parentTarget = document.getElementsByClassName("wrapper-control")

  this.url = "https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro&explaintext&redirects=1&titles="
  this.urlEnd = "&redirects=1"

  this.content
  this.currentNumber
  this.totalNumber
  this.cpuUsage

  // operation.
  this.keyboardPress = false
  this.isMutePressed = false
  this.isUpPressed = false
  this.isDownPressed = false
  this.isMuted = false
  this.isReversedCursorPressed = false
  this.isDeletePressed = false
  this.isShowInfo = false
  this.isInfoActived = false
  this.isRetriggered = false

  this.isActive = false
  this.isConfigToggle = false
  this.isLinkToggle = false

  this.targetMute
  
  this.currentResult = []
  this.results = []
  this.currentClass = "current"
  this.offsetTop = 50
  this.currentIndex = 0
  this.fetchSearchInput = ""
  this.txt = ""
  this.isSearchModeChanged = false
  this.operator

  // text buffers
  this.extract = "" 
  this.switchText = ""
  this.fetchText = ""
  this.textAfterFoundMatched = ""
  this.notation = ""
  this.textSelect = ""
  this.matchedSelectPosition = []
  this.selectedRangeLength = []
  this.textBuffers = ""
  this.selectedIndexRef =""
  this.filteredPos = ""


  this.ranges = [];
  

  this.searchValue = ""
  this.updateMarkType = "normal"

  this.matchedSymbol = "◊"
  this.startPos

  // paragraph row detector
  this.lines = ""
  this.textLineBuffers = ""

  this.isTextSelected = false
  this.isReverse = false
  this.isGettingData = false

  this.matchedPosition = []
  this.matchedPositionWithLength = []
  this.matchedPositionLength = 1
  this.bpm = ""
  this.logoSeeq

  this.cursor = [{
    position: 0,
    isCursorOffsetReverse: false,
    isMuted: false,
    up: 0,
    down: 0,
    note: ["C"],
    length: 16,
    velocity: 100,
    octave: "3",
    counter: 0,
    channel: 0,
    reverse: false
  }]

  this.triggerCursor = {
    note: ["C"],
    length: 3,
    velocity: 100,
    octave: "4",
    channel: 0, 
    counter: 0
  }
  this.selectIndex

  document.body.appendChild(this.appWrapper);

  this.observer 
  this.observeConfig = { childList: true, subtree: true };
  this.indexTarget

  this.isPlaying = false
  this.getHighlight = []

  this.triggerTimer
  this.isFreeModeAutoPlay = false

  this.start = function(){
    this.wrapper_el.innerHTML += `
      <div class="controller-wrapper">
        <div class="header-wrapper">
          <div class="header">
            <div data-logo="seeq" class="title">seeq</div>
            <input data-fetch="fetch" placeholder="" class="input-control">
            <button data-gettext="gettext"> Enter </button>
          </div>
          <div class="header">
            <div class="title">RegExp:</div>
            <input type="search-regex" placeholder="" class="input-regex">
          </div>
        </div>
          
        <div class="header-wrapper">

          <div class="header">
            <div class="title">find:</div>
            <div class="normal-search">
              <input type="search" placeholder="" class="input-control-2">
              <div class="control-btn">
                <button data-search="next">nxt</button>
                <button data-search="prev">prv</button>
                <button data-search="cfg">cfg</button>
              </div>
            </div>
          </div>
          
          <div class="control-info">
          <div class="control-panel">
            <div class="title">Control:</div>
            <div class="control-btn">
              <button data-ctrl="link">link</button>
              <button data-ctrl="rev">rev</button>
              <button data-ctrl="clear">clear</button>
              <button data-ctrl="nudge">nudge</button>
            </div>
            </div>
            
          </div>
        </div>
        <div class="header-line"></div>
        <div class="header-wrapper flex-col header-wrapper-status">
          <div class="tempo">
            <div class="tempo-details">
              <div>
                <div class="tempo-details">
                  <b>bpm : </b>
                </div>
                <div class="tempo-details">
                  <b>ratio : </b>
                </div>
                <div class="tempo-details">
                  <b>total : </b> 
                </div>
                <div class="tempo-details">
                  <b>cpu : </b>
                </div>
              </div>
              <div class="performance-details">
                <p class="init-bpm" data-ctrl="bpm">120</p>
                <p data-ctrl="current">16th</p> 
                <p data-ctrl="total">--</p>
                <p data-ctrl="cpu">--</p>
              </div>
            </div>
            <div class="counter">
              <button data-ctrl="metronome">*</button>
              <div class="control-btn wdth-auto">
              <button data-ctrl="subtract">-</button>
              <button data-ctrl="add">+</button>
              </div>
            </div>
          </div> 
        </div>
      </div>
      <div data-ctrl="information" class="limit">|---------------------------------------------------------------------------------------------------|</div> 
    `;

    this.data.build()
    this.io.start()
    setTimeout(seeq.show,200)
  }

  this.show = function () {
    seeq.el.style.opacity = 1;
  }

  socket.on('beat', function (data) {
    const { beat, bpm } = data

    // set clock source from Ableton.
    if (beat % 4 == 0 && bpm != seeq.clock().getBpm()) {
      seeq.clock().setBpm(bpm)
    }

    if (beat % 4 == 0 && !seeq.isPlaying && seeq.isLinkToggle ) {
      seeq.play()
      seeq.metronome.play()
    }
  });

  document.addEventListener("DOMContentLoaded", function() {
    this.searchInput = document.querySelector("input[type='search']")
    this.searchRegExp = document.querySelector("input[type='search-regex']")
    this.prevBtn = document.querySelector("button[data-search='prev']")
    this.nextBtn = document.querySelector("button[data-search='next']")
    this.configBtn = document.querySelector("button[data-search='cfg']")
    this.inputFetch = document.querySelector("input[data-fetch='fetch']")
    this.getTextBtn = document.querySelector("button[data-gettext='gettext']")
    // this.setBtn = document.querySelector("button[data-ctrl='set']")
    this.linkBtn = document.querySelector("button[data-ctrl='link']")
    // this.runBtn = document.querySelector("button[data-ctrl='run']")
    this.clearBtn = document.querySelector("button[data-ctrl='clear']")
    this.nudgeBtn = document.querySelector("button[data-ctrl='nudge']")
    this.revBtn = document.querySelector("button[data-ctrl='rev']")
    this.addBtn = document.querySelector("button[data-ctrl='add']")
    this.subtractBtn = document.querySelector("button[data-ctrl='subtract']")
    // this.notationMode = document.querySelector("button[data-ctrl='notation-mode']")
    // this.extractLines = document.querySelector("button[data-ctrl='extract-line']")
    this.logo = document.querySelector("div[data-logo='seeq']")
    var context = document.querySelector("p.masking")
    seeq.bpmNumber = document.querySelector("p[data-ctrl='bpm']")
    seeq.metronomeBtn = document.querySelector("button[data-ctrl='metronome']")
    seeq.currentNumber = document.querySelector("p[data-ctrl='current']")
    seeq.totalNumber = document.querySelector("p[data-ctrl='total']")
    seeq.cpuUsage = document.querySelector("p[data-ctrl='cpu']")
    seeq.info = document.querySelector("div[data-ctrl='information']")
    seeq.content = new Mark(context)
    seeq.logoSeeq = new Mark( this.logo )

    // seeq.audioContext = new AudioContext()
    seeq.metronome.init()
    seeq.fetch()
  
    this.inputFetch.focus()
    this.inputFetch.addEventListener("input", function(){
      seeq.fetchSearchInput = this.value;
    })

    this.searchInput.addEventListener("input", function() {
        seeq.searchValue = this.value;
        seeq.content.unmark({
          done: function( ) {
            seeq.content.mark(seeq.searchValue, {
              separateWordSearch: true,
              done: function() {
                seeq.results = document.getElementsByTagName("mark");
                // seeq.currentIndex = 0;
                // seeq.jump();
                if(seeq.searchValue !== ""){
                  // clear position every searching.
                  seeq.matchedPosition = [] 
                  seeq.matchedPositionWithLength = []
                  seeq.findMatchedPosition()
                }
              }
            });
          }
        });
        seeq.updateMarkType = "normal"

        seeq.logoSeeq.unmark({
          done: function(){
            seeq.logoSeeq.mark(seeq.searchValue, {
              className: "logo-seeq"
            })
          }
        })
      });

      this.searchRegExp.addEventListener("input", function() {
        let targetRegExp
        
        let displayText = this.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        seeq.searchValue = this.value
        targetRegExp = new RegExp(seeq.searchValue, "gi")

        seeq.content.unmark({
          done: function( ) {
            seeq.content.markRegExp(targetRegExp, {
              done: function() {
                seeq.results = document.getElementsByTagName("mark");
                // seeq.currentIndex = 0;
                // seeq.jump();
                if(seeq.searchValue !== ""){
                  // clear position every searching.
                  seeq.matchedPosition = [] 
                  seeq.matchedPositionWithLength = []
                  seeq.matchType = "regex"
                  seeq.findMatchedPosition()
                  seeq.info.classList.add("limit-regex")
                  seeq.info.innerHTML = `<lf>/${displayText}/gi</lf>`
                }
              }
            });
          }
        });
        seeq.updateMarkType = "regex"
      });

      this.nextBtn.addEventListener("click", function(){
        if(seeq.results.length){
          seeq.currentIndex += 1
        }
        if (seeq.currentIndex > seeq.results.length - 1) { 
          // reset cursor to top.
          seeq.currentIndex = 0;
        }
        seeq.triggerCursor['counter'] += 1
        seeq.isFreeModeAutoPlay = true
        seeq.jump()
      })

      this.prevBtn.addEventListener("click", function(){
        if(seeq.results.length){
          seeq.currentIndex -= 1
        }
        if (seeq.currentIndex < 0) {
          // prevBtn case to get outbound top to show at to bottom.
          seeq.currentIndex = seeq.results.length - 1; 
        }
        seeq.isFreeModeAutoPlay = false
        seeq.jump();
      })

      seeq.metronomeBtn.addEventListener("click", function(){
        seeq.isBPMtoggle = !seeq.isBPMtoggle 
        seeq.metronomeBtn.classList.toggle("toggle-btn") 
      })

      this.configBtn.addEventListener("click", function(){

        let targetCursor
        targetCursor = seeq.triggerCursor
        seeq.isConfigToggle = !seeq.isConfigToggle
        this.classList.toggle("toggle-btn")

        if(seeq.isConfigToggle){
          targetCursor = seeq.setMidiConfig(targetCursor)
        } else {
          seeq.resetInfoBar()
        }
      })

      this.getTextBtn.addEventListener("click",function(){ 
        seeq.data.clear()
        seeq.fetch()
      })

      // this.setBtn.addEventListener("click", function(){
      //   seeq.setCursor()
      //   seeq.seq.setCounterDisplay()
      // })

      this.linkBtn.addEventListener("click", function(){
        seeq.isLinkToggle = !seeq.isLinkToggle
        this.classList.toggle("toggle-btn")

        if (seeq.isLinkToggle) {
          socket.connect(0)
        } else {
          socket.disconnect(0);
        }
      })

      // this.runBtn.addEventListener("click", function(){
      //   // seeq.metronome.play()
      //   seeq.play()
      // })


      this.clearBtn.addEventListener("click", function(){
       seeq.clear()
      })

      this.nudgeBtn.addEventListener("click", function(){
       seeq.nudge()
      })

      this.revBtn.addEventListener("click", function () {
        seeq.isReverse = !seeq.isReverse

        if(seeq.isReverse){
          // refresh position avoiding messed up trigger.
          seeq.findMatchedPosition()
        } else {
          seeq.play()
        }
      })

      this.addBtn.addEventListener("click", function(){
        // seeq.seq.beatRatio += 1
        seeq.modSpeed(1); 
        seeq.seq.setCounterDisplay()
      })
      this.subtractBtn.addEventListener("click", function(){
        // seeq.seq.beatRatio -= 1
        seeq.modSpeed(-1); 
        seeq.seq.setCounterDisplay()
      })

      // this.notationMode.addEventListener("click", function(){
      //   // separated search mode from toggle mode 
      //   // to avoid messing up when cursor is actived.
      //   seeq.toggleIsSearchModeChanged() 
      //   seeq.textConvertor()
      // })

      // observing when Highlight elements inserted into DOM.
      // handle add/remove/mute/unmute highlight.
      this.observeCallback = function(mutationsList, observer) {
        for(var mutation of mutationsList) {
          if (mutation.type == 'childList' && mutation.target.nodeName == 'SPAN' ) {

            mutation.target.addEventListener("mousedown", function(){
              let indexTarget, targetHighlight, targetCursor

              seeq.getHighlight.forEach( ( el, index, arr ) => {
                if( el.dataset.timestamp == mutation.target.dataset.timestamp){
                  seeq.selectIndex = index
                }
              })

              targetHighlight = seeq.getHighlight[seeq.selectIndex]
              targetCursor = seeq.cursor[seeq.selectIndex]

              if(seeq.isRetriggered){
                targetHighlight.classList.add("re-trigger")
                targetCursor.position = 40
              }

            })

            mutation.target.addEventListener("mouseup", function(){
              let indexTarget, targetHighlight, targetCursor

              seeq.getHighlight.forEach( ( el, index, arr ) => {
                if( el.dataset.timestamp == mutation.target.dataset.timestamp){
                  seeq.selectIndex = index
                }
              })

              targetHighlight = seeq.getHighlight[seeq.selectIndex]
              targetCursor = seeq.cursor[seeq.selectIndex]

              if(seeq.isRetriggered){
                targetHighlight.classList.remove("re-trigger")
              }

            })


            mutation.target.addEventListener("click", function(e){
              seeq.isActive = !seeq.isActive
              let indexTarget, targetHighlight, targetCursor

              seeq.getHighlight.forEach( ( el, index, arr ) => {
                if( el.dataset.timestamp == mutation.target.dataset.timestamp){
                  seeq.selectIndex = index
                }
              })

              targetHighlight = seeq.getHighlight[seeq.selectIndex]
              targetCursor = seeq.cursor[seeq.selectIndex]

              // when keyboard is pressed,then operates.
              if (seeq.keyboardPress ){
                if(seeq.isMutePressed){
                  if (seeq.isActive){
                    targetHighlight.classList.add("mute-target")
                    targetCursor.isMuted = true
                  } else {
                    targetHighlight.classList.remove("mute-target")
                    targetCursor.isMuted = false
                  }
                } 
                
                if (seeq.isReversedCursorPressed){
                  if (seeq.isActive){
                    targetHighlight.classList.add("reverse-target")
                    targetCursor.reverse = true
                    targetCursor.isCursorOffsetReverse = true
                    targetCursor.counter = 0
                  } else {
                    targetHighlight.classList.remove("reverse-target")
                    targetCursor.reverse = false 
                    targetCursor.isCursorOffsetReverse = false
                  }
                }

                if (seeq.isShowInfo){
                  if (seeq.isActive){
                    seeq.isInfoActived = true
                    targetHighlight.classList.add("select-highlight")
                    targetCursor = seeq.setMidiConfig(targetCursor)
                  } else {
                    targetHighlight.classList.remove("select-highlight")
                    seeq.resetInfoBar()
                    seeq.isInfoActived = false;
                    seeq.isShowInfo = false;
                  }
                }

                if (seeq.isDeletePressed){
                  seeq.removeHighlightsEl(seeq.selectIndex)
                  seeq.data.hltr.removeHighlights(mutation.target);
                  seeq.sortingIndex()
                  seeq.getHighlightElement() //sorting highlight element.
                }
              }
              else {
                
              
              }
            })
          }
        }
      };
      
      this.observer = new MutationObserver(this.observeCallback); 
      this.observer.observe(seeq.data.selectedText, seeq.observeConfig);

      // this.extractLines.addEventListener("click", function(){
      //   seeq.extractLinesParagraph()
      // })

  });


  this.findHighlightIndex = function(target){
    var indexTarget
    seeq.getHighlight.forEach( ( el, index ) => {
      if( el.dataset.timestamp == target.timestamp){
        indexTarget = index
        return indexTarget
      }
    })
  }

  this.reset = function(){
    let reset = [{
      position: 0,
      isCursorOffsetReverse: false,
      isMuted: false,
      up: 0,
      down: 0,
      note: ["C"],
      length: 16,
      velocity: 100,
      octave: "3",
      counter: 0,
      channel: 0,
      reverse: false
    }]
    return reset 
  }

  this.resetInfoBar = function(){
    seeq.info.classList.remove("limit-regex")
    seeq.info.innerHTML = "|---------------------------------------------------------------------------------------------------|"
  }


  this.clear = function(){
    this.isPlaying = false
    this.seq.stop()
    this.data.hltr.removeHighlights();
    clearInterval(this.triggerTimer)
    this.content.unmark()
    this.fetch()
  }

  this.nudge = function(){
    this.isPlaying = false
    this.seq.nudged()
  }

  this.fetch = function(){
    seeq.startFetch()

    // disconnect at initial state (`linkBtn` is not actived).
    // to handle clock freely, 
    // otherwise it'll manage to adjust clock to Ableton clock.
    // ( clock will keeping reset to the default, 120 BPM).
    socket.disconnect(0)
    // seeq.setCursor()
    seeq.play()
    seeq.metronome.play()
  }

  this.removeHighlightsEl = function(index){
    this.matchedSelectPosition.splice(index, 1)
    this.selectedRangeLength.splice(index, 1)
    this.cursor.splice(index, 1)
  }

  this.getSelectionText = function() {
    var text = "";
    var textCount = 0

    if (window.getSelection) {
      text = window.getSelection().toString()
    } else if (document.selection && document.selection.type != "Control") {
      text = document.selection.createRange().text;
    }
    return text;
  }

  this.getSelectionTextPosition = function(){
    var searchText = seeq.data.text.innerText
    var search = ""
    var match
    var length
    let indexBuffers = []
    let matchedIndex 
    let matched
    
    if(this.textSelect !== ""){
      length = this.textSelect.length
      search = new RegExp(this.textSelect, "gi")
      while (match = search.exec(searchText)) {
        this.startPos = match.index
        indexBuffers.push(this.startPos) 
      }
      matchedIndex = indexBuffers.filter( idx => idx == seeq.textBuffers.anchorOffset)
      this.filteredPos = matchedIndex.length > 0 ? matchedIndex[0] : indexBuffers[0]

      this.matchedSelectPosition.push(this.filteredPos)
      this.isTextSelected = true
    } else {
      this.isTextSelected = false
    }
    // console.log("textlen", length)
    // console.log("this.startPos", this.startPos)
    this.selectedRangeLength.push(this.filteredPos + length)
  }

  this.toggleIsSearchModeChanged = function(){
    this.isSearchModeChanged = !this.isSearchModeChanged
  }

  this.setMidiConfig = function(midiConfig){
    let addNote, addLength, addVelocity, addChannel,
    note = midiConfig.note === undefined? "":midiConfig.note,
    octave = midiConfig.octave === undefined? "":midiConfig.octave,
    length = midiConfig.length === undefined? "":midiConfig.length,
    velocity = midiConfig.velocity === undefined? "":midiConfig.velocity,
    ch = midiConfig.channel === undefined? "": midiConfig.channel

    var noteWithOct = [];
    for (var i = 0; i < note.length; i++) {
      noteWithOct.push(`${ note[i] }${ octave[i]}`)
    }

    seeq.info.classList.add("limit-regex")
    seeq.info.innerHTML = `
      <div class="operator-group info"> 
        <lf class="info-header">MIDI CONFIG |</lf> 
        <form id="info" class="info-input">
          <lf> 
            <p>NOTE:</p>
            <input id="addnote" class="input-note" type="text" value=${noteWithOct}>
          </lf>
          <lf> 
            <p>LENGTH:</p>
            <input id="addlength" class="input-note" type="text" value=${length}>
          </lf>
          <lf> 
            <p>VEL:</p>
            <input id="addvelocity" class="input-note" type="text" value=${velocity}>
          </lf>
          <lf> 
            <p>CHAN:</p>
            <input id="addchannel" class="input-note" type="text" value=${ch}>
          </lf>
        </form>
      </div> 
      <button type="submit" value="Submit" form="info" class="send-midi">send</button>
    `
    addNote = document.getElementById('addnote')
    addLength = document.getElementById('addlength')
    addVelocity = document.getElementById('addvelocity')
    addChannel = document.getElementById('addchannel')

    addNote.addEventListener("input", function(e){ note = this.value })
    addLength.addEventListener("input", function(e){ length = this.value })
    addVelocity.addEventListener("input", function(e){ velocity = this.value })
    addChannel.addEventListener("input", function(e){ ch = this.value })
    document.querySelector('form.info-input').addEventListener('submit', function (e) {
      e.preventDefault();
      let noteAndOct
      if (note.indexOf(',') > -1) { 
        noteAndOct = seeq.splitArrayNoteAndOctave(note)
      } else {
        noteAndOct = seeq.splitSingleNoteAndOctave(noteWithOct)
      }
      let noteOnly = []
      let octOnly = []

      noteAndOct.forEach(item => {
        noteOnly.push(item[0])
        octOnly.push(parseInt( item[1] ))
      })

      midiConfig.note = noteOnly
      midiConfig.octave = octOnly
      midiConfig.length = length
      midiConfig.velocity = velocity
      midiConfig.channel = parseInt( ch )
      seeq.triggerCursor['counter'] = 0
    })

    return midiConfig
  }

  this.addSequencer = function(){
    this.cursor.push({ 
      position: this.startPos,
      isCursorOffsetReverse: false,
      isMuted: false,
      up: 0,
      down: 0,
      note: ["C"],
      length: 16,
      velocity: 100,
      octave: "3",
      counter: 0,
      channel: 0,
      reverse: false
    })
    this.sortingIndex()
  }
  
  this.sortingIndex = function(){
    this.matchedSelectPosition.sort(function (a, b) { return a - b });
    this.selectedRangeLength.sort(function (a, b) { return a - b });
    this.cursor.sort(function (a, b) { return a.position - b.position });
   
  }

  this.extractLinesParagraph = function(){
    // make eachline has linebreak 
    // before converting letters into dashes.
    for(var i=0; i< this.lines.length; i++){
      for(var j=0; j<this.lines[i].length; j++){
        this.textLineBuffers += this.lines[i][j].innerText
        this.textLineBuffers += " "
      }
      this.textLineBuffers += "<br/>"
    }
    // seeq.data.updateWithCursor(this.textLineBuffers)
  }

  
  this.textConvertor = function(){
    var target = new RegExp(seeq.searchValue, "gi")
   
    // turn matched letter/words into symbols
    if( seeq.searchValue !== ""){
      this.notation = seeq.data.text.innerText.replace(target, this.matchedSymbol)
    } else {
      this.notation = seeq.data.text.innerText
    }

   
    this.switchText = this.notation.replace(/[^+(|)◊:;,\/"' \.,\-]/g, "-")
    this.fetchText = seeq.extract.extract

    if( seeq.isSearchModeChanged ){
      this.update("normal",this.switchText,this.matchedSymbol )
    } else {
      this.update("regex",this.fetchText,this.searchValue )
    }

    // if(seeq.seq.isCursorActived){
    //   this.setCursor()
    // }
  }

  this.addCursorWhenSelectRange = function(){
    this.addSequencer()
  }

  this.update = function(markType, modeContent, target ){
    seeq.updateMarkType = markType
    seeq.data.clear() 
    seeq.data.update(modeContent) 
    seeq.updateMark(target, seeq.updateMarkType)
  }

  this.jump = function(){
    if (seeq.results.length) {
      var current, nextEl, prevEl

      // handle outbound wrapped cursor.
      if(seeq.currentIndex == seeq.results.length - 1){
        nextEl = 0
        prevEl = seeq.results.length - 2
      } else if ( seeq.currentIndex == 0) {
        nextEl = seeq.currentIndex + 1  
        prevEl = seeq.results.length - 1
      } else {
        nextEl = seeq.currentIndex + 1
        prevEl = seeq.currentIndex - 1
      }
      current = seeq.results[seeq.currentIndex];
      current.classList.add(this.currentClass);


      if (seeq.results[prevEl] && seeq.results[prevEl].className == this.currentClass){
        seeq.results[prevEl].classList.remove(this.currentClass);
      } else if (seeq.results[nextEl] && seeq.results[nextEl].className == this.currentClass ){
        seeq.results[nextEl].classList.remove(this.currentClass);
      }
      // this.sendOsc() 
      // seeq.isFreeModeAutoPlay = true
      seeq.seq.triggerOnClick()
    }
  }

  this.sendOsc = function(){
    // re-render to get new value everytime.
    // var message = new OSC.Message('/ding', Math.random());  
    // osc.send(message)
  }

  this.findMatchedPosition = function(){
    // find position to trigger events.
    var searchText = seeq.data.text.innerText
    var search = new RegExp(this.searchValue,"gi")
    var match
    let length = this.searchValue.length
    let buffers = []

    this.matchedPosition = []
    this.matchedPositionWithLength = []

    if( this.searchValue !== ""){
      // if search value = letter.
      while( match = search.exec(searchText)){
        if( !this.isReverse){
          this.matchedPosition.push(match.index + 1)
        } else {
          this.matchedPosition.push(match.index - 1)
        }
      } 

      // if search value = word.
      if (this.searchValue.length > 1 && this.updateMarkType !== "regex") {
        this.matchedPositionLength = length - 1
      } else {
        this.matchedPositionLength = 1
      }
    }
    
    Array.from( new Array(length)).map((len, index) => { 
      this.matchedPosition.map( pos => 
        this.matchedPositionWithLength.push(pos + index ) 
      )
    })

    this.matchedPositionWithLength.sort(function (a, b) { return a - b });
  }

  this.startFetch = function(){
    if (seeq.fetchSearchInput !== "") {
      seeq.isGettingData = true
      seeq.getData()
    } else {
      seeq.data.update('please give me some input value...')
    }
  }

  this.getData = function () {
    if( this.isGettingData){
      seeq.data.loading.style.display = 'block' 
    }
    axios({
        method: "get",
        url: seeq.url + seeq.fetchSearchInput + seeq.urlEnd,
        responseType: "json"}).then( function(response){

          var { pages } = response.data.query
          seeq.extract
          Object.keys(pages).map(function(field){
            seeq.extract = pages[ field ]
          })
          if(response){
            if (seeq.extract.extract){
              seeq.data.update(seeq.extract.extract)

              // move total length here to avoid re-render every counting.
              seeq.seq.setTotalLenghtCounterDisplay()
              seeq.isGettingData = false
              seeq.data.loading.style.display = 'none'  
             
              // seeq.extractLinesParagraph()
            } else {
              seeq.data.update("sorry, please try again..")
              seeq.isGettingData = false
              seeq.data.loading.style.display = 'none'  
            }
          } else {
            seeq.data.update("no result found..")
            seeq.isGettingData = false
            seeq.data.loading.style.display = 'none'  
          }
        }).catch(function(error){
          seeq.data.update(error)
        })
  }

  this.setCursor = function(){
    this.seq.set()
    // seeq.jump()
  }

  this.play = function(){
    this.isPlaying = true 
    this.isReverse = false
    this.findMatchedPosition()

    // remove operator class if it's actived.
    // if(this.getHighlight.length > 1){
    //   this.getHighlight.forEach((el, index, arr) => {
    //     el.classList.remove("reverse-target")
    //   })
    // }
    // this.cursor.forEach( cursor => cursor.reverse = false)

    // avoiding speeded up increment.
    // clearTimeout(seeq.seq.timer)
  }

  this.splitArrayNoteAndOctave = function(inputText) {
    var output = [];
    var json = inputText.split(',');
    json.forEach(function (item) {
        output.push(item.split(/(\d+)/).filter(Boolean));
    });
    return output;
  }

  this.splitSingleNoteAndOctave = function(note){
    var output = []
    output.push(note[0].split(/(\d+)/).filter(Boolean));
    return output
  }

  this.updateMark = function(value, markType){
    if(markType == 'normal'){
      seeq.content.unmark({
        done: function( ) {
          seeq.content.mark(value, {
            separateWordSearch: true,
            done: function() {
              seeq.results = document.getElementsByTagName("mark");
              seeq.currentIndex = 0;
              // seeq.jump();
            }
          });
        }
      });
    } else if (markType == 'regex') {
      var targetRegExp = new RegExp(value, "gi")
      seeq.content.unmark({
        done: function( ) {
          seeq.content.markRegExp(targetRegExp, {
            done: function() {
              seeq.results = document.getElementsByTagName("mark");
              seeq.currentIndex = 0;
              // seeq.jump();
            }
          });
        }
      });
    }
  }

  this.getHighlightElement = function(){
    var data = seeq.data
    this.getHighlight = data.hltr.getHighlights(data.selectedText)
  }
  

  this.clock = function () {
    return this.masterClock[this.selectedClock]
  }

  // this.nextClock = function () {
  //   const previousClock = this.clock()
  //   if (previousClock) {
  //     previousClock.setRunning(false)
  //     previousClock.setCallback(() => { })
  //   }
  //   this.selectedClock = (this.selectedClock + 1) % this.masterClock.length
  //   this.clock().setRunning(!this.isPaused)
  //   this.clock().setCallback(() => this.run())

  //   // this.update()
  // }

  this.setSpeed = function (bpm) {
    if (this.clock().canSetBpm()) {
      bpm = clamp(bpm, 60, 300)
      this.clock().setBpm(bpm)
    }
  }

  this.modSpeed = function (mod = 0) {
    let bpm = this.clock()
    if (this.clock().canSetBpm()) {
      this.setSpeed(this.clock().getBpm() + mod)
    }
    seeq.seq.setBPMdisplay(bpm) 
  }

  
  function clamp (v, min, max) { return v < min ? min : v > max ? max : v } 
}

module.exports = Seeq