

function Seeq(){
  
  // components installation.
  const Data = require('./data')
  const Sequencer = require('./sequencer')
  const Clock = require('./clock')
  const IO = require('./io')
  const Keys = require('./keys')
  const Metronome = require('./metronome')
  const { $, el, qs, scale, isChar } = require('./utils')

  this.data = new Data(this)
  this.io = new IO(this)
  this.seq = new Sequencer(this)
  this.keys = new Keys(this)
  this.masterClock = [new Clock(120)] 
  this.metronome = new Metronome()
  this.selectedClock = 0

  // ------------------------------------

  // DOM installation.
  this.logoSeeq
  this.appWrapper = el("appwrapper")
  this.el = el("app");
  this.el.style.opacity = 0;
  this.el.id = "seeq";
  this.appWrapper.appendChild(this.el)
  this.wrapper_el = el("div")
  this.wrapper_el.className = "wrapper-control"
  this.el.appendChild(this.wrapper_el)
  this.parentTarget = document.getElementsByClassName("wrapper-control")
  this.infoDisplay
  document.body.appendChild(this.appWrapper);

  // ------------------------------------

  // Ajax Request Initialize.
  this.url = "https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro&explaintext&redirects=1&titles="
  this.urlEnd = "&redirects=1"

  // Ajax Status.
  this.isGettingData = false

  // -----------------------------------

  // Console operation.
  this.isActive = false
  this.isConfigToggle = false
  this.isLinkToggle = false
  this.isUDPToggled = false
  this.isReverse = false
  this.isPlaying = false
  this.isBPMtoggle = false

  // Console status display.
  this.bpmNumber
  this.metronomeBtn
  this.currentNumber
  this.totalNumber
  this.cpuUsage
  this.isInfoToggleOpened = false

  this.devBtn

  // -----------------------------------

  // marks.
  this.content
  this.results = []
  this.currentClass = "current"
  this.txt = ""
  this.isSearchModeChanged = false
  this.matchedSymbol = "◊"
  this.updateMarkType = "normal"
  
  // -----------------------------------

  // Input. 
  this.fetchSearchInput = ""
  this.searchValue = ""
  this.isRegExpSearching = false

  // -----------------------------------

  // text buffers.
  this.extract = "" 
  this.switchText = ""
  this.fetchText = ""
  this.notation = ""
  this.textSelect = ""
  this.textBuffers = ""

  // -----------------------------------

  // Cursor.
  this.currentIndex = 0
  this.startPos
  this.matchedPosition = []
  this.matchedPositionWithLength = []
  this.matchedPositionLength = 1

  this.cursor = [{
    position: 0,
    isCursorOffsetReverse: false,
    isMuted: false,
    isRetrigger: false,
    up: 0,
    down: 0,
    note: [],
    length: "",
    velocity: "",
    octave: "",
    counter: 0,
    channel: 0,
    reverse: false,
    UDP: ["D3C"]
  }]

  this.triggerCursor = {
    note: [],
    length: "",
    velocity: "",
    octave: "",
    channel: 0,
    counter: 0,
    UDP: ["73C"]
  }

  // -----------------------------------

  // paragraph row detector ( Disabled )
  this.lines = ""
  this.textLineBuffers = ""

  // -----------------------------------

  // Selection.
  this.isTextSelected = false
  this.getHighlight = []
  this.selectedIndexRef = ""
  this.filteredPos = ""
  this.matchedSelectPosition = []
  this.selectedRangeLength = []
  this.baffles = []
  
  // Observered Selection.
  this.observer 
  this.selectIndex
  this.observeConfig = { childList: true, subtree: true };

  // -----------------------------------
 
  this.start = function(){
    this.wrapper_el.innerHTML += `
      <div class="controller-wrapper">
        <div class="header-wrapper">
          <div class="header">
            <div data-logo="seeq" class="title">input</div>
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
              <button data-ctrl="udp">udp</button>
              <button data-ctrl="dev">dev</button>
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
                  <b>BPM : </b>
                </div>
                <div class="tempo-details">
                  <b>TME : </b>
                </div>
                <div class="tempo-details">
                  <b>LEN : </b> 
                </div>
                <div class="tempo-details">
                  <b>CPU : </b>
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
      <div id="info-bar">
        <div data-ctrl="information" class="limit">
          <div class="textfx">seeq | livecoding environtment </div>
        </div> 
      </div>
    `;

    this.infoDisplay = $("info-bar")
    this.info = qs("div[data-ctrl='information']")

    this.data.build()
    this.keys.build()
    this.io.start()
    setTimeout(seeq.show,200)
  }

  this.show = function () {
    seeq.el.style.opacity = 1;
  }

  document.addEventListener("DOMContentLoaded", function() {
    this.searchInput = qs("input[type='search']")
    this.searchRegExp = qs("input[type='search-regex']")
    this.prevBtn = qs("button[data-search='prev']")
    this.nextBtn = qs("button[data-search='next']")
    this.configBtn = qs("button[data-search='cfg']")
    this.inputFetch = qs("input[data-fetch='fetch']")
    this.getTextBtn = qs("button[data-gettext='gettext']")
    this.linkBtn = qs("button[data-ctrl='link']")
    this.clearBtn = qs("button[data-ctrl='clear']")
    this.nudgeBtn = qs("button[data-ctrl='nudge']")
    this.udpBtn = qs("button[data-ctrl='udp']")
    this.revBtn = qs("button[data-ctrl='rev']")
    this.addBtn = qs("button[data-ctrl='add']")
    this.subtractBtn = qs("button[data-ctrl='subtract']")
    // this.notationMode = qs("button[data-ctrl='notation-mode']")
    // this.extractLines = qs("button[data-ctrl='extract-line']")
    this.logo = qs("div[data-logo='seeq']")
    var context = qs("p.marked-text")
    seeq.bpmNumber = qs("p[data-ctrl='bpm']")
    seeq.metronomeBtn = qs("button[data-ctrl='metronome']")
    seeq.currentNumber = qs("p[data-ctrl='current']")
    seeq.totalNumber = qs("p[data-ctrl='total']")
    seeq.cpuUsage = qs("p[data-ctrl='cpu']")
    
    seeq.textFX = document.getElementsByClassName('textfx')
    seeq.content = new Mark(context)
    seeq.logoSeeq = new Mark( this.logo )

    seeq.metronome.init()
    seeq.fetch()

    seeq.baffles = baffle('.textfx', {
      characters: ' ░▒█▓█></',
      speed: 50
    });
  
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

        // seeq.logoSeeq.unmark({
        //   done: function(){
        //     seeq.logoSeeq.mark(seeq.searchValue, {
        //       className: "logo-seeq"
        //     })
        //   }
        // })
      });

      this.searchRegExp.addEventListener("input", function() {
        let targetRegExp

        seeq.isRegExpSearching = true
        
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
                  seeq.info.style.opacity = 0
                  seeq.keys.infoShow()
                  seeq.keys.keyDisplayElCmd.innerHTML = `/${displayText}/gi`
                  seeq.keys.kbInfoOperatorIcon.innerHTML = ""
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
        
        if(seeq.isConfigToggle){
          this.classList.add("toggle-btn")
          seeq.keys.infoOpr8Hide()
          seeq.keys.infoMidiShow()
          seeq.keys.infoShow()
          seeq.info.style.opacity = 0
          targetCursor = seeq.setOutputMsg(targetCursor)
        } else {
          seeq.keys.infoHide()
          seeq.info.style.opacity = 1
          seeq.keys.infoMidiHide()
          this.classList.remove("toggle-btn")
          seeq.keys.infoOpr8Show()
        }
      })

      this.getTextBtn.addEventListener("click",function(){ 
        seeq.data.clear()
        seeq.fetch()
      })

      this.linkBtn.addEventListener("click", function(){
        seeq.isLinkToggle = !seeq.isLinkToggle
        this.classList.toggle("toggle-btn")

        if (seeq.isLinkToggle) {
          socket.connect(0)
        } else {
          socket.disconnect(0);
        }
      })

    this.udpBtn.addEventListener("click", function () {
      seeq.isUDPToggled = !seeq.isUDPToggled
      this.classList.toggle("toggle-btn")
    })

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
      // handle operation on highlight.
      this.observeCallback = function(mutationsList, observer) {
        for(var mutation of mutationsList) {
          if (mutation.type == 'childList' && mutation.target.nodeName == 'SPAN' ) {

            mutation.target.addEventListener("mousedown", function(){
              let targetHighlight, targetCursor

              seeq.getHighlight.forEach( ( el, index, arr ) => {
                if( el.dataset.timestamp == mutation.target.dataset.timestamp){
                  seeq.selectIndex = index
                }
              })

              targetHighlight = seeq.getHighlight[seeq.selectIndex]
              targetCursor = seeq.cursor[seeq.selectIndex]

              if(seeq.keys.isRetriggered){
                targetHighlight.classList.add("re-trigger")
                targetCursor.isRetrigger = true
              } 

            })

            mutation.target.addEventListener("mouseup", function(){
              let targetHighlight, targetCursor

              seeq.getHighlight.forEach( ( el, index, arr ) => {
                if( el.dataset.timestamp == mutation.target.dataset.timestamp){
                  seeq.selectIndex = index
                }
              })

              targetHighlight = seeq.getHighlight[seeq.selectIndex]
              targetCursor = seeq.cursor[seeq.selectIndex]

              if(seeq.keys.isRetriggered){
                targetCursor.isRetrigger = false
                targetHighlight.classList.remove("re-trigger")
              }

            })


            mutation.target.addEventListener("click", function(e){
              seeq.isActive = !seeq.isActive
              let targetHighlight, targetCursor

              seeq.getHighlight.forEach( ( el, index, arr ) => {
                if( el.dataset.timestamp == mutation.target.dataset.timestamp){
                  seeq.selectIndex = index
                }
              })

              targetHighlight = seeq.getHighlight[seeq.selectIndex]
              targetCursor = seeq.cursor[seeq.selectIndex]

              // when keys is pressed,then operates.
              if (seeq.keys.keyboardPress ){

                // keys "m", muted.
                if (seeq.keys.isMutePressed){
                  if (seeq.isActive){
                    targetHighlight.classList.add("mute-target")
                    targetCursor.isMuted = true
                  } else {
                    targetHighlight.classList.remove("mute-target")
                    targetCursor.isMuted = false
                  }
                } 

                // keys "r", reverse
                if (seeq.keys.isReversedCursorPressed){
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

                // keys "i", midi config.
                if (seeq.keys.isShowInfoPressed){
                  if (seeq.isActive){
                    seeq.isInfoToggleOpened = true
                    seeq.keys.infoOpr8Hide()
                    seeq.keys.infoMidiShow()
                    seeq.info.style.opacity = 0
                    targetHighlight.classList.add("select-highlight")
                    targetCursor = seeq.setOutputMsg(targetCursor)
                  } else {
                    seeq.keys.infoMidiHide()
                    targetHighlight.classList.remove("select-highlight")
                    seeq.isInfoToggleOpened = false;
                    seeq.keys.isShowInfoPressed = false;
                    seeq.keys.infoOpr8Show()
                  }
                }

                // keys "x", delete.
                if (seeq.keys.isDeletePressed){
                  seeq.removeHighlightsEl(seeq.selectIndex)
                  seeq.data.hltr.removeHighlights(mutation.target);
                  if (seeq.selectedRangeLength.length > 0){
                    seeq.sortingIndex()
                    seeq.getHighlightElement() //sorting highlight element.
                  } else {
                    seeq.clear()
                  }
                }
              }
              else {
              
              }
            })
          }
        }
      };
      
      this.observer = new MutationObserver(this.observeCallback); 
      this.observer.observe(seeq.data.highlightedText, seeq.observeConfig);

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

  this.retrieveCursor = function(){
    let reset = [{
      position: 0,
      isCursorOffsetReverse: false,
      isMuted: false,
      isRetrigger: false,
      up: 0,
      down: 0,
      note: [],
      length: "",
      velocity: "",
      octave: "",
      counter: 0,
      channel: 0,
      reverse: false,
      UDP: ["D3C"]
    }]
    return reset 
  }

  // this.resetInfoBar = function(){
  //   seeq.info.innerHTML = seeq.retrieveInfoDisplay()
  // }


  this.clear = function(){
    this.isPlaying = false
    this.seq.stop()
    this.data.hltr.removeHighlights();
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
    seeq.setCursor()
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

    if (window.getSelection) {
      text = window.getSelection().toString()
    } else if (document.selection && document.selection.type != "Control") {
      text = document.selection.createRange().text;
    }
    return text;
  }

  this.getSelectionTextPosition = function(){
    var searchText = seeq.data.cursorText.innerText
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
    this.selectedRangeLength.push(this.filteredPos + length)
  }

  this.toggleIsSearchModeChanged = function(){
    this.isSearchModeChanged = !this.isSearchModeChanged
  }

  this.setOutputMsg = function(outputMsg){
    let addNote, addLength, addVelocity, addChannel,
    note = outputMsg.note === undefined? "":outputMsg.note,
    octave = outputMsg.octave === undefined? "":outputMsg.octave,
    length = outputMsg.length === undefined? "":outputMsg.length,
    velocity = outputMsg.velocity === undefined? "":outputMsg.velocity,
    ch = outputMsg.channel === undefined? "": outputMsg.channel

    var noteWithOct = [];
    for (var i = 0; i < note.length; i++) {
      noteWithOct.push(`${ note[i] }${ octave[i]}`)
    }

    seeq.keys.kbInfoMidiConfig.innerHTML = `
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
    addNote = $('addnote')
    addLength = $('addlength')
    addVelocity = $('addvelocity')
    addChannel = $('addchannel')

    addNote.addEventListener("input", function(e){ note = this.value })
    addLength.addEventListener("input", function(e){ length = this.value })
    addVelocity.addEventListener("input", function(e){ velocity = this.value })
    addChannel.addEventListener("input", function(e){ ch = this.value })
    qs('form.info-input').addEventListener('submit', function (e) {
      e.preventDefault();
      let noteAndOct, len = [], vel = []
      if (note.indexOf(',') > -1) { 
        noteAndOct = seeq.splitArrayNoteAndOctave(note)
      } else {
        noteAndOct = seeq.splitSingleNoteAndOctave(note)
      }

      if (length.indexOf(',') > -1) { 
        len = length.split(',')
      } else {
        len.push(length)
      }

      if (velocity.indexOf(',') > -1) { 
        vel = velocity.split(',')
      } else {
        vel.push(velocity)
      }

      let noteOnly = []
      let octOnly = []

      noteAndOct.forEach(item => {
        noteOnly.push(item[0])
        octOnly.push(parseInt( item[1] ))
      })

      
      outputMsg.note = noteOnly
      outputMsg.octave = octOnly
      outputMsg.length = parseInt( len )
      outputMsg.velocity = parseInt( velocity )
      outputMsg.channel = parseInt( ch )
      
      // UDP adapter.
      let convertedChan = seeq.getUdpValue(parseInt(ch))
      // let convertedVelocity = seeq.getUDPvalFrom127(parseInt(velocity))
      // let convertedLen = seeq.getUdpValue(parseInt( length ))

      let udpNote = []
      let udpLength = []
      let udpVelocity = []
      outputMsg.UDP = []

      for (var i = 0; i < noteOnly.length; i++) {
        udpLength.push(seeq.getUdpValue(parseInt(len[i])))
        udpNote.push(seeq.getUdpNote(noteOnly[i]))
        udpVelocity.push(seeq.getUDPvalFrom127(parseInt(vel[i])))
      }

      for(var i = 0; i< noteOnly.length; i++){
        outputMsg.UDP.push(`${convertedChan}${octOnly[i]}${udpNote[i]}${udpVelocity[i]}${udpLength[i]}` )
      }

      console.log("UDP msg", outputMsg.UDP)

      seeq.triggerCursor['counter'] = 0
    })

    return outputMsg
  }

  this.addSequencer = function(){
    let newCursor = this.retrieveCursor()
    this.cursor.push(newCursor[0])
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
      this.notation = seeq.data.cursorText.innerText.replace(target, this.matchedSymbol)
    } else {
      this.notation = seeq.data.cursorText.innerText
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
    var searchText = seeq.data.cursorText.innerText
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
      seeq.data.update('please give some input value...')
    }
  }

  this.getData = function () {
    if( this.isGettingData){
      // seeq.data.loading.style.display = 'block' 
      seeq.data.loading.classList.add("loading")
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
              seeq.data.update(seeq.extract.extract.toUpperCase())
              // move total length here to avoid re-render every counting.
              seeq.seq.setTotalLenghtCounterDisplay()
              seeq.isGettingData = false
              seeq.data.loading.classList.remove("loading")
              // seeq.extractLinesParagraph()
            } else {
              seeq.data.update("sorry, please try again..")
              seeq.isGettingData = false
              seeq.data.loading.classList.remove("loading") 
            }
          } else {
            seeq.data.update("no result found..")
            seeq.isGettingData = false
            seeq.data.loading.classList.remove("loading")
          }
        }).catch(function(error){
          seeq.data.update(error)
        })
  }

  this.setCursor = function(){
    this.seq.set()
  }

  this.textBaffleFX = function(){
    seeq.baffles.reveal(1000);
  }

  this.play = function(){
    this.isPlaying = true 
    this.isReverse = false
    this.findMatchedPosition()
  }

  this.splitArrayNoteAndOctave = function(inputText) {
    var output = [];
    var arr = inputText.split(',');
    arr.forEach(function (item) {
        output.push(item.split(/(\d+)/).filter(Boolean));
    });
    return output;
  }

  this.splitSingleNoteAndOctave = function(note){
    var output = []
    output.push(note.split(/(\d+)/).filter(Boolean));
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

  this.retrieveInfoDisplay = function(){
    return `<div class="textfx">seeq | livecoding environtment </div>`
  }

  this.getHighlightElement = function(){
    var data = seeq.data
    this.getHighlight = data.hltr.getHighlights(data.highlightedText)
  }
  

  this.clock = function () {
    return this.masterClock[this.selectedClock]
  }

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

  this.getUdpNote = function(note){
    let udpNote
    if (note.length == 2) {
      switch (note) {
        case 'Db':
          udpNote = 'c'
          break;
        case 'Eb':
          udpNote = 'F'
          break;
        case 'Gb':
          udpNote = 'f'
          break;
        case 'Ab':
          udpNote = 'g'
          break;
        case 'Bb':
          udpNote = 'a'
          break;
      }
    } else if (note.length == 1) {
      udpNote = note
    }
    return udpNote
  }

  this.getUdpValue = function(val){
    let conversion, mapRange
    if (val > 9 && val < 17){
      mapRange = val - 10 
      conversion = String.fromCharCode(65 + mapRange ); 
    } else if ( val < 9 && val > (-1) ) {
      conversion = val
    } else {
      conversion = 'D' //fallback.
    }
    return conversion
  }

  this.getUDPvalFrom127 = function(val){
    let limit = 36
    let mapTo36 = Math.floor( scale(val, 0,127,0, limit - 1) )
    let mapToCharRange, temp, itobase36
    if(mapTo36 > 9 && mapTo36 < limit){
      mapToCharRange = mapTo36 - 10
      temp = String.fromCharCode(65 + mapToCharRange );

      // limit to only Char range 
      // range from 37 ~ 131 = A - Z.
      itobase36 = isChar(temp)? temp : mapTo36
    } else if ( mapTo36 < 9) {
      itobase36 = mapTo36
    } else {
      itobase36 = 'D' //fallback.
    }
    return itobase36
  }

  
  function clamp (v, min, max) { return v < min ? min : v > max ? max : v } 
}

module.exports = Seeq