function Seeq(){
  
  this.searchInput = document.querySelector("input[type='search']")
  this.clearBtn = document.querySelector("button[data-search='clear']")
  this.prevBtn = document.querySelector("button[data-search='prev']")
  this.nextBtn = document.querySelector("button[data-search='next']")

  this.content = new Mark( document.querySelector("div.content") )
  this.results = []
  this.currentClass = "current"
  this.offsetTop = 50
  this.currentIndex = 0

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
      var position, current
      var nextEl, prevEl

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
        // position = seeq.results[seeq.currentIndex].offsetTop- this.offsetTop;
        // window.scrollTo(0, position);
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
     if (seeq.currentIndex > seeq.results.length - 1) { // reset cursor to top.
       seeq.currentIndex = 0;
     }
    seeq.jump();
  })

  this.prevBtn.addEventListener("click", function(){
    if(seeq.results.length){
      seeq.currentIndex -= 1
    }
    if (seeq.currentIndex < 0) {
      seeq.currentIndex = seeq.results.length - 1; // prev btn case to get outbound top to show at to bottom.
    }
    seeq.jump();
  })

  this.sendOsc = function(){
    osc.send(message)
  }

  // this.handleInputChange = function(e){
  //   seeq.input = e.target.value
  // }

  // this.fetchData = function(){
  //   axios.get(`https://api.github.com/users/${seeq.input}`).then(
  //     (resolve, reject) => {
  //       document.getElementById('img-placeholder').src = resolve.data.avatar_url
  //     }
  //   )
  // }
}