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
  this.isModeChanged = false
  this.extract = "" // text buffers
  this.searchValue = ""
  this.updateMarkType = "normal"
  this.content

  document.body.appendChild(this.el);

  this.fetchDataSection = new Data
  this.seq = new Sequencer()

  this.isPlaying = false

  this.start = function(){

    this.wrapper_el.innerHTML += `
      <div class="header-wrapper">
      <div class="header">
        <div class="title">seeq:</div>
        <input data-fetch="fetch" placeholder="seeking for text..">
        <button data-gettext="gettext"> Enter </button>
      </div>
      <div class="header">
        <div class="title">find:</div>
        <input type="search" placeholder="">
        <button data-search="next">next</button>
        <button data-search="prev">prev</button>
        <!-- <button id="clear">✖</button> -->
      </div>
    </div>
    <div class="control-wrapper">
      <div class="header">
        <div class="title">RegExp:</div>
        <input type="search-regex" placeholder="">
        <button data-ctrl="play">⊛</button>
        <button data-ctrl="stop">⊘</button>
        <button data-ctrl="notation-mode">⟳</button>
      </div>
      <!-- <div class="control-btn">
      </div> -->
      <div class="control-info">
        <p>120 bpm</p>
        <div class="counter">
          <p data-ctrl="current">-</p>
          /
          <p data-ctrl="total">--</p>
        </div>
      </div>
      </div>
    <div>------------------------------------------------------------------------------------------------------</div> 
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
    this.stopBtn = document.querySelector("button[data-ctrl='stop']")
    this.notationMode = document.querySelector("button[data-ctrl='notation-mode']")
    var context = document.querySelector("div.content")
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
                seeq.currentIndex = 0;
                seeq.jump();
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
                seeq.currentIndex = 0;
                seeq.jump();
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
        seeq.getData()
      })


      this.playBtn.addEventListener("click", function(){
        seeq.isPlaying = true
        seeq.play()
      })

      this.stopBtn.addEventListener("click", function(){
        seeq.isPlaying = false
        seeq.stop()
      })


      this.notationMode.addEventListener("click", function(){
        var target = new RegExp(seeq.searchValue, "gi")
        var targetSpace = new RegExp("\\n" + seeq.searchValue, "g")
        seeq.isModeChanged = !seeq.isModeChanged
        var update = seeq.searchValue
        // var ps = document.getElementsByTagName('p');
        // var p = ps[3];
        // var lines = lineWrapDetector.getLines(p);
        // var lineRow = [] 
        // var lineCol = []
        // var row = lines.length
        
        // for(var i=0; i< lines.length; i++){
        //   for(var j=0; j<lines[i].length; j++){
        //     lineRow = initDocument.text.innerText.replace(target, "+")
        //     // lineRow[i] += lines[i][j].innerText.replace(target, "+")
        //   }
    
        // }
        
        // turn matched letter/words into symbols
        var notation = seeq.fetchDataSection.text.innerText.replace(target, "+")
        var switchText = notation.replace(/[^+(|):;,\/"' \.,\-]/g, "-")
        // actual contents
        var fetchText = seeq.extract.extract
    
        // initDocument.clear() 
        // initDocument.update(seeq.isModeChanged? switchText:fetchText) 
        // seeq.updateMark(seeq.isModeChanged? "+":update, seeq.updateMarkType) 
    
        if( seeq.isModeChanged ){
          seeq.updateMarkType = "normal"
          seeq.fetchDataSection.clear() 
          seeq.fetchDataSection.update(switchText) 
          seeq.updateMark("+", seeq.updateMarkType)
        } else {
          seeq.updateMarkType = "regex"
          seeq.fetchDataSection.clear() 
          seeq.fetchDataSection.update(fetchText) 
          seeq.updateMark(update, seeq.updateMarkType)
        }
      })


  });

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
            } else {
              seeq.fetchDataSection.update("sorry, please try again..")
            }
          } else {
            seeq.fetchDataSection.update("no result found..")
          }
        })
  }

  this.play = function(){
    this.seq.play()
  }

  this.stop = function(){
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
              seeq.jump();
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
              seeq.jump();
            }
          });
        }
      });
    }
  }

  
}