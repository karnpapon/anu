function Seeq(){
  
  this.searchInput = document.querySelector("input[type='search']")
  this.clearBtn = document.querySelector("button[data-search='clear']")
  this.prevBtn = document.querySelector("button[data-search='prev']")
  this.nextBtn = document.querySelector("button[data-search='next']")
  this.inputFetch = document.querySelector("input[data-fetch='fetch']")
  this.getText = document.querySelector("button[data-gettext='gettext']")
  this.playBtn = document.querySelector("button[data-ctrl='play']")
  this.stopBtn = document.querySelector("button[data-ctrl='stop']")

  this.url = "https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro&explaintext&redirects=1&titles="
  this.urlEnd = "&redirects=1"

  this.content = new Mark( document.querySelector("div.content") )
  this.currentResult = []
  this.results = []
  this.currentClass = "current"
  this.offsetTop = 50
  this.currentIndex = 0
  this.fetchSearchInput = ""
  this.txt = ""


  this.seq = new Sequencer()

  this.isPlaying = false

  this.start = function(){
    this.searchInput.addEventListener("input", function() {
      var searchVal = this.value;
      seeq.content.unmark({
        done: function( ) {
          seeq.content.mark(searchVal, {
            separateWordSearch: true,
            done: function() {
              seeq.results = document.getElementsByTagName("mark");
              seeq.currentIndex = 0;
              seeq.jump();
            }
          });
        }
      });
    });
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

      if ( seeq.results[prevEl].className == this.currentClass){
        seeq.results[prevEl].classList.remove(this.currentClass);
      } else if (seeq.results[nextEl].className == this.currentClass ){
        seeq.results[nextEl].classList.remove(this.currentClass);
      }
      this.sendOsc() 
    }
  }

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
    initDocument.clear()
    seeq.getData()
  })

  this.inputFetch.addEventListener("input", function(){
    seeq.fetchSearchInput = this.value;
  })

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
          var extract
          Object.keys(pages).map(function(field){
            extract = pages[ field ]
          })
          if(response){
            initDocument.update(extract.extract)
          } else {
            initDocument.update("no result found..")
          }
        })
        console.log("initDocument.text.innerHTML.charAt( seeq.seq.currentIndex)", initDocument.text.innerHTML)
  }

  this.play = function(){
    this.seq.play()
  }

  this.stop = function(){
    this.seq.stop()
  }

  this.playBtn.addEventListener("click", function(){
    seeq.isPlaying = true
    seeq.play()
  })

  this.stopBtn.addEventListener("click", function(){
    seeq.isPlaying = false
    seeq.stop()
  })
}