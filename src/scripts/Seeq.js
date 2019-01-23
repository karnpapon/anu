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

  // this.container = document.createElement("div")
  // this.wrapper = document.createElement("div")
  // this.container.className = "header"
  // this.wrapper.className = "content"

  // document.body.appendChild(this.container)
  // document.body.appendChild(this.container)

  this.start = function(){
    // this.container.innerHTML += `
    // <input type=\"search\" placeholder=\"Lorem\">
    // <button data-search="next">&darr;</button>
    //   <button data-search="prev">&uarr;</button>
    //   <!-- <button id="clear">✖</button> -->
    // </input>
    // `
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
      current = seeq.results[seeq.currentIndex];
      current.classList.add(this.currentClass);
      console.log("current length", current)
      if (current.length) {
        current.classList.remove(this.currentClass);
        position = current.offsetTop() - offsetTop;
        window.scrollTo(0, position);
      }
    }
  }

  this.nextBtn.addEventListener("click", function(){
    if(seeq.results.length){
      seeq.currentIndex += 1
    }
     if (seeq.currentIndex < 0) {
       seeq.currentIndex = seeq.results.length - 1;
     }
     if (seeq.currentIndex > seeq.results.length - 1) {
       seeq.currentIndex = 0;
     }
    seeq.jump();
  })

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