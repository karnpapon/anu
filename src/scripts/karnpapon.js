function Karnpapon(){

  this.input = ""

  this.seq = new Sequencer();

  this.container = document.createElement("div")
  this.container.className = "container"
  this.wrapper = document.createElement("div")
  this.wrapper.className = "main-wrapper"
  this.wrapper_el = document.createElement("div")
  this.wrapper_el.className = "header-wrapper"
  this.container.appendChild(this.wrapper)
  this.wrapper.appendChild(this.wrapper_el)

  document.body.appendChild(this.container)

  this.start = function(){
    // this.wrapper_el.innerHTML += `<button id='btn-fetch' class='fetch-btn'> click </button>`; 
    // this.wrapper_el.innerHTML += `<input id='input-fetch' class='input-fetch'>  </input>`; 
    // this.wrapper.innerHTML += `<image id='img-placeholder' src="" class="avt-img"> </image>`; 
    
    // let el = document.getElementById('btn-fetch')
    // let inputFetch = document.getElementById('input-fetch')
    // el.addEventListener('click', this.fetchData)
    // inputFetch.addEventListener('change', this.handleInputChange)

    this.wrapper.innerHTML += `
    <div id="sequencer" class="sequencer">
      <table id="gridseq" class="grid-sequencer"></table>
    </div>`; 

    this.seq.build()
  }

  this.handleInputChange = function(e){
    karnpapon.input = e.target.value
  }

  this.fetchData = function(){
    axios.get(`https://api.github.com/users/${karnpapon.input}`).then(
      (resolve, reject) => {
        document.getElementById('img-placeholder').src = resolve.data.avatar_url
      }
    )
  }
}