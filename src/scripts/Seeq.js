function Seeq(){

  
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

  // operation.
  this.isShiftPressed = false
  this.isUpPressed = false
  this.isDownPressed = false
  this.isMuted = false

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
  this.selectAreaLength = []
  

  this.searchValue = ""
  this.updateMarkType = "normal"

  this.matchedSymbol = "◊"
  this.startPos

  // paragraph row detector
  this.lines = ""
  this.textLineBuffers = ""

  this.isSelectDrag = false
  this.isReverse = false
  this.isGettingData = false

  this.matchedPosition = []
  this.matchedPositionWithLength = []
  this.matchedPositionLength = 1
  this.bpm = ""
  this.logoSeeq

  this.cursor = [{
    position: 0,
    isMuted: false,
    up: 0,
    down: 0
  }]
  this.selectIndex

  document.body.appendChild(this.appWrapper);

  this.data = new Data
  this.midi = new Midi()
  this.seq = new Sequencer()

  this.observer 
  this.observeConfig = { childList: true, subtree: true };
  this.indexTarget

  this.isPlaying = false
  this.getHighlight = []

  this.start = function(){
    this.wrapper_el.innerHTML += `
      <div class="header-wrapper">
      <div class="header">
        <div data-logo="seeq" class="title">seeq</div>
        <input data-fetch="fetch" placeholder="seeking for text..">
        <button data-gettext="gettext"> Enter </button>
      </div>
      <div class="header">
        <div class="title">find:</div>
        <input type="search" placeholder="">
        <button data-search="next">next</button>
        <button data-search="prev">prev</button>
      </div>
    </div>
    <div class="control-wrapper">
      <div class="header">
        <div class="title">RegExp:</div>
        <input type="search-regex" placeholder="">
      </div>
      <div class="control-info">
      <div class="control-panel">
        <div id="operator" class="operator"> press any key to operate..</div>
        <div>
          <button data-ctrl="set">set</button>
          <button data-ctrl="run">run</button>
          <button data-ctrl="rev">rev</button>
          <button data-ctrl="stop">stop</button>
          <button data-ctrl="notation-mode">mode</button>
        </div>
        </div>
        <div class="tempo">
          <p id="bpm"><b>120</b> bpm</p>
          <div class="counter">
            <p data-ctrl="current">-</p>
            /
            <p data-ctrl="total">--</p>
          </div>
        </div>
      </div>
      </div>
    <div>---------------------------------------------------------------------------------------------------</div> 
    `;

    this.data.build()
    this.midi.start()
    setTimeout(seeq.show,200)
    
  }

  this.show = function(){
    seeq.el.style.opacity = 1;
  }

  document.addEventListener("keydown", function(event){
    var op = document.getElementById("operator")
    switch (event.keyCode) {
      case 77: // 77 = "m" acronym for "mute"
        seeq.isShiftPressed = true;
        op.innerHTML = "<b>mute</b> : mute/unmute selected area." 
      break;
      case 85: 
        seeq.isUpPressed = true;
        op.innerHTML = "<b>up</b> : speed up tempo."  
      break;
      case 68: 
        seeq.isDownPressed = true;
        op.innerHTML = "<b>down</b> : speed down tempo."  
      break;
      default:
        break;
    }
    
  })
  document.addEventListener("keyup", function(){
    seeq.isShiftPressed = false;
    seeq.isUpPressed = false;
    seeq.isDownPressed = false;
    var opoff = document.getElementById("operator")
    opoff.innerText = "press any key to operate.." 
  })

  

  document.addEventListener("DOMContentLoaded", function() {
    this.searchInput = document.querySelector("input[type='search']")
    this.searchRegExp = document.querySelector("input[type='search-regex']")
    this.clearBtn = document.querySelector("button[data-search='clear']")
    this.prevBtn = document.querySelector("button[data-search='prev']")
    this.nextBtn = document.querySelector("button[data-search='next']")
    this.inputFetch = document.querySelector("input[data-fetch='fetch']")
    this.getText = document.querySelector("button[data-gettext='gettext']")
    this.setBtn = document.querySelector("button[data-ctrl='set']")
    this.runStep = document.querySelector("button[data-ctrl='run']")
    this.stopBtn = document.querySelector("button[data-ctrl='stop']")
    this.revBtn = document.querySelector("button[data-ctrl='rev']")
    // this.addBtn = document.querySelector("button[data-ctrl='add']")
    this.notationMode = document.querySelector("button[data-ctrl='notation-mode']")
    // this.extractLines = document.querySelector("button[data-ctrl='extract-line']")
    this.logo = document.querySelector("div[data-logo='seeq']")
    var context = document.querySelector("p.masking")
    seeq.currentNumber = document.querySelector("p[data-ctrl='current']")
    seeq.totalNumber = document.querySelector("p[data-ctrl='total']")
    seeq.content = new Mark(context)
    seeq.logoSeeq = new Mark( this.logo )

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
        seeq.searchValue = this.value;
        var targetRegExp = new RegExp(seeq.searchValue, "gi")
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
                  seeq.findMatchedPosition()
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
        seeq.jump();
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

      this.getText.addEventListener("click",function(){ 
        seeq.data.clear()
        if( seeq.fetchSearchInput !== ""){
          seeq.isGettingData = true
          seeq.getData()
        } else {
          seeq.data.update('no input value...')
        }
      })

      this.setBtn.addEventListener("click", function(){
        seeq.setCursor()
      })

      this.runStep.addEventListener("click", function(){
        seeq.isPlaying = true 
        seeq.isReverse = false

        // avoiding speeded up increment.
        clearTimeout(seeq.seq.timer)
        seeq.findMatchedPosition()
        seeq.runStep()
      })


      this.stopBtn.addEventListener("click", function(){
        seeq.isPlaying = false
        seeq.seq.stop()
        seeq.data.hltr.removeHighlights();
      })

      this.revBtn.addEventListener("click", function () {
        seeq.isReverse = true

        // refresh position avoiding messed up trigger.
        seeq.findMatchedPosition()
      })

      // this.addBtn.addEventListener("click", function(){
      //   console.log("this.addBtn", seeq.isShiftPressed)
      // })

      this.notationMode.addEventListener("click", function(){
        // separated search mode from toggle mode 
        // to avoid messing up when cursor is actived.
        seeq.toggleIsSearchModeChanged() 
        seeq.textConvertor()
      })

      // observing when Highlight elements inserted into DOM.
      // handle add/remove/mute/unmute highlight.
      this.observeCallback = function(mutationsList, observer) {
        for(var mutation of mutationsList) {
          if (mutation.type == 'childList' && mutation.target.nodeName == 'SPAN' ) {
            mutation.target.addEventListener("click", function(e){
              seeq.isMuted = !seeq.isMuted
              var indexTarget, muteTarget
              seeq.getHighlight.forEach( ( el, index ) => {
                if( el.dataset.timestamp == mutation.target.dataset.timestamp){
                  seeq.selectIndex = index
                }
              })
              if(seeq.isShiftPressed){
                muteTarget = seeq.getHighlight[seeq.selectIndex]
                if( seeq.isMuted){
                  muteTarget.classList.add("mute-target")
                  seeq.cursor[seeq.selectIndex].isMuted = true
                } else {
                  muteTarget.classList.remove("mute-target")
                  seeq.cursor[seeq.selectIndex].isMuted = false
                }
              } else if(seeq.isUpPressed){
                muteTarget = seeq.getHighlight[seeq.selectIndex]
                muteTarget.classList.add("up-target")
                seeq.cursor[seeq.selectIndex].up += 5
              } else {
                seeq.removeHighlightsEl(seeq.selectIndex)
                seeq.data.hltr.removeHighlights(mutation.target);
                seeq.sortingIndex()
                seeq.getHighlightAfterSelect() //sorting highlight element.
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


  // this.muteSelection = function( index ){
  //   // this.cursor[index]
  //   this.selectIndex = index
  // }


  this.findHighlightIndex = function(target){
    var indexTarget
    seeq.getHighlight.forEach( ( el, index ) => {
      if( el.dataset.timestamp == target.timestamp){
        indexTarget = index
        return indexTarget
      }
    })
  }

  this.removeHighlightsEl = function(index){
    this.matchedSelectPosition.splice(index, 1)
    this.selectAreaLength.splice(index, 1)
    this.cursor.splice(index, 1)
  }

  this.getSelectionText = function() {
    var text = "";
    if (window.getSelection) {
      text = window.getSelection().toString();
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

    if(this.textSelect !== ""){
      length = this.textSelect.length
      search = new RegExp(this.textSelect, "gi")
      // this.matchedSelectPosition = []
      while (match = search.exec(searchText)) {
        this.startPos = match.index
        this.matchedSelectPosition.push( this.startPos )
      }
      this.isSelectDrag = true
    } else {
      this.isSelectDrag = false
    }
    this.selectAreaLength.push(this.startPos + length)
  }

  this.toggleIsSearchModeChanged = function(){
    this.isSearchModeChanged = !this.isSearchModeChanged
  }

  this.addSequencer = function(){
    this.cursor.push({ 
      position: this.startPos,
      isMuted: false,
      up: 1,
      down: 1
    })
    this.sortingIndex()
  }
  
  this.sortingIndex = function(){
    this.matchedSelectPosition.sort(function (a, b) { return a - b });
    this.selectAreaLength.sort(function (a, b) { return a - b });
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
    // console.log("this.lines", this.lines)
    // seeq.data.updateWithCursor(this.textLineBuffers)
  }

  this.setBPMdisplay = function( msg ){
    this.bpm = document.getElementById("bpm")
    this.bpm.innerHTML = "<b>" + msg + "</b>" + " " + "bpm"
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

    if(seeq.seq.isCursorActived){
      this.setCursor()
    }
  }

  this.addCursorWhenSelectRange = function(){
    this.addSequencer()
    // this.seq.set()
    // this.findMatchedPosition()
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
      this.sendOsc() 
    }
  }

  this.sendOsc = function(){
    // re-render to get new value everytime.
    var message = new OSC.Message('/ding', Math.random());  
    osc.send(message)
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
      if( !this.isReverse){
        while( match = search.exec(searchText)){
          this.matchedPosition.push(match.index + 1)
        }
      } else {
        while (match = search.exec(searchText)) {
          this.matchedPosition.push(match.index - 1)
        } 
      }
        // if search value = word.
      if( this.searchValue.length > 1 ){
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
    console.log("match matchedPositionWithLength", this.matchedPositionWithLength)
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
        })
  }

  this.setCursor = function(){
    this.seq.set()
    // seeq.jump()
  }

  this.runStep = function(){
    this.seq.increment()
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

  this.getHighlightAfterSelect = function(){
    var data = seeq.data
    this.getHighlight = data.hltr.getHighlights(data.selectedText)
  }
  
  
  
}