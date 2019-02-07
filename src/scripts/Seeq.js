function Seeq(){

  this.el = document.createElement("app");
  this.el.style.opacity = 0;
  this.el.id = "seeq";
  this.wrapper_el = document.createElement("div")
  this.wrapper_el.className = "wrapper-control"
  this.el.appendChild(this.wrapper_el)
  this.parentTarget = document.getElementsByClassName("wrapper-control")

  this.url = "https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro&explaintext&redirects=1&titles="
  this.urlEnd = "&redirects=1"

  this.content
  this.currentNumber
  this.totalNumber
  
  this.currentResult = []
  this.results = []
  this.currentClass = "current"
  this.offsetTop = 50
  this.currentIndex = 0
  this.fetchSearchInput = ""
  this.txt = ""
  this.isSearchModeChanged = false

  // text buffers
  this.extract = "" 
  this.switchText = ""
  this.fetchText = ""
  this.textAfterFoundMatched = ""
  this.notation = ""
  this.textSelect = ""
  this.matchedSelectPosition = []
  this.selectAreaLength = 0
  

  this.searchValue = ""
  this.updateMarkType = "normal"

  this.matchedSymbol = "+"

  // paragraph row detector
  this.lines = ""
  this.textLineBuffers = ""

  this.isSelectDrag = false

  this.matchedPosition = []

  document.body.appendChild(this.el);

  this.fetchDataSection = new Data
  this.seq = new Sequencer()

  this.isPlaying = false

  this.start = function(){
    this.wrapper_el.innerHTML += `
      <div class="header-wrapper">
      <div class="header">
        <div class="title">s/ee/q:</div>
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
          <button data-ctrl="play">set</button>
          <button data-ctrl="run">run</button>
          <button data-ctrl="stop">stop</button>
          <button data-ctrl="notation-mode">mode</button>
        </div>
        <div class="tempo">
          <p>120 bpm</p>
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

    this.fetchDataSection.build()
    setTimeout(seeq.show,200)
  }

  this.show = function(){
    seeq.el.style.opacity = 1;
  }

  document.addEventListener("DOMContentLoaded", function() {
    this.searchInput = document.querySelector("input[type='search']")
    this.searchRegExp = document.querySelector("input[type='search-regex']")
    this.clearBtn = document.querySelector("button[data-search='clear']")
    this.prevBtn = document.querySelector("button[data-search='prev']")
    this.nextBtn = document.querySelector("button[data-search='next']")
    this.inputFetch = document.querySelector("input[data-fetch='fetch']")
    this.getText = document.querySelector("button[data-gettext='gettext']")
    this.playBtn = document.querySelector("button[data-ctrl='play']")
    this.nextStep = document.querySelector("button[data-ctrl='run']")
    this.stopBtn = document.querySelector("button[data-ctrl='stop']")
    this.notationMode = document.querySelector("button[data-ctrl='notation-mode']")
    // this.extractLines = document.querySelector("button[data-ctrl='extract-line']")
    var context = document.querySelector("p.masking")
    seeq.currentNumber = document.querySelector("p[data-ctrl='current']")
    seeq.totalNumber = document.querySelector("p[data-ctrl='total']")
    seeq.content = new Mark(context)

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
                  seeq.findMatchedPosition()
                }
              }
            });
          }
        });
        seeq.updateMarkType = "normal"
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
          // prev btn case to get outbound top to show at to bottom.
          seeq.currentIndex = seeq.results.length - 1; 
        }
        seeq.jump();
      })

      this.getText.addEventListener("click",function(){ 
        seeq.fetchDataSection.clear()
        if( seeq.fetchSearchInput !== ""){
          seeq.getData()
        } else {
          seeq.fetchDataSection.update('no input value...')
        }
      })


      this.playBtn.addEventListener("click", function(){
        // seeq.isPlaying = true
        seeq.seq.refresh()
        seeq.setCursor()
      })

      this.nextStep.addEventListener("click", function(){
        seeq.isPlaying = true 
        seeq.nextStep()
      })


      this.stopBtn.addEventListener("click", function(){
        seeq.isPlaying = false
        seeq.seq.stop()
      })
      

      this.notationMode.addEventListener("click", function(){
        // separated search mode from toggle mode 
        // to avoid messing up when cursor is actived.
        seeq.toggleIsSearchModeChanged() 
        seeq.textConvertor()
      })

      // this.extractLines.addEventListener("click", function(){
      //   seeq.extractLinesParagraph()
      // })

  });

 

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
    var searchText = seeq.fetchDataSection.text.innerText
    var search = ""
    var match

    if(this.textSelect !== ""){
      search = new RegExp(this.textSelect, "gi")
      this.matchedSelectPosition = []
      while (match = search.exec(searchText)) {
        this.matchedSelectPosition = match.index
      }
      this.isSelectDrag = true
    } else {
      seeq.isSelectDrag = false
    }
    this.selectAreaLength = this.matchedSelectPosition + this.textSelect.length
  }

  // this.checkIsSelectDragActive = function(){
  //   this.isSelectDrag = this.textSelect !== ""? true:false
  // }

  this.toggleIsSearchModeChanged = function(){
    this.isSearchModeChanged = !this.isSearchModeChanged
  }

  // this.extractLinesParagraph = function(){
  //    // make eachline has linebreak 
  //   // before converting letters into dashes.
  //   for(var i=0; i< this.lines.length; i++){
  //     for(var j=0; j<this.lines[i].length; j++){
  //       this.textLineBuffers += this.lines[i][j].innerText
  //       this.textLineBuffers += " "
  //     }
  //     this.textLineBuffers += "<br/>"
  //   }
  //   seeq.fetchDataSection.updateWithCursor(this.textLineBuffers)
  // }

  
  

  this.textConvertor = function(){
    var target = new RegExp(seeq.searchValue, "gi")
   
    // turn matched letter/words into symbols
    if( seeq.searchValue !== ""){
      this.notation = seeq.fetchDataSection.text.innerText.replace(target, "+")
    } else {
      this.notation = seeq.fetchDataSection.text.innerText
    }

   
    this.switchText = this.notation.replace(/[^+(|):;,\/"' \.,\-]/g, "-")
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

  this.update = function(markType, modeContent, target ){
    seeq.updateMarkType = markType
    seeq.fetchDataSection.clear() 
    seeq.fetchDataSection.update(modeContent) 
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
    var searchText = seeq.fetchDataSection.text.innerText
    var search = new RegExp(this.searchValue,"gi")
    var match

    while( match = search.exec(searchText)){
      this.matchedPosition.push(match.index)
    }
  }

  this.getData = function () {
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
              seeq.fetchDataSection.update(seeq.extract.extract)

              // avoid re-render
              seeq.fetchDataSection.updateOnce( seeq.extract.extract)
              // move total length here to avoid re-render every counting.
              seeq.seq.setTotalLenghtCounterDisplay()
            } else {
              seeq.fetchDataSection.update("sorry, please try again..")
            }
          } else {
            seeq.fetchDataSection.update("no result found..")
          }
        })
  }

  this.setCursor = function(){
    seeq.seq.refresh()
    seeq.seq.set()
    // seeq.jump()
  }

  this.nextStep = function(){
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

  
}